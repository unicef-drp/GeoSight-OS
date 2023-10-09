from playwright.sync_api import Playwright, sync_playwright, expect
import time

def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(storage_state="geosight-auth.json")
    page = context.new_page()
    page.goto("https://staging-geosight.unitst.org/project/demo-geosight-project")
    page.locator(".ProjectOverview button").click(timeout=10000)
    time.sleep(2)
    page.locator(".ReferenceLayerLevelOptions > div:nth-child(2)").click(timeout=10000)
    time.sleep(2)
    page.locator(".ReferenceLayerLevelOptions > div:nth-child(3)").click(timeout=10000)
    time.sleep(2)
    page.locator(".ReferenceLayerLevelOptions > div:nth-child(1)").click(timeout=10000)
    page.close()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
