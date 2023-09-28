from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(geolocation={"latitude":41.890221,"longitude":12.492348}, locale="pt-PT", permissions=["geolocation"], timezone_id="Europe/Lisbon")
    page = context.new_page()
    page.goto("https://staging.geosight.kartoza.com/")
    page.get_by_role("button", name="Login").click()
    page.locator("#app input[name=\"username\"]").click()
    page.locator("#app input[name=\"username\"]").fill("")
    page.locator("#app input[name=\"username\"]").press("Tab")
    page.locator("#app input[name=\"password\"]").fill("")
    page.get_by_role("button", name="LOG IN").click()
    page.close()

    # ---------------------
    context.storage_state(path="geosight-auth.json")
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
