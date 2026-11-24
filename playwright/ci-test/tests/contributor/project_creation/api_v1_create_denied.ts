import { expect, request as playwrightRequest, test } from "@playwright/test";

// Read the CSRF token that every page renders (frontend/base.html).
// Production settings keep the token in the session (CSRF_USE_SESSIONS),
// so there is no csrftoken cookie; this also does not depend on page texts.
const csrfTokenFromContext = async (page: any): Promise<string> => {
  await page.waitForLoadState("domcontentloaded");
  return (await page.evaluate("csrfmiddlewaretoken")) || "";
};

test.describe("Dashboard v1 create API permissions", () => {
  test("Anonymous cannot create dashboard via v1 endpoint", async ({
    baseURL,
  }) => {
    const anonymousContext = await playwrightRequest.newContext({
      baseURL: baseURL || "http://localhost:2000",
    });

    const response = await anonymousContext.post("/api/v1/dashboards/", {
      form: {
        name: "Anonymous Create Attempt",
        slug: `anonymous-create-${Date.now()}`,
        data: JSON.stringify({}),
      },
    });

    expect(response.status()).toBe(403);
    await response.json();

    await anonymousContext.dispose();
  });

  test("Contributor cannot create dashboard via v1 endpoint", async ({
    page,
  }) => {
    await page.goto("/admin/project/");

    const csrfToken = await csrfTokenFromContext(page);
    expect(csrfToken.length).toBeGreaterThan(0);

    const response = await page.request.post("/api/v1/dashboards/", {
      headers: {
        "X-CSRFToken": csrfToken,
        Referer: page.url(),
      },
      form: {
        name: "Unauthorized Create Attempt",
        slug: `unauthorized-create-${Date.now()}`,
        data: JSON.stringify({}),
      },
    });

    expect(response.status()).toBe(403);
    await response.json();
  });
});
