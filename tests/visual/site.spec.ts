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

// Each type is also published as plain Markdown next to its page: no MDX
// or HTML spans.
test("markdown copy", async ({ page }) => {
  const response = await page.request.get("/graphql/types/objects/project.md");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body.startsWith("# ")).toBe(true);
  expect(body).not.toContain("<span");
});

// Backticked type names in deprecation reasons link to their page.
test("deprecation reason links to a type page", async ({ page }) => {
  await page.goto("/graphql/types/objects/project/");
  const link = page
    .locator("div.admonition", { hasText: "Replaced by" })
    .locator("a", { hasText: "ProjectStatus" });
  await expect(link).toHaveAttribute(
    "href",
    /enums\/project-status\/$/,
  );
});

// A type-level `@deprecatedType` renders the "Deprecated" notice, with the
// replacement type linked from its reason.
test("deprecated type notice links to the replacement", async ({ page }) => {
  await page.goto("/graphql/types/objects/legacy-project/");
  const notice = page.locator("div.admonition", { hasText: "Replaced by" });
  await expect(notice).toContainText("Deprecated");
  await expect(notice.locator("a", { hasText: /^Project$/ })).toHaveAttribute(
    "href",
    /\/graphql\/types\/objects\/project\/$|\.\.\/project\/$/,
  );
});

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
