from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width,height in [(1440,900),(390,844)]:
            page=browser.new_page(viewport={'width':width,'height':height})

            exceptions=[];page.on('pageerror',lambda exc:exceptions.append(str(exc)))
            html=(ROOT/'admin/index.html').read_text()
            html=html.replace('<script src="config.js"></script><script src="app.js" defer></script>','')
            html=html.replace('<link rel="stylesheet" href="styles.css" />','')
            page.set_content(html)
            page.add_style_tag(content=(ROOT/'admin/styles.css').read_text())
            page.add_script_tag(content=(ROOT/'tests/mock_supabase.js').read_text())
            page.evaluate("window.ETS_PUBLIC_SUPABASE={url:'https://abcdefghij.supabase.co',publishableKey:'sb_publishable_abcdefghijklmnopqrstuvwx'};Object.defineProperty(window.crypto,'randomUUID',{value:()=> '33333333-3333-4333-8333-333333333333'});")
            page.add_script_tag(content=(ROOT/'admin/app.js').read_text())
            page.locator('#dashboardView').wait_for(state='visible',timeout=10000)
            assert page.locator('#metricTotal').inner_text()=='1'
            page.locator('[data-view="raffles"]').first.click()
            page.locator('[data-prize]').click()
            page.locator('#prizePanel').wait_for(state='visible')
            assert page.locator('#prizeRaffleTitle').inner_text()=='Rifa de prueba V8'
            page.locator('[name=brand]').fill('Mazda')
            page.locator('[name=model]').fill('Mazda 2')
            page.locator('[name=prize_details]').fill('Modelo de prueba, color blanco, automática.')
            page.locator('#savePrize').click()
            page.locator('#prizeSaveStatus').get_attribute('textContent')
            page.wait_for_function("window.__testDb.ets_prizes.length === 1")
            assert page.evaluate('window.__testDb.ets_prizes[0].brand')=='Mazda'
            page.locator('[name=brand]').fill('Mazda Premium')
            page.locator('#savePrize').click()
            page.wait_for_function("window.__testDb.ets_prizes[0].brand === 'Mazda Premium'")
            page.locator('#prizePhotoInput').set_input_files({'name':'premio.png','mimeType':'image/png','buffer':b'\x89PNG\r\n\x1a\nFAKEPNG'})
            page.locator('#photoForm [name=alt_text]').fill('Vista frontal del premio')
            page.locator('#uploadPrizePhoto').click()
            page.wait_for_function("window.__testDb.ets_prize_images.length === 1")
            page.locator('.photo-card').wait_for(state='visible')
            page.locator('[data-view="audit"]').first.click()
            page.locator('#auditPanel').wait_for(state='visible')
            assert page.get_by_text('Ficha de premio actualizada').count()>=1
            assert page.get_by_text('Fotografía añadida').count()>=1
            assert page.get_by_text('Mazda Premium').count()>=1
            page.locator('#themeToggle').click()
            assert page.locator('body').get_attribute('data-theme')=='light'
            assert not exceptions, exceptions
            page.screenshot(path=str(ROOT/f'tests/v8-{width}.png'),full_page=True)
            print('PASÓ',width,'px — premio, foto, auditoría y tema')
            page.close()
        browser.close()