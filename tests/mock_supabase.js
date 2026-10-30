(() => {
  const id='11111111-1111-4111-8111-111111111111';
  const raffleId='22222222-2222-4222-8222-222222222222';
  const db={
    ets_staff_members:[{user_id:id,role:'admin',enabled:true}],
    ets_raffles:[{id:raffleId,title:'Rifa de prueba V8',description:'Premio de prueba',category:'auto',ticket_price_cop:20000,total_numbers:100,draw_at:null,state:'draft',authorization_verified:false,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}],
    ets_raffle_audit:[],ets_prizes:[],ets_prize_images:[]
  };
  const audit=(table,op,old,now)=>{if(table!=='ets_prizes'&&table!=='ets_prize_images'&&table!=='ets_raffles')return;db.ets_raffle_audit.unshift({id:db.ets_raffle_audit.length+1,raffle_id:(now||old).raffle_id||(now||old).id,actor_id:id,operation:(table==='ets_prizes'?'PRIZE_':table==='ets_prize_images'?'PHOTO_':'')+op,old_data:old,new_data:now,created_at:new Date().toISOString()});};
  class Q {
    constructor(t){this.t=t;this.filters=[];this.kind='select';this.payload=null;this.expectOne=false;}
    select(){this.want=true;return this;}
    eq(k,v){this.filters.push([k,v]);return this;}
    order(){return this;}
    limit(){return this;}
    insert(v){this.kind='insert';this.payload=v;return this;}
    update(v){this.kind='update';this.payload=v;return this;}
    delete(){this.kind='delete';return this;}
    single(){this.expectOne=true;return this.exec();}
    maybeSingle(){this.expectOne=true;return this.exec();}
    then(resolve,reject){return this.exec().then(resolve,reject);}
    async exec(){
      let arr=(db[this.t]||[]).filter(row=>this.filters.every(([k,v])=>row[k]===v));
      let data=null;
      if(this.kind==='insert'){
        const row={...this.payload};if(!row.id)row.id=crypto.randomUUID();if(this.t==='ets_prizes'&&!row.updated_at)row.updated_at=new Date().toISOString();
        db[this.t].push(row);audit(this.t,'INSERT',null,{...row});data=[row];
      }else if(this.kind==='update'){
        const before=arr.map(x=>({...x}));arr.forEach((row,i)=>{Object.assign(row,this.payload);if(this.t==='ets_prizes')row.updated_at=new Date().toISOString();audit(this.t,'UPDATE',before[i],{...row});});data=arr;
      }else if(this.kind==='delete'){
        arr.forEach(row=>{db[this.t]=db[this.t].filter(x=>x!==row);audit(this.t,'DELETE',{...row},null);});data=arr;
      }else data=arr;
      return {data:this.expectOne?(data[0]||null):data,error:null};
    }
  }
  const signedSvg='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="240"%3E%3Crect width="320" height="240" fill="%23f89822"/%3E%3C/svg%3E';
  const client={
    auth:{getUser:async()=>({data:{user:{id,email:'admin@ejemplo.invalid'}},error:null}),signInWithPassword:async()=>({error:null}),signOut:async()=>({error:null})},
    from(t){return new Q(t)},
    storage:{from(bucket){return {upload:async(path,file)=>({data:{path},error:null}),remove:async()=>({error:null}),createSignedUrl:async()=>({data:{signedUrl:signedSvg},error:null})};}}
  };
  window.supabase={createClient:()=>client};
  window.__testDb=db;
})();