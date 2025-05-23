import { test, expect, request } from "@playwright/test";
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");
});

test("mock api tests", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is a  MOCK test title";
    responseBody.articles[0].description = "This is a MOCK test description";

    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.waitForTimeout(500);

  await page.getByText("Global Feed").click();

  await expect(page.locator(".navbar-brand")).toHaveText("conduit");

  await expect(page.locator(".tag-list a")).toContainText([
    "Automation",
    "PLaywright",
  ]);

  await expect(page.locator("app-article-list h1").first()).toHaveText(
    "This is a MOCK test title"
  );
  await expect(page.locator("app-article-list p").first()).toHaveText(
    "This is a MOCK test description"
  );
});

test("delete article", async ({ page, request }) => {
  const articleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "test article",
          description: "test",
          body: "test",
          tagList: [],
        },
      },
    }
  );
  expect(articleResponse.status()).toEqual(201);

  await page.getByText("Global Feed").click();
  await page.getByText("test article").click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await page.getByText("Global Feed").click();

  await expect(page.locator("app-article-list h1").first()).not.toHaveText(
    "test article"
  );
});

test("create article", async ({ page, request }) => {
  await page.getByText("New Article").click();
  await page.getByPlaceholder("Article Title").fill("test article");
  await page.getByPlaceholder("What's this article about?").fill("test");
  await page
    .getByPlaceholder("Write your article (in markdown)")
    .fill("test description");
  await page.getByPlaceholder("Enter tags").fill("test");
  await page.getByRole("button", { name: "Publish Article" }).click();

  const articleResponse = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/"
  );
  const articleResponseBody = await articleResponse.json();
  const slugID = articleResponseBody.article.slug;

  await expect(page.locator("app-article-page h1")).toHaveText("test article");

  await page.getByText("Home").click();
  await page.getByText("Global Feed").click();

  await expect(page.locator("app-article-list h1").first()).toHaveText(
    "test article"
  );

  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slugID}`
  );

  expect(deleteArticleResponse.status()).toEqual(204);
});
