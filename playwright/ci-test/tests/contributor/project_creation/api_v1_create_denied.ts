import { expect, request as playwrightRequest, test } from "@playwright/test";

const csrfTokenFromContext = async (page: any): Promise<string> => {
  const cookies = await page.context().cookies();
  const csrfToken = cookies.find((cookie: any) => cookie.name === "csrftoken");
  return csrfToken?.value || "";
};

const waitForAdminProjectListReady = async (page: any): Promise<void> => {
  try {
    await expect(page.getByText("Create New Project")).toBeVisible({
      timeout: 10_000,
    });
  } catch {
    await expect(page.getByText("Project Name")).toBeVisible({
      timeout: 60_000,
    });
  }
  await expect(
    page.locator('.AdminContent [role="progressbar"]:visible'),
  ).toHaveCount(0, {
    timeout: 60_000,
  });
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
    await waitForAdminProjectListReady(page);

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
