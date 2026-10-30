from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width,height in [(1440,900),(390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        html=(ROOT/'admin/index.html').read_text().replace('<script src="config.js"></script><script src="app.js" defer></script>','').replace('<link rel="stylesheet" href="styles.css" />','')
        page.set_content(html)
        page.add_style_tag(content=(ROOT/'admin/styles.css').read_text())
        page.add_script_tag(content=(ROOT/'tests/mock_supabase_v9.js').read_text())
        page.evaluate("""window.ETS_PUBLIC_SUPABASE={url:'https://abcdefghij.supabase.co',publishableKey:'sb_publishable_abcdefghijklmnopqrstuvwx'};""")
        page.add_script_tag(content=(ROOT/'admin/app.js').read_text())
        page.locator('#dashboardView').wait_for(state='visible')
        page.locator('[data-view="raffles"]').first.click()
        page.locator('tbody [data-numbers]').click()
        page.locator('#numbersPanel').wait_for(state='visible')
        page.wait_for_function("document.querySelectorAll('.number-token').length===100")
        assert page.locator('#numberTotal').inner_text()=='100'
        assert page.locator('#numberUnregistered').inner_text()=='100'
        assert page.locator('#numberHeld').inner_text()=='0'
        assert page.locator('.number-token').count()==100
        assert page.locator('.number-token').first.locator('strong').inner_text()=='00'
        assert page.locator('.number-token').last.locator('strong').inner_text()=='99'
        # Server-side record read as held and updated only from fixture, not user interaction.
        page.evaluate("""window.__testDb.ets_number_allocations.push({raffle_id:'22222222-2222-4222-8222-222222222222',number:7,allocation_state:'held'});""")
        page.locator('#refreshNumbers').click()
        page.wait_for_function("document.querySelector('#numberUnregistered').textContent==='99'")
        assert page.locator('#numberHeld').inner_text()=='1'
        assert page.locator('.number-token.held').count()==1
        page.locator('#numberSearchInput').fill('007')
        page.locator('#numberJumpForm [type="submit"]').click()
        page.wait_for_function("document.querySelector('.number-token.highlight')?.querySelector('strong')?.textContent==='07'")
        # Searching outside range should fail and cannot change the inventory.
        page.locator('#numberSearchInput').fill('555')
        page.locator('#numberJumpForm [type="submit"]').click()
        page.wait_for_function("document.querySelector('#notice').textContent.includes('rango')")
        assert page.evaluate('window.__testDb.ets_number_allocations.length')==1
        page.locator('#themeToggle').click()
        assert page.locator('body').get_attribute('data-theme')=='light'
        assert not errors, errors
        page.screenshot(path=str(ROOT/'tests'/f'numbers-{width}.png'),full_page=True)
        print('PASS',width,'px — inventory read, counts, search, dark/light, no writes')
        page.close()

    # Large emission tests pagination and avoids rendering a million nodes.
    page=browser.new_page()
    html=(ROOT/'admin/index.html').read_text().replace('<script src="config.js"></script><script src="app.js" defer></script>','').replace('<link rel="stylesheet" href="styles.css" />','')
    page.set_content(html);page.add_style_tag(content=(ROOT/'admin/styles.css').read_text());page.add_script_tag(content=(ROOT/'tests/mock_supabase_v9.js').read_text())
    page.evaluate("""window.ETS_PUBLIC_SUPABASE={url:'https://abcdefghij.supabase.co',publishableKey:'sb_publishable_abcdefghijklmnopqrstuvwx'};
    window.__testDb.ets_raffles[0].total_numbers=1000000;""")
    page.add_script_tag(content=(ROOT/'admin/app.js').read_text())
    page.locator('#dashboardView').wait_for(state='visible');page.locator('[data-view="raffles"]').first.click();page.locator('tbody [data-numbers]').click()
    page.wait_for_function("document.querySelectorAll('.number-token').length===100")
    assert page.locator('#numbersPageLabel').inner_text()=='Página 1 de 10000'
    page.locator('#numbersNext').click()
    page.wait_for_function("document.querySelector('#numbersPageLabel').textContent.includes('Página 2')")
    assert page.locator('.number-token').first.locator('strong').inner_text()=='000100'
    assert page.locator('.number-token').count()==100
    page.close()
    browser.close()
    print('PASS large issuance — 100 nodes per page, no mass DOM')