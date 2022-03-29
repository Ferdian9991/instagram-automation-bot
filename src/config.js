const baseService = {
    instagram: {
        nameService: 'instagram',
        base: 'https://www.instagram.com/',
        tagUrl: (tag) => `https://www.instagram.com/explore/tags/${tag}`,
        explorePeople: 'https://www.instagram.com/explore/people/',
        userProfile: (username) => `https://www.instagram.com/${username}/`,
    },
    accountLists: [
        /**
         * For example account insertion format: 
         * {
         *      username: 'Your Instagram Username',
         *      password: 'Your instagram Password'
         * }
         */
    ],
    tagLists: [
        "love",
        "fashion",
        "car",
        "cartoon",
        "natural",
        "instadaily",
        "selfie",
        "summer",
        "style",
        "trend",
        "robot",
        "programming",
        "repost",
        "gaming",
        "anime",
        "onepunchman",
        "rimuru",
        "pictoftheday",
        "followme",
        "java",
        "javascript",
        "python",
        "react"
    ],
}

module.exports = baseService;