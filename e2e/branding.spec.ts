import { expect, test } from "@playwright/test";

test("the portfolio identity is clear on the workspace and sign-in page", async ({
  browser,
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/");
  const logo = page.getByRole("img", { name: "Hiscox", exact: true });
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.locator(".brand-name")).toHaveText("Claims Workbench");
  await expect(page.locator(".brand-caption")).toHaveText(
    "Prepared for Hiscox",
  );
  await expect(page.getByText("Interview demo", { exact: true })).toHaveCount(
    0,
  );
  await expect(page).toHaveTitle("Hiscox | Claims Workbench");
  await expect(
    page.getByRole("heading", { name: "Claims queue" }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(26);
  await page.screenshot({
    path: testInfo.outputPath("claims-queue.png"),
    fullPage: true,
  });

  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const visitor = await context.newPage();
  await visitor.goto("/sign-in");
  await expect(
    visitor.getByRole("img", { name: "Hiscox", exact: true }),
  ).toBeVisible();
  await expect(
    visitor.getByText("Prepared for Hiscox", { exact: true }),
  ).toBeVisible();
  await expect(
    visitor.getByRole("textbox", { name: "Email", exact: true }),
  ).toBeVisible();
  await expect(visitor.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(
    visitor.getByText("Interview demo", { exact: true }),
  ).toHaveCount(0);
  await expect(
    visitor.getByText(
      "Independent interview demo prepared for Hiscox by Behrad Zabihi.",
    ),
  ).toHaveCount(0);
  await expect(
    visitor.getByText("Synthetic policies and claims. No real payments."),
  ).toHaveCount(0);
  await visitor.screenshot({
    path: testInfo.outputPath("sign-in.png"),
    fullPage: true,
  });
  await context.close();
});

test("the Hiscox presentation fits phone and tablet widths in light and dark mode", async ({
  page,
}) => {
  for (const width of [375, 1024, 1100, 1152]) {
    await page.setViewportSize({ width, height: 812 });
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      await expect(
        page.getByRole("img", { name: "Hiscox", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Prepared for Hiscox", { exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
  }
});
