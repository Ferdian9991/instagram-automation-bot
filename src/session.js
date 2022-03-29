const fs = require("fs");
const { join } = require("path");

if (!fs.existsSync(join(__dirname, "../session")))
  fs.mkdirSync(join(__dirname, "../session"), {
    recursive: true,
  });

const getCookies = async (page, sessionId, service) => {
  const cookies = await page.cookies();
  fs.writeFile(
    join(__dirname, "../session", service, `${sessionId}.json`),
    JSON.stringify(cookies, null, 4),
    (err) => {
      if (err) console.log(err);
      return;
    }
  );
};

const setCookies = async (page, sessionId, service) => {
  let cookiesString = fs.readFileSync(
    join(__dirname, "../session", service, `${sessionId}.json`),
    "utf8"
  );
  let cookies = JSON.parse(cookiesString);
  await page.setCookie.apply(page, cookies);
  return cookiesString;
};

module.exports = {
  getCookies,
  setCookies,
};
