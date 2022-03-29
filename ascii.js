const figlet = require("figlet");
const chalk = require("chalk");

const callbackLoad = (message) => {
  console.log(chalk.cyan(message));
};

const ascii = (callback) => {
  figlet.text(
    "InstaAuto",
    {
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    },
    function (err, data) {
      if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
      }
      console.log(chalk.cyan(data));

      figlet.text(
        "Bot",
        {
          font: "Alligator",
          horizontalLayout: "default",
          verticalLayout: "default",
          width: 80,
          whitespaceBreak: true,
        },
        function (err, data) {
          if (err) {
            console.log("Something went wrong...");
            console.dir(err);
            return;
          }
          console.log(chalk.cyan(data) + "\n");
          if (typeof callback == "function") callback(callbackLoad);
        }
      );
    }
  );
};

module.exports = ascii;
