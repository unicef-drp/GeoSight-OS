# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""

from playwright.sync_api import Playwright, sync_playwright, expect


def delete_dialog(dialog):
    """Accept delete dialog."""
    dialog.accept()


def run(playwright: Playwright) -> None:
    """Run test change level."""
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(storage_state="geosight-auth.json")
    page = context.new_page()
    page.goto(
        "https://staging-geosight.unitst.org/")
    page.locator(".AdminLinkButton a").click(timeout=20000)
    page.locator(".AdminContentHeader-Right a").click(timeout=20000)
    page.locator(".ReferenceDatasetSection input").click()
    page.locator(".ModalDataSelector .MuiDataGrid-row:first-child").click()
    page.locator("#SummaryName").fill('Playwright Test Project')
    page.locator("#SummaryCategory").click()
    page.keyboard.type('Test')
    page.keyboard.press('Enter')
    page.get_by_text('Save').is_enabled()
    page.get_by_text('Save').click()

    # DELETE Project
    page.on("dialog", delete_dialog)
    page.locator('.MoreActionIcon').click()
    page.locator('.MuiMenu-root .MuiButtonBase-root .error').click()
    expect(page.get_by_text('Add New Project')).to_be_visible(timeout=20000)

    # ---------------------
    page.close()
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
