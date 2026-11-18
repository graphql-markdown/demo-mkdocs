import { expect, test } from "@playwright/test";
import { argosScreenshot } from "@argos-ci/playwright";

// One page per GraphQL type kind the formatter renders differently.
const pages = [
  ["object", "graphql/types/objects/project/", "Project"],
  ["enum", "graphql/types/enums/project-status/", "ProjectStatus"],
  ["interface", "graphql/types/interfaces/node/", "Node"],
  ["union", "graphql/types/unions/search-result/", "SearchResult"],
  ["input", "graphql/types/inputs/create-project-input/", "CreateProjectInput"],
  ["scalar", "graphql/types/scalars/date-time/", "DateTime"],
  ["query", "graphql/operations/queries/projects/", "projects"],
  ["mutation", "graphql/operations/mutations/create-project/", "createProject"],
  [
    "subscription",
    "graphql/operations/subscriptions/project-changed/",
    "projectChanged",
  ],
  ["directive", "graphql/types/directives/deprecated/", "deprecated"],
] as const;

// Element screenshots are stitched while scrolling; hide the sticky mobile
// top bar so it is not painted over the content.
const hideChrome = ".wy-nav-top { display: none !important; }";

const content = (page: import("@playwright/test").Page) =>
  page.locator(".rst-content .document");

test("home", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Your API, mapped with intent.");
  await argosScreenshot(page, "home", { argosCSS: hideChrome });
});

for (const [kind, path, title] of pages) {
  test(`page: ${kind}`, async ({ page }) => {
    const response = await page.goto(`/${path}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toHaveText(title);
    await argosScreenshot(page, `page-${kind}`, {
      element: content(page),
      argosCSS: hideChrome,
    });
  });
}

test.describe("dark mode", () => {
  test.use({ colorScheme: "dark" });

  test("home", async ({ page }) => {
    await page.goto("/");
    await argosScreenshot(page, "home-dark", { argosCSS: hideChrome });
  });

  test("page: object", async ({ page }) => {
    await page.goto("/graphql/types/objects/project/");
    await argosScreenshot(page, "page-object-dark", {
      element: content(page),
      argosCSS: hideChrome,
    });
  });
});
