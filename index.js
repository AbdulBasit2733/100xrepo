import { Command } from "commander";
import inquirer from "inquirer";
import { execSync } from "child_process";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import path from "path";
import ora from "ora";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, "templates", "turbo-repo");

const program = new Command();

program
  .argument("<project-name>", "Name of the new Turbo Repo project")
  .action(async (projectName) => {
    console.log(
      chalk.blue.bold(`\n🚀 Creating Turbo monorepo: ${projectName}...\n`)
    );

    const answers = await inquirer.prompt([
      {
        type: "checkbox",
        name: "frontends",
        message: "Select frontend frameworks to include:",
        choices: ["React", "Next.js", "Expo (React Native)"],
      },
      {
        type: "confirm",
        name: "httpServer",
        message: "Do you want to include an HTTP server?",
        default: true,
      },
      {
        type: "confirm",
        name: "wsServer",
        message: "Do you want to include a WebSocket server?",
        default: false,
      },
      {
        type: "list",
        name: "database",
        message: "Which database do you want to use?",
        choices: ["None", "PostgreSQL (Prisma)"],
      },
    ]);

    const targetPath = path.join(process.cwd(), projectName);
    const setupSpinner = ora("Setting up Turbo Repo...").start();
    try {
      fs.copySync(templatePath, targetPath, {
        dereference: true,
        filter: (src) => !src.includes("node_modules"),
      });
      setupSpinner.succeed(chalk.green("✅ Turbo Repo template added."));
    } catch (err) {
      setupSpinner.fail(chalk.red("❌ Failed to add Turbo Repo template."));
      console.error(chalk.yellow(err.message));
      process.exit(1);
    }

    const addComponent = (name, src, dest) => {
      const spinner = ora(`Adding ${name}...`).start();
      try {
        fs.copySync(path.join(__dirname, src), path.join(targetPath, dest));
        spinner.succeed(chalk.green(`✅ ${name} added.`));
      } catch (err) {
        spinner.fail(chalk.red(`❌ Failed to add ${name}.`));
        console.error(chalk.yellow(err.message));
      }
    };

    answers.frontends.forEach((frontend) => {
      if (frontend === "React")
        addComponent("React App", "templates/with-react", "apps/react-app");
      if (frontend === "Next.js")
        addComponent("Next.js App", "templates/with-next", "apps/next-app");
      if (frontend === "Expo (React Native)")
        addComponent("Expo App", "templates/with-expo", "apps/mobile");
    });

    if (answers.httpServer)
      addComponent("HTTP Server", "templates/http-server", "apps/http-server");
    if (answers.wsServer)
      addComponent("WebSocket Server", "templates/ws-server", "apps/ws-server");
    if (answers.database === "PostgreSQL (Prisma)")
      addComponent(
        "PostgreSQL (Prisma)",
        "templates/db/postgres",
        "packages/db"
      );
    // if (answers.database === "MongoDB") addComponent("MongoDB", "templates/db/mongodb", "packages/db/mongodb");
    // if (answers.database === "MySQL") addComponent("MySQL", "templates/db/mysql", "packages/db");

    const installSpinner = ora("📦 Installing dependencies...").start();
    try {
      execSync(`cd ${projectName} && pnpm install`, {
        stdio: "inherit",
      });
      installSpinner.succeed(chalk.green("✅ Dependencies installed."));
    } catch (err) {
      installSpinner.fail(
        chalk.red(
          `❌ Failed to install dependencies using pnpm.`
        )
      );
      console.error(chalk.yellow(err.message));
      process.exit(1);
    }

    console.log(
      chalk.cyan(`\n🚀 Done! Your Turbo Repo is ready in ${projectName}\n`)
    );
    console.log(chalk.magenta("📌 Next Steps:"));
    console.log(chalk.green(`  1. cd ${projectName}`));
    console.log(chalk.green("  2. Run your development server:"));
    if (answers.httpServer)
      console.log(chalk.yellow("     pnpm dev - in apps/http-server"));
    if (answers.frontends.includes("React"))
      console.log(chalk.yellow("     pnpm dev - in apps/react-app"));
    if (answers.frontends.includes("Next.js"))
      console.log(chalk.yellow("     pnpm dev - in apps/next-app"));
    if (answers.frontends.includes("Expo (React Native)"))
      console.log(chalk.yellow("     pnpm dev - in apps/expo-app"));
    console.log(chalk.green("  3. Start coding! 🚀"));
  });

program.parse();
