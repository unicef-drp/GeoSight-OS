import { expect, request as playwrightRequest, test } from "@playwright/test";

const csrfTokenFromContext = async (page: any): Promise<string> => {
  const cookies = await page.context().cookies();
  const csrfToken = cookies.find((cookie: any) => cookie.name === "csrftoken");
  return csrfToken?.value || "";
};

// Wait for Django to set the CSRF cookie. This does not depend on page
// texts, so it works in every language.
const waitForCsrfCookie = async (page: any): Promise<void> => {
  await expect
    .poll(
      async () =>
        (await page.context().cookies()).some(
          (cookie: any) => cookie.name === "csrftoken" && cookie.value,
        ),
      { timeout: 60_000 },
    )
    .toBe(true);
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
    await waitForCsrfCookie(page);

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
