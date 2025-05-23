import { expect, test as setup } from "@playwright/test";

setup("create new article", async ({ request }) => {
  const articleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Likes test article",
          description: "test",
          body: "test",
          tagList: [],
        },
      },
    }
  );

  expect(articleResponse.status()).toEqual(201);

  const response = await articleResponse.json();
  const slugId = response.article.slug;

  process.env["SLUGID"] = slugId;
});
