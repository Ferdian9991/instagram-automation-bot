module.exports = {
  loginPage: {
    custom: {
      loginForm: "#loginForm",
    },
    input: {
      username: 'input[name="username"]',
      password: 'input[name="password"]',
    },
    button: {
      submitLogin: 'button[type="submit"]',
    },
  },
  exploreTagsPage: {
    custom: {
      post: 'article > div:nth-child(3) img[crossorigin="anonymous"]',
      modal: 'div[role="presentation"]',
      author: "article header:nth-child(1) a:nth-child(1)",
      warning:
        'div[role="presentation"] div[class="piCib"] button:nth-child(1)',
    },
    input: { comment: 'textarea[data-testid="post-comment-text-area"]' },
    button: {
      like: "article section:nth-child(1) button:nth-child(1)",
      submitWarning:
        'div[role="presentation"] div[class="piCib"] button:nth-child(2)',
      modalClose: 'div[role="presentation"] button:nth-child(1)',
      submitComment: 'form[method="POST"] button:nth-child(3)',
    },
  },
  homeFeedPage: {
    custom: {
      popupNotification:
        'div[role="presentation"] div[role="dialog"] div:nth-child(1)',
      article: "article",
      author: "article header a:nth-child(1)",
    },
    input: {
      comment: 'article textarea[data-testid="post-comment-text-area"]',
    },
    button: {
      skipPopupNotification:
        'div[role="presentation"] div[role="dialog"] div:nth-child(3) button:nth-child(2)',
      like: "article section:nth-child(1) button:nth-child(1)",
      unlike:
        'article > div section:nth-child(1) button:nth-child(1) svg[aria-label="Unlike"]',
      submitComment: "article section:nth-child(5) button:nth-child(3)",
    },
  },
  storiesPage: {
    custom: {
      popupNotification:
        'div[role="presentation"] div[role="dialog"] div:nth-child(1)',
      author:
        "section header > div:nth-child(2) > div:nth-child(1) > div > div a",
      seenLength: "section header > div:nth-child(1) > div",
      unseeing: "section header > div:nth-child(1) > div > div:nth-child(2)",
    },
    input: {},
    button: {
      skipPopupNotification:
        'div[role="presentation"] div[role="dialog"] div:nth-child(3) button:nth-child(2)',
      stories: 'main[role="main"] div[data-testid="story-tray-item"] > button',
      closeStory: 'div[id="react-root"] section > div:nth-child(3) button',
      next: 'div[class="coreSpriteRightChevron"]',
    },
  },
  peoplesPage: {
    custom: {
      peoples:
        'main[role="main"] > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div',
      peopleName: 'main[role="main"] div span',
    },
    input: {},
    button: {
      follow:
        'main[role="main"] > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div button',
    },
  },
  unfollowPage: {
    custom: {
      section: 'div[role="presentation"] > div > div > div > div:nth-child(3)',
      unfollowList: 'div[aria-label="Following"] div:nth-child(1) > li',
      unfollowPeopleName:
        'div[aria-label="Following"] div:nth-child(1) > li span a:nth-child(1)',
      unfollowDialog: 'div[role="dialog"]',
    },
    input: {},
    button: {
      following: "section ul:nth-child(2) li:nth-child(3)",
      unfollow: 'div[aria-label="Following"] div:nth-child(1) > li button',
      confirmUnfollow: "div button:nth-child(1)",
    },
  },
};
