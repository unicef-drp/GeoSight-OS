# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""

import time

from playwright.sync_api import Playwright, sync_playwright


def run(playwright: Playwright) -> None:
    """Run test change level."""
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(storage_state="geosight-auth.json")
    page = context.new_page()
    page.goto(
        "https://staging-geosight.unitst.org/project/demo-geosight-project")
    page.locator(".ProjectOverview button").click(timeout=10000)
    time.sleep(2)
    page.locator(".ReferenceLayerLevelOptions > div:nth-child(2)").click(
        timeout=10000)
    time.sleep(2)
    page.locator(".ReferenceLayerLevelOptions > div:nth-child(3)").click(
        timeout=10000)
    time.sleep(2)
    page.locator(".ReferenceLayerLevelOptions > div:nth-child(1)").click(
        timeout=10000)
    page.close()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
