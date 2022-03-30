const chalk = require("chalk");

const {
  login,
  homeFeed,
  exploreTags,
  followPeople,
  instaStory,
  unfollowPeople,
} = require("./src/Instagram");
const { tagLists, instagram } = require("./src/config");
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

const bot = async (account) => {
  ascii.main((log) => {
    log("Wait for starting ...\n");
  });

  const { page, browser, isSuccess } = await login(account);

  if (isSuccess) {
    while (true) {
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
  }
};

module.exports = bot;
