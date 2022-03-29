const ascii = require("./ascii");
const chalk = require("chalk");
const inquirer = require("inquirer");
const Table = require("cli-table3");
const JSONdb = require("simple-json-db");
const readlineSync = require("readline-sync");
const db = new JSONdb("./db.json");
const bot = require("./bot");

process.stdout.write("\x1Bc");

const logger = (message) => {
  console.log(chalk.cyan(message));
};

const delay = (t, v) => {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
};

const table = new Table({
  chars: {
    top: "═",
    "top-mid": "╤",
    "top-left": "╔",
    "top-right": "╗",
    bottom: "═",
    "bottom-mid": "╧",
    "bottom-left": "╚",
    "bottom-right": "╝",
    left: "║",
    "left-mid": "╟",
    mid: "─",
    "mid-mid": "┼",
    right: "║",
    "right-mid": "╢",
    middle: "│",
  },
  head: ["Username", "Password"],
});

const optionTools = [
  {
    type: "list",
    name: "Options",
    message: "Select options",
    choices: ["Create account", "Start Service"],
  },
];

ascii.welcome(async () => {
  const users = db.get("Users");

  if (!users) table.push(["Not found data!", "Not found data!"]);
  else for (const user of users) table.push([user.username, user.password]);

  for (let i = 0; i < Infinity; i++) {
    let choices = await inquirer.prompt(optionTools);

    switch (choices.Options) {
      case "Start Service":
        console.log("\n" + table.toString() + "\n");

        const isStartService = readlineSync.question(
          "Do you want to running service ? (y/n): "
        );

        if (isStartService.trim() == "y") {
          const selectAccount = await inquirer.prompt({
            type: "list",
            name: "username",
            message: "Selected user",
            choices: users.map((user) => user.username),
          });

          const selectedAccount = users.filter((user) => {
            return user.username.includes(selectAccount.username);
          })[0];

          process.stdout.write("\x1Bc");

          await bot(selectedAccount);
        }

        await delay(3000);
        process.stdout.write("\x1Bc");

        ascii.welcome();
        break;
      case "Create account":
        const data = users == undefined ? [] : users;

        const isCreateAccount = readlineSync.question(
          "\nDo you want to create account ? (y/n): "
        );

        if (isCreateAccount.trim() == "y") {
          const inputUsername = await inquirer.prompt({
            type: "input",
            name: "username",
            message: "Input your instagram username",
          });

          const inputPassword = await inquirer.prompt({
            type: "input",
            name: "password",
            message: "Input your instagram password",
          });

          data.push({
            username: inputUsername.username.trim(),
            password: inputPassword.password.trim(),
          });

          db.set("Users", data);
          logger(`\nSuccessfully added ${inputUsername.username.trim()}`);
        }

        await delay(3000);
        process.stdout.write("\x1Bc");

        ascii.welcome();
        break;
    }
  }
});
