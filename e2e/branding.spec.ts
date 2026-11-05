import { expect, test } from "@playwright/test";

test("the portfolio identity is clear on the workspace and sign-in page", async ({
  browser,
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".brand-name")).toHaveText("ClaimsWorkbench");
  await expect(page.locator(".demo-badge")).toHaveText("Demo");
  await expect(page).toHaveTitle(
    "Claims Workbench | Agentic Claims Operations",
  );
  await expect(
    page.getByRole("heading", { name: "Claims queue" }),
  ).toBeVisible();

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const visitor = await context.newPage();
  await visitor.goto("/sign-in");
  await expect(
    visitor.getByText("Independent portfolio demonstration by Behrad Zabihi."),
  ).toBeVisible();
  await expect(
    visitor.getByText("Synthetic policies and claims. No real payments."),
  ).toBeVisible();
  await context.close();
});
