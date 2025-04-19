import { expect, request } from "@playwright/test";

import user from "./.auth/user.json";
import fs from "fs";

const authFile = "./.auth/user.json";

async function globalSetup() {
  const context = await request.newContext();

  const responseToken = await context.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: { email: "bereznoy.timyr@gmail.com", password: "31887Befezda" },
      },
    }
  );

  const responseBody = await responseToken.json();
  const token = responseBody.user.token;

  user.origins[0].localStorage[0].value = token;
  fs.writeFileSync(authFile, JSON.stringify(user));

  process.env["ACCESS_TOKEN"] = token;

  const articleResponse = await context.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: "Global Likes test article",
          description: "test",
          body: "test",
          tagList: [],
        },
      },
      headers: {
        Authorization: `Token ${process.env.ACCESS_TOKEN}`,
      },
    }
  );

  expect(articleResponse.status()).toEqual(201);

  const response = await articleResponse.json();
  const slugId = response.article.slug;

  process.env["SLUGID"] = slugId;
}

export default globalSetup;
