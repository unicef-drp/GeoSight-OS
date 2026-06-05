import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

const SOURCE_DASHBOARD_SLUG = "demo-geosight-project";
const TEST_ICON_PATH = path.resolve(
  __dirname,
  "../../../../../django_project/geosight/data_restorer/demo_data/countries_data/icon.png",
);
const TEST_ICON_BUFFER = fs.readFileSync(TEST_ICON_PATH);

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

const csrfTokenFromContext = async (page: any): Promise<string> => {
  const cookies = await page.context().cookies();
  const csrfToken = cookies.find((cookie: any) => cookie.name === "csrftoken");
  return csrfToken?.value || "";
};

const buildPayloadFromRealDashboard = async (
  page: any,
  name: string,
  slug: string,
): Promise<Record<string, string>> => {
  const sourceResponse = await page.request.get(
    `/api/dashboard/${SOURCE_DASHBOARD_SLUG}/data`,
  );
  expect(sourceResponse.ok()).toBeTruthy();

  const sourceDashboard = await sourceResponse.json();
  const referenceLayerIdentifier =
    sourceDashboard?.reference_layer?.identifier || "";
  const groupName = sourceDashboard?.group || "Test";

  const nestedData = {
    ...sourceDashboard,
    name,
    slug,
    reference_layer: referenceLayerIdentifier,
    geoField:
      sourceDashboard?.geo_field ||
      sourceDashboard?.geoField ||
      "geometry_code",
    featured: false,
  };

  return {
    name,
    slug,
    group: groupName,
    geoField: nestedData.geoField,
    data: JSON.stringify(nestedData),
  };
};

test.describe("Dashboard v1 create API", () => {
  test("Creator can create dashboard using real dashboard payload", async ({
    page,
  }) => {
    await page.goto("/admin/project/");
    await waitForAdminProjectListReady(page);

    const csrfToken = await csrfTokenFromContext(page);
    expect(csrfToken.length).toBeGreaterThan(0);

    const uniqueSuffix = Date.now();
    const name = `API V1 Create ${uniqueSuffix}`;
    const slug = `api-v1-create-${uniqueSuffix}`;
    const payload = await buildPayloadFromRealDashboard(page, name, slug);

    const createResponse = await page.request.post("/api/v1/dashboards/", {
      headers: {
        "X-CSRFToken": csrfToken,
        Referer: page.url(),
      },
      form: payload,
    });

    expect(createResponse.status()).toBe(201);
    const createdDashboard = await createResponse.json();
    expect(createdDashboard.slug).toBe(slug);
    expect(createdDashboard.name).toBe(name);

    const deleteResponse = await page.request.delete(
      `/api/v1/dashboards/${slug}/`,
      {
        headers: {
          "X-CSRFToken": csrfToken,
          Referer: page.url(),
        },
      },
    );
    expect(deleteResponse.status()).toBe(204);
  });

  test("Creator can create dashboard with multipart icon upload", async ({
    page,
  }) => {
    await page.goto("/admin/project/");
    await waitForAdminProjectListReady(page);

    const csrfToken = await csrfTokenFromContext(page);
    expect(csrfToken.length).toBeGreaterThan(0);

    const uniqueSuffix = Date.now() + 1;
    const name = `API V1 Multipart ${uniqueSuffix}`;
    const slug = `api-v1-multipart-${uniqueSuffix}`;
    const payload = await buildPayloadFromRealDashboard(page, name, slug);

    const createResponse = await page.request.post("/api/v1/dashboards/", {
      headers: {
        "X-CSRFToken": csrfToken,
        Referer: page.url(),
      },
      multipart: {
        ...payload,
        icon: {
          name: "integration-icon.png",
          mimeType: "image/png",
          buffer: TEST_ICON_BUFFER,
        },
      },
    });

    expect(createResponse.status()).toBe(201);
    const createdDashboard = await createResponse.json();
    expect(createdDashboard.slug).toBe(slug);

    const deleteResponse = await page.request.delete(
      `/api/v1/dashboards/${slug}/`,
      {
        headers: {
          "X-CSRFToken": csrfToken,
          Referer: page.url(),
        },
      },
    );
    expect(deleteResponse.status()).toBe(204);
  });

  test("Creator receives validation error for invalid payload", async ({
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
        name: `API V1 Invalid ${Date.now()}`,
        slug: `api-v1-invalid-${Date.now()}`,
        data: JSON.stringify({}),
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.detail).toContain("extent");
  });
});
