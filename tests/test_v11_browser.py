"""Pruebas E2E del prototipo V11 sobre DOM aislado y almacenamiento simulado.
La política del entorno no permite navegación HTTP; no prueba despliegue externo.
"""
from pathlib import Path
import base64
import re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
UI=ROOT/'experiencia'


def prepare(page):
    html=(UI/'index.html').read_text()
    html=re.sub(r'<script type="module".*?</script>', '',html,flags=re.S)
    html=re.sub(r'<link rel="stylesheet"[^>]*>', '',html)
    page.set_content(html)
    page.add_style_tag(content=(UI/'styles.css').read_text())
    page.evaluate("Object.defineProperty(window.crypto,'randomUUID',{configurable:true,value:()=> 'abc12345-1111-4222-8222-111111111111'});")
    page.evaluate('''() => {let memory={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(memory,k)?memory[k]:null,setItem:(k,v)=>{memory[k]=String(v)},removeItem:k=>{delete memory[k]}}});}''')
    domain=(UI/'demo-domain.mjs').read_text()
    catalog=(UI/'catalog.mjs').read_text()
    # Imágenes locales convertidas en data URI para el test sin HTTP.
    for i in range(1,4):
        image=(UI/f'assets/premio-{i}.svg').read_bytes()
        catalog=catalog.replace(f'assets/premio-{i}.svg','data:image/svg+xml;base64,'+base64.b64encode(image).decode())
    todata=lambda text:'data:text/javascript;base64,'+base64.b64encode(text.encode()).decode()
    app=(UI/'app.mjs').read_text().replace("'./demo-domain.mjs'",f"'{todata(domain)}'").replace("'./catalog.mjs'",f"'{todata(catalog)}'")
    app=app.replace('assets/premio-1.svg','data:image/svg+xml;base64,'+base64.b64encode((UI/'assets/premio-1.svg').read_bytes()).decode())
    page.add_script_tag(type='module',content=app)


def run():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width,height in [(1440,900),(390,844)]:
            page=browser.new_page(viewport={'width':width,'height':height})
            errors=[]
            page.on('pageerror',lambda exc:errors.append(str(exc)))
            prepare(page)
            page.locator('h1').wait_for(timeout=10000)
            assert 'Tu próximo sueño' in page.locator('h1').inner_text()
            page.screenshot(path=str(ROOT/'tests'/f'v11-home-{width}.png'),full_page=True)
            page.get_by_role('link',name='Explorar premio destacado').click()
            page.get_by_role('heading',name='Elige tus números').wait_for()
            page.locator('[data-number="7"]').click()
            page.locator('[data-number="5"]').click()
            assert '50.000' in page.locator('#selection-total').inner_text()
            assert page.locator('[data-number="7"]').get_attribute('aria-pressed')=='true'
            page.screenshot(path=str(ROOT/'tests'/f'v11-prize-{width}.png'),full_page=True)
            page.get_by_role('button',name='Revisar resumen').click()
            page.get_by_role('heading',name=re.compile('Todo listo para')).wait_for()
            assert page.locator('#create-demo').is_disabled()
            page.locator('#acknowledge').check()
            assert page.locator('#create-demo').is_enabled()
            page.get_by_role('button',name='Crear simulación').click()
            page.get_by_role('heading',name=re.compile('Una simulación')).wait_for()
            reference=page.locator('.reference').inner_text()
            assert reference.startswith('DEMO-') and len(reference)==13,reference
            page.screenshot(path=str(ROOT/'tests'/f'v11-confirm-{width}.png'),full_page=True)
            page.get_by_role('link',name='Ver seguimiento').click()
            assert reference in page.locator('main').inner_text()
            page.locator('#lookup').fill(reference)
            page.get_by_role('button',name='Consultar').click()
            assert reference in page.locator('main').inner_text()
            page.locator('#theme-toggle').click()
            assert page.locator('body').get_attribute('data-theme')=='light'
            assert not errors,errors
            page.close()
            print(f'PASS V11 {width}x{height}: selección, compra simulada, referencia, seguimiento y tema')
        browser.close()

if __name__=='__main__':run()