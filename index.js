const chalk = require("chalk");

const {
  login,
  homeFeed,
  exploreTags,
  followPeople,
  instaStory,
  unfollowPeople,
} = require("./src/Instagram");
const { accountLists, tagLists, instagram } = require("./src/config");
const ascii = require("./ascii");

const { base } = instagram;

const random = (n, originalArray) => {
  let newArr = [];
  if (n >= originalArray.length) {
    return originalArray;
  }
  for (let i = 0; i < n; i++) {
    let newElem =
      originalArray[Math.floor(Math.random() * originalArray.length)];
    while (newArr.includes(newElem)) {
      newElem = originalArray[Math.floor(Math.random() * originalArray.length)];
    }
    newArr.push(newElem);
  }
  return newArr;
};

const start = async () => {
  ascii((log) => {
    log("Wait for starting ...\n");
  });

  const account = accountLists[1];
  const { page, browser } = await login(account);

  for (let i = 0; i < Infinity; i++) {
    await exploreTags({
      driver: {
        page,
        browser,
      },
      account,
      tags: random(2, tagLists),
      count: 1,
    });

    await homeFeed(
      {
        driver: {
          page,
          browser,
        },
        account,
        likeRange: 8,
      },
      async (driver) => {
        const { page, browser } = driver;

        await page.goto(base, { timeout: 0 });
      }
    );
  }
};

start();
