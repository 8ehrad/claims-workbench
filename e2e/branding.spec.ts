import { expect, test } from "@playwright/test";

test("the portfolio identity is clear on the workspace and sign-in page", async ({
  browser,
  page,
}) => {
  if (process.env.CLAIMS_CAPTURE_SCREENSHOTS === "1") {
    await page.setViewportSize({ width: 1600, height: 1000 });
  }
  await page.goto("/");
  await expect(page.locator(".brand-name")).toHaveText("ClaimsWorkbench");
  await expect(page.locator(".demo-badge")).toHaveText("Demo");
  await expect(page).toHaveTitle(
    "Claims Workbench | Agentic Claims Operations",
  );
  await expect(
    page.getByRole("heading", { name: "Claims queue" }),
  ).toBeVisible();
  if (process.env.CLAIMS_CAPTURE_SCREENSHOTS === "1") {
    await page.screenshot({
      path: "docs/images/claims-queue.png",
      fullPage: true,
    });
  }

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
  if (process.env.CLAIMS_CAPTURE_SCREENSHOTS === "1") {
    await visitor.screenshot({
      path: "docs/images/sign-in.png",
      fullPage: true,
    });
  }
  await context.close();
});
