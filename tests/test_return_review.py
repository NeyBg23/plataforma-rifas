from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for width,height in [(1440,900),(390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        page.on('dialog',lambda dialog: dialog.accept())
        errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        html=(ROOT/'admin/index.html').read_text().replace('<script src="config.js"></script><script src="app.js" defer></script>','').replace('<link rel="stylesheet" href="styles.css" />','')
        page.set_content(html)
        page.add_style_tag(content=(ROOT/'admin/styles.css').read_text())
        page.add_script_tag(content=(ROOT/'tests/mock_supabase.js').read_text())
        page.evaluate("""Object.defineProperty(window.crypto,'randomUUID',{value:()=> '44444444-4444-4444-8444-444444444444'}); window.__testDb.ets_raffles[0].state='in_review';
            window.ETS_PUBLIC_SUPABASE={url:'https://abcdefghij.supabase.co',publishableKey:'sb_publishable_abcdefghijklmnopqrstuvwx'};""")
        page.add_script_tag(content=(ROOT/'admin/app.js').read_text())
        page.locator('#dashboardView').wait_for(state='visible')
        page.locator('[data-view="raffles"]').first.click()
        assert page.locator('tbody [data-return-draft]').count()==1
        assert page.locator('tbody [data-edit]').count()==0
        page.locator('tbody [data-prize]').click()
        page.locator('#prizePanel').wait_for(state='visible')
        assert page.locator('[name=brand]').is_disabled()
        assert page.locator('#prizeReadOnly').is_visible()
        assert page.locator('#prizeReturnDraft').is_visible()
        page.locator('#prizeReturnDraft').click()
        page.wait_for_function("window.__testDb.ets_raffles[0].state === 'draft'")
        page.wait_for_function("!document.querySelector('#savePrize').hidden")
        assert page.locator('[name=brand]').is_enabled()
        assert page.locator('#prizeReadOnly').is_hidden()
        assert page.locator('#photoForm').is_visible()
        page.locator('[name=brand]').fill('BMW')
        page.locator('[name=model]').fill('G310 R')
        page.locator('#savePrize').click()
        try:
            page.wait_for_function('window.__testDb.ets_prizes.length===1',timeout=2500)
        except Exception:
            print('DEBUG',page.locator('#notice').inner_text(), 'hidden',page.locator('#notice').get_attribute('hidden'),'saveDisabled',page.locator('#savePrize').is_disabled(), 'count',page.evaluate('window.__testDb.ets_prizes.length'),'errors',errors)
            raise
        assert page.evaluate('window.__testDb.ets_prizes[0].brand')=='BMW'
        assert page.evaluate("window.__testDb.ets_raffle_audit.filter(a=>a.operation==='UPDATE'&&a.old_data?.state==='in_review'&&a.new_data?.state==='draft').length") == 1
        # Review again, and recover directly in list view as well.
        page.locator('[data-view="raffles"]').first.click()
        page.locator('tbody [data-review]').click()
        page.wait_for_function("window.__testDb.ets_raffles[0].state==='in_review'")
        page.locator('tbody [data-return-draft]').click()
        page.wait_for_function("window.__testDb.ets_raffles[0].state==='draft'")
        page.locator('tbody [data-edit]').wait_for(state='visible')
        page.locator('[data-view="audit"]').first.click()
        page.locator('#auditPanel').wait_for(state='visible')
        assert page.get_by_text('En revisión').count()>=1
        assert page.get_by_text('Borrador').count()>=1
        assert not errors, errors
        page.screenshot(path=str(ROOT / 'tests' / f'recovery-{width}.png'),full_page=True)
        print('PASS',width,'px — return to draft, update prize, audit, re-review, table return')
        page.close()
    browser.close()