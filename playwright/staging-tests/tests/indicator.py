from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(geolocation={"latitude":41.890221,"longitude":12.492348}, locale="pt-PT", permissions=["geolocation"], storage_state="geosight-auth.json", timezone_id="Europe/Lisbon")
    page = context.new_page()
    page.goto("https://staging.geosight.kartoza.com/")
    page.close()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
