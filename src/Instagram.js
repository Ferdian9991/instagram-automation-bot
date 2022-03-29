const { existsSync } = require("fs");
const fsp = require("fs").promises;
const { join } = require("path");
const chalk = require("chalk");
const { fetch } = require("./fetch");
const { tagLists, instagram } = require("./config");
const { base, nameService, tagUrl, explorePeople, userProfile } = instagram;
const { getCookies, setCookies } = require("./session");
const selector = require("./selector");

const logger = (message) => {
  const timestamps = `${new Date().getHours()}:${new Date().getMinutes()}`;
  console.log(chalk.cyan(timestamps) + ":", message);
};

class Instagram {
  /**
   * Function parameters
   * @param {Object} account - Passing with acount credential
   * @param {string} account.username - The username of an account.
   * @param {string} account.password - The password of an account.
   */
  async login(
    account = {
      username,
      password,
    }
  ) {
    try {
      const { button, input, custom } = selector.loginPage;
      let isSuccess = true;
      const sessionDir = join(
        __dirname,
        `../session/${nameService}`,
        account.username + ".json"
      );
      if (!existsSync(sessionDir)) {
        await fsp.mkdir(join(__dirname, `../session/${nameService}`), {
          recursive: true,
        });
      }
      const { page, browser } = await fetch();
      page.setRequestInterception(true);
      page.on("request", async (req) => {
        if (existsSync(sessionDir)) {
          await setCookies(page, account.username, nameService);
        }
        req.continue();
      });

      await page.goto(base, {
        waitUntil: "networkidle0",
        timeout: 0,
      });

      const cookies = await page.cookies();
      const session = cookies.filter((data) =>
        data.name.includes("sessionid")
      )[0];

      if (!session) {
        console.log(chalk.green(`Try to login as ${account.username}`));
        if (existsSync(sessionDir)) {
          await fsp.unlink(sessionDir);
        }
        await page.waitForSelector(custom.loginForm);
        await page.type(input.username, account.username, {
          delay: 120,
        });
        await page.type(input.password, account.password, {
          delay: 120,
        });
        await page.click(button.submitLogin, { delay: 100 });
        await page.waitForTimeout(2000);
        const loginError = await page.$('p[data-testid="login-error-message"]');
        if (loginError == null) {
          await page.waitForNavigation();
          console.log(
            chalk.green(`Loged in as ${account.username} without session`)
          );
          await page.waitForTimeout(2000);
          await getCookies(page, account.username, nameService);
          await page.goto(base, { timeout: 0 });
        } else {
          isSuccess = false;
          await browser.close();
        }
      } else {
        console.log(
          chalk.green(`Loged in as ${account.username} with active session`)
        );
      }

      return {
        page,
        browser,
        account,
        isSuccess,
      };
    } catch (e) {
      console.log(`There are something error!`);
      process.exit(1);
    }
  }

  /**
   * Function parameters
   * @param {Object} options - Choose options
   * @param {fetch} options.driver - Return value of login credential
   * @param {Object} options.account - Passing with acount credential
   * @param {string} options.account.username - The username of an account.
   * @param {string} options.account.password - The password of an account.
   * @param {tagLists} options.tags - Passing with tag lists
   * @param {Object} options.comment - Choose comment options
   * @param {Boolean} options.comment.isComment - Use boolean option if comment is true
   * @param {string[]} options.comment.body - Passing with comment lists
   * @param {number} options.count - Tags like length
   */

  async exploreTags(
    options = {
      driver: {},
      account,
      tags: [],
      comment: {
        isComment: false,
        body: [],
      },
      count: 0,
    }
  ) {
    let { driver, account, tags, comment, count } = options;

    let isFinished = true;

    const { input, custom, button } = selector.exploreTagsPage;
    const { page, browser } = driver;

    for (const tag of tags) {
      let counter = 0;
      await page.goto(tagUrl(tag), {
        waitUntil: "networkidle0",
        timeout: 0,
      });
      await page.waitForTimeout(2000);

      let posts = await page.$$(custom.post);

      if (count == 0) {
        counter = posts.length;
      } else {
        counter = count;
      }

      for (let i = 0; i < counter; i++) {
        const post = posts[i];

        if (post != null) {
          await post.click();
          const isModalOpen = await page.$$(custom.modal);
          if (isModalOpen) {
            await page.waitForTimeout(5000);
            const postAuthor = await page.evaluate(
              (author) => document.querySelector(author).textContent,
              custom.author
            );
            const isLike = await page.$(button.like);
            if (isLike !== null) {
              await isLike.click();
            }
            await page.waitForTimeout(1000);
            const isBotDetection = await page.$(custom.warning);
            if (isBotDetection != null) {
              await page.waitForTimeout(2000);
              await page.click(button.submitWarning);

              console.log(`${account.username} has been detected as bot`);
              console.log("Waiting for sleep ...");

              await page.click(button.modalClose);
              await page.waitForTimeout(10000);

              posts = [];

              isFinished = false;
            } else {
              logger(`${account.username} has been liked ${postAuthor}'s post`);

              if (comment && comment.isComment) {
                const commentArrea = await page.$(input.comment);
                if (commentArrea != null) {
                  const submitButton = await page.$(button.submitComment);

                  await page.waitForTimeout(4000);
                  await commentArrea.type(
                    `Hi! @${postAuthor} let's follow me on instagram`,
                    { delay: 120 }
                  );
                  await submitButton.click();
                  await page.waitForTimeout(4000);

                  logger(
                    `${account.username} has been comment ${postAuthor}'s post`
                  );
                }
              }

              await page.waitForTimeout(4000);
              await page.click(button.modalClose);
              await page.waitForTimeout(3000);
            }
          }
        }
      }

      await page.waitForTimeout(10000);
    }

    return isFinished;
  }

  /**
   * Function parameters
   * @param {Object} options - Choose options
   * @param {fetch} options.driver - Return value of login credential
   * @param {Object} options.account - Passing with acount credential
   * @param {string} options.account.username - The username of an account.
   * @param {string} options.account.password - The password of an account.I
   * @param {number} options.maxSkipAction - Passing with skip action length
   * @param {number} options.likeRange - Passing with action range
   * @param {Function} navigationCallback Passing with callback
   */

  async homeFeed(
    options = {
      driver: {},
      account,
      maxSkipAction: Infinity,
      likeRange,
    },
    navigationCallback
  ) {
    const { input, custom, button } = selector.homeFeedPage;
    let isFinished = true;

    let { driver, account, maxSkipAction, likeRange } = options;
    const { page, browser } = driver;

    if (typeof navigationCallback === "function") {
      navigationCallback(driver);
      await page.waitForNavigation();
    }

    await page.waitForTimeout(2000);
    const isDialog = await page.$(custom.popupNotification);
    if (isDialog != null) {
      const skipDialogButton = await page.$(button.skipPopupNotification);
      await skipDialogButton.click();
    }

    try {
      let posts = await page.$$(custom.article);

      let filterByIndex = Array.from(posts.keys());
      let skipAction = [];

      let counter = likeRange != undefined ? likeRange : posts.length;

      for (let i = 0; i < counter; i++) {
        const isBotDetection = await page.$(
          'div[role="presentation"] > div[role="dialog"] > div > div > div:nth-child(2) button:nth-child(2)'
        );

        if (isBotDetection != null) {
          posts = [];
          await isBotDetection.click();
        }

        await page.waitForTimeout(3000);
        const post = posts[i];
        const isLike = await post.$(button.like);
        await page.evaluate(async (post) => {
          window.scrollTo({
            top:
              (await post.getBoundingClientRect().top) +
              window.pageYOffset -
              100,
            behavior: "smooth",
          });
        }, isLike);

        if (i + 1 == posts.length) {
          const newItems = await page.$$(custom.article);
          posts.push(
            ...newItems.filter((_, index) => !filterByIndex.includes(index))
          );
          filterByIndex = [0, 1, 2, 3, 4];
        }

        counter = likeRange != undefined ? likeRange : posts.length;

        const postAuthor = await page.evaluate(
          (author) => document.querySelector(author).textContent,
          custom.author
        );

        logger(`${account.username} has been seen ${postAuthor}'s post!`);

        const existsLike = await post.$(button.unlike);
        const commentArea = await post.$(input.comment);
        const sendComment = await post.$(button.submitComment);

        if (isLike != null && existsLike == null) {
          await page.waitForTimeout(2000);
          await isLike.click();
          logger(`${account.username} has been like ${postAuthor}'s post!`);
          await page.waitForTimeout(3000);
          await commentArea.type(
            `Hi! @${postAuthor} let's follow me on instagram`,
            { delay: 120 }
          );
          await page.waitForTimeout(1000);
          await sendComment.click();
          logger(`${account.username} has been comment ${postAuthor}'s post!`);
        } else {
          skipAction.push(i);
        }

        if (skipAction.length == maxSkipAction) {
          posts = [];
          isFinished = false;
        }

        await page.waitForTimeout(3000);
      }
    } catch (e) {
      isFinished = false;
      console.log(`There are something error please try again latter`);
    }

    return isFinished;
  }

  /**
   * Function parameters
   * @param {Object} options - Choose options
   * @param {fetch} options.driver - Return value of login credential
   * @param {Object} options.account - Passing with acount credential
   * @param {string} options.account.username - The username of an account.
   * @param {string} options.account.password - The password of an account.I
   * @param {number} options.seeDuration - Passing with skip action length
   * @param {Function} navigationCallback Passing with callback
   */

  async instaStory(
    { driver = {}, account, seeDuration = 2000 },
    navigationCallback
  ) {
    const { input, custom, button } = selector.storiesPage;

    const { page, browser } = driver;

    if (typeof navigationCallback === "function") {
      navigationCallback(driver);
      await page.waitForNavigation();
    }

    await page.waitForTimeout(1000);

    const isDialog = await page.$(custom.popupNotification);
    if (isDialog != null) {
      const skipDialogButton = await page.$(button.skipPopupNotification);
      await skipDialogButton.click();
    }

    let isFinished = true;

    try {
      await page.waitForTimeout(2000);

      const stories = await page.$$(button.stories);

      const isStories = (await stories[0]) != undefined;

      if (isStories) {
        await stories[0].click();
        await page.waitForTimeout(seeDuration);

        const storyAuthorElement = await page.$(custom.author);
        const storyAuthor = await page.evaluate(
          (e) => e.innerText,
          storyAuthorElement
        );

        const closeButton = await page.$(button.closeStory);

        for (let i = 0; i < stories.length; i++) {
          const nextButton = await page.$(button.next);
          const alreadySeen = await page.$$(custom.seenLength);
          const notSeen = await page.$$(custom.unseeing);

          let storyLength = alreadySeen.length - notSeen.length;

          await nextButton.click();

          logger(
            `${account.username} has been seen 1 ${storyAuthor}'s stories`
          );
          for (let i = 0; i < storyLength; i++) {
            await page.waitForTimeout(seeDuration);
            await nextButton.click();

            logger(
              `${account.username} has been seen ${
                i + 2
              } ${storyAuthor}'s stories`
            );

            if (i + 1 == storyLength) {
              i = 0;
              storyLength = 0;
            }
          }

          await page.waitForTimeout(4000);
        }
      } else {
        console.log(`No stories yet!`);
      }

      await page.waitForTimeout(3000);
    } catch (e) {
      isFinished = false;
      console.log(`There are something error please try again latter`);
    }

    return isFinished;
  }

  /**
   * Function parameters
   * @param {Object} options - Choose options
   * @param {fetch} options.driver - Return value of login credential
   * @param {Object} options.account - Passing with acount credential
   * @param {string} options.account.username - The username of an account.
   * @param {string} options.account.password - The password of an account.
   */

  async followPeople({ driver = {}, account }) {
    const { input, custom, button } = selector.peoplesPage;

    const { page, browser } = driver;

    await page.goto(explorePeople, {
      waitUntil: "networkidle0",
      timeout: 0,
    });
    await page.waitForTimeout(3000);

    let isFinished = true;

    try {
      const peoples = await page.$$(custom.peoples);

      const isPeople = (await peoples[0]) != undefined;

      if (isPeople) {
        for (let i = 0; i < peoples.length; i++) {
          const people = peoples[i];

          const followButton = await people.$(button.follow);

          await page.waitForTimeout(3000);

          const isFollow =
            (await page.evaluate((e) => {
              return e.innerText;
            }, followButton)) == "Follow";

          const peopleName = await page.evaluate(
            async (e) => e.innerText,
            await people.$(custom.peopleName)
          );

          if (isFollow) await followButton.click();
          logger(`${account.username} has been following ${peopleName}!`);
        }

        await page.waitForTimeout(3000);
      }
    } catch (e) {
      isFinished = false;
      console.log(`There are something error please try again latter`);
    }

    return isFinished;
  }

  /**
   * Function parameters
   * @param {Object} options - Choose options
   * @param {fetch} options.driver - Return value of login credential
   * @param {Object} options.account - Passing with acount credential
   * @param {string} options.account.username - The username of an account.
   * @param {string} options.account.password - The password of an account.
   * @param {number} options.maxUnfollowLimit - Passing with number to limit range
   */

  async unfollowPeople({ driver = {}, account, maxUnfollowLimit }) {
    const { custom, input, button } = selector.unfollowPage;
    const { page, browser } = driver;

    await page.goto(userProfile(account.username), {
      timeout: 0,
    });
    await page.waitForTimeout(3000);

    let isFinished = true;

    try {
      const followingButton = await page.$(button.following);

      if (followingButton != null) {
        await followingButton.click();
        await page.waitForSelector(custom.unfollowList);

        const unfollows = await page.$$(custom.unfollowList);
        const isUnfollow = (await unfollows[0]) != undefined;

        let counter =
          maxUnfollowLimit != undefined ? maxUnfollowLimit : unfollows.length;

        for (let i = 0; i < counter; i++) {
          const unfollow = unfollows[i];

          if (isUnfollow) {
            const sectionLists = await page.$(custom.section);

            if (!Boolean(Math.floor((i + 1) % 6))) {
              await page.waitForTimeout(5000);

              await page.evaluate(() => {
                const element = document.querySelector(
                  'div[role="presentation"] > div > div > div > div:nth-child(3)'
                );

                element.scrollTo({
                  top: element.scrollHeight,
                  behavior: "smooth",
                });
              });
            }

            await page.waitForTimeout(2000);

            const newUnfollows = await page.$$(custom.unfollowList);

            let filterByIndex = Array.from(unfollows.keys());

            unfollows.push(
              ...newUnfollows.filter(
                (_, index) => !filterByIndex.includes(index)
              )
            );

            const unfollowButton = await unfollow.$(button.unfollow);

            counter =
              maxUnfollowLimit != undefined
                ? maxUnfollowLimit
                : unfollows.length;

            const isUnfollowButton =
              (await page.evaluate((e) => e.innerText, unfollowButton)) ==
              "Following";
            const peopleName = await page.evaluate(
              (e) => e.innerText,
              await unfollow.$(custom.unfollowPeopleName)
            );

            await page.waitForTimeout(3000);

            if (isUnfollowButton) await unfollowButton.click();

            await page.waitForTimeout(3000);

            const confirmElement = await page.$$(custom.unfollowDialog);
            const confirm = await confirmElement[1];

            if (confirm != undefined) {
              const confirmButton = await confirm.$(button.confirmUnfollow);
              await page.waitForTimeout(2000);

              await confirmButton.click();
              logger(`${account.username} has been unfollow ${peopleName}!`);
            }
          }
        }
      }
    } catch (e) {
      isFinished = false;
      console.log(`There are something error please try again latter`);
    }

    return isFinished;
  }
}

module.exports = new Instagram();
