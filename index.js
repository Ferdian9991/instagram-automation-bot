const chalk = require("chalk");
const inquirer = require("inquirer");
const Table = require("cli-table3");
const JSONdb = require("simple-json-db");
const readlineSync = require("readline-sync");
const bot = require("./bot");
const ascii = require("./ascii");

process.stdout.write("\x1Bc");

const logger = (message) => {
  console.log(chalk.cyan(message));
};

const delay = (t, v) => {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
};

let row = () => {
  return new Table({
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
};

const optionTools = [
  {
    type: "list",
    name: "Options",
    message: "Select options",
    choices: ["Create Account", "Edit Account", "Start Service", "← Exit"],
  },
];

ascii.welcome(async () => {
  let db = new JSONdb("./db.json");
  let users = db.get("Users");
  let table = row();

  while (true) {
    let choices = await inquirer.prompt(optionTools);

    switch (choices.Options) {
      case "Edit Account":
        const editAccount = async () => {
          db = new JSONdb("./db.json");
          users = db.get("Users");
          table = row();

          if (!users) table[0] = ["Not found data!", "Not found data!"];
          else
            for (let i = 0; i < users.length; i++)
              table[i] = [users[i].username, users[i].password];

          logger("\n" + table.toString() + "\n");

          if (users != undefined) {
            const selectAccount = await inquirer.prompt({
              type: "list",
              name: "username",
              message: "Select user",
              choices: users.map((user) => user.username).concat(["← Exit"]),
            });

            if (selectAccount.username != "← Exit") {
              const selectedAccount = users.filter((user) => {
                return user.username === selectAccount.username;
              })[0];

              process.stdout.write("\x1Bc");
              ascii.welcome();

              logger(`Selected user ${selectAccount.username}\n`);

              const editOptions = await inquirer.prompt({
                type: "list",
                name: "options",
                message: "Select option",
                choices: [
                  "Edit Username",
                  "Edit Password",
                  "Delete this account",
                  "← Exit",
                ],
              });

              switch (editOptions.options) {
                case "Edit Username":
                  const editedUsername = await inquirer.prompt({
                    type: "input",
                    name: "username",
                    message: "Input your new username!",
                  });

                  users
                    .filter((user) => user.username == selectedAccount.username)
                    .forEach(
                      (user) => (user.username = editedUsername.username)
                    );

                  db.set("Users", users);

                  process.stdout.write("\x1Bc");
                  ascii.welcome();
                  await editAccount();
                  break;
                case "Edit Password":
                  const editedPassword = await inquirer.prompt({
                    type: "input",
                    name: "password",
                    message: "Input your new password!",
                  });

                  users
                    .filter((user) => user.password == selectedAccount.password)
                    .forEach(
                      (user) => (user.password = editedPassword.password)
                    );

                  db.set("Users", users);

                  process.stdout.write("\x1Bc");
                  ascii.welcome();
                  await editAccount();
                  break;
                case "Delete this account":
                  users.splice(
                    users.findIndex(
                      (user) => user.username === selectedAccount.username
                    ),
                    1
                  );

                  db.set("Users", users);

                  process.stdout.write("\x1Bc");
                  ascii.welcome();
                  await editAccount();
                  break;
                case "← Exit":
                  process.stdout.write("\x1Bc");
                  ascii.welcome();
                  await editAccount();
                  break;
              }
              process.stdout.write("\x1Bc");
            } else {
              process.stdout.write("\x1Bc");
            }
          } else {
            logger("Please add an user first!!");
            await delay(3000);
            process.stdout.write("\x1Bc");
          }
          ascii.welcome();
        };
        await editAccount();
        break;
      case "Start Service":
        db = new JSONdb("./db.json");
        users = db.get("Users");
        table = row();

        if (!users) table[0] = ["Not found data!", "Not found data!"];
        else
          for (let i = 0; i < users.length; i++)
            table[i] = [users[i].username, users[i].password];

        logger("\n" + table.toString() + "\n");

        const isStartService = readlineSync.question(
          "Do you want to running service ? (y/n): "
        );

        if (isStartService.trim() == "y") {
          if (users != undefined) {
            const selectAccount = await inquirer.prompt({
              type: "list",
              name: "username",
              message: "Selected user",
              choices: users.map((user) => user.username).concat(["← Exit"]),
            });

            if (selectAccount.username != "← Exit") {
              const selectedAccount = users.filter((user) => {
                return user.username.includes(selectAccount.username);
              })[0];

              process.stdout.write("\x1Bc");

              await bot(selectedAccount);

              await delay(3000);
              process.stdout.write("\x1Bc");
            }

            process.stdout.write("\x1Bc");
          } else {
            logger("Please add an user first!!");
            await delay(3000);
            process.stdout.write("\x1Bc");
          }
        } else {
          process.stdout.write("\x1Bc");
        }

        ascii.welcome();
        break;
      case "Create Account":
        db = new JSONdb("./db.json");
        users = db.get("Users");
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

          await delay(3000);
        }
        process.stdout.write("\x1Bc");
        ascii.welcome();
        break;
      case "← Exit":
        process.exit();
        break;
    }
  }
});

const exitHandler = (options) => {
  if (options.cleanup) process.stdout.write("\x1Bc");
  if (options.exit) process.exit();
};

process.on("exit", exitHandler.bind(null, { cleanup: true }));
