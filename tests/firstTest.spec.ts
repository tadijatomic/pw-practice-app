import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4200");
  await page.getByText("Forms").click();
  await page.getByText("Form Layouts").click();
});

test("Locator syntax rules", async ({ page }) => {
  //by tag name
  page.locator("input");

  //by ID
  page.locator("#inputEmail1");

  //by class
  page.locator(".shape-rectangle");

  //by attribute
  page.locator("[placeholder='Email']");

  //by entire class
  page.locator(
    "[class='input-full-width size-medium status-basic shape-rectangle nb-transition']"
  );

  //combine different selectors
  page.locator("input[placeholder='Email']size-medium"); //nema razmaka između selektora

  //by XPath (NOT RECOMMENDED)
  page.locator('//*[@id="inputEmail1"]');

  //by partial text match
  page.locator(':text("Using")');

  //by exact text match
  page.locator(':text-is("Using the grid")');
});

test("User facing locators", async ({ page }) => {
  await page.getByRole("textbox", { name: "Email" }).first().click();
  await page.getByRole("button", { name: "Sign in" }).first().click();

  await page.getByLabel("Email").first().click();

  await page.getByPlaceholder("Jane Doe").click();

  await page.getByText("Using the Grid").click();

  await page.getByTitle("IoT Dashboard").click();
});

test("locating child elements", async ({ page }) => {
  //1.way
  await page.locator('nb-card nb-radio :text-is("Option 1")').click();

  //2.way
  await page
    .locator("nb-card")
    .locator("nb-radio")
    .locator(':text-is("Option 2")')
    .click();

  //combining simple locators with facing locators
  await page
    .locator("nb-card")
    .getByRole("button", { name: "Sign in" })
    .first()
    .click();
});

test("locating parent elements", async ({ page }) => {
  //pronalazi nb card element u kojem postoji tekst "Using the Grid" i zatim pronalazi textbox (input) za email
  await page
    .locator("nb-card", { hasText: "Using the Grid" })
    .getByRole("textbox", { name: "Email" })
    .click();

  //pronalazi nb card element i unutar njega imamo jedinstveni id inputEmail1 i zatim pomoću njega selektiramo taj mail input
  await page
    .locator("nb-card", { has: page.locator("#inputEmail1") })
    .getByRole("textbox", { name: "Email" })
    .click();

  //pronalazi nb card i zatim filtrira kako bi pronašli onaj sa tekstom Basic form i zatim selektirali input mail
  await page
    .locator("nb-card")
    .filter({ hasText: "Basic form" })
    .getByRole("textbox", { name: "Email" })
    .click();

  //pronalazimo nb card i zatim filtriramo prema jednistvenom locatoru u ovom slučaju klasa tj boja buttona
  await page
    .locator("nb-card")
    .filter({ has: page.locator(".status-danger") })
    .getByRole("textbox", { name: "Password" })
    .click();

  //chainanje filtera, prvo pronalazimo sve nb-card elemente, zatim uzimamo samo one koji u sebi imaju checkbox, a zatim od svih njih nam treba onaj koji ima tekst Sign in i unutar njega input email
  await page
    .locator("nb-card")
    .filter({ has: page.locator("nb-checkbox") })
    .filter({ hasText: "Sign in" })
    .getByRole("textbox", { name: "Email" })
    .click();
});

test("reusing locators", async ({ page }) => {
  const basicForm = page.locator("nb-card").filter({ hasText: "Basic form" });
  const emailField = basicForm.getByRole("textbox", { name: "email" });

  await emailField.fill("test@test.com");
  await basicForm.getByRole("textbox", { name: "Password" }).fill("Welcome123");
  await basicForm.getByRole("button").click();

  await expect(emailField).toHaveValue("test@test.com");
});

test("extracting values", async ({ page }) => {
  //single text value
  const basicForm = page.locator("nb-card").filter({ hasText: "Basic form" });
  const buttonText = await basicForm.locator("button").textContent();
  expect(buttonText).toEqual("Submit");

  //all text values...uzimamo sve nazive radiobutona koje spremamo u array i zatim jedan tražimo
  const allRadioBtnsValues = await page.locator("nb-radio").allTextContents();
  expect(allRadioBtnsValues).toContain("Option 1");

  //input value
  const mailField = basicForm.getByRole("textbox", { name: "Email" });
  await mailField.fill("test@test.com");
  const mailValue = await mailField.inputValue();
  expect(mailValue).toEqual("test@test.com");

  //attribute value
  const placeholderValue = await mailField.getAttribute("placeholder");
  expect(placeholderValue).toEqual("Email");
});

test("assertions", async ({ page }) => {
  const basicForm = page
    .locator("nb-card")
    .filter({ hasText: "Basic form" })
    .locator("button");

  //general assertions
  const value = 5;
  expect(value).toEqual(5);

  const text = await basicForm.textContent();
  expect(text).toEqual("Submit");

  //locator assertions
  await expect(basicForm).toHaveText("Submit");

  //   ✅ Generic assertions – Kada provjeravaš vrijednosti izvan DOM-a, npr. API response, varijable, page.title().
  // ✅ Locator assertions – Kada provjeravaš stanje elemenata na stranici, npr. je li element vidljiv, sadrži određeni tekst ili je prisutan u DOM-u.
  // Ako testiraš UI elemente, uvijek koristi locator assertions jer ti omogućuju auto-waiting i stabilnije testove! 🚀
});
