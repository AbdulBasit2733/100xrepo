import { Command } from "commander";
import inquirer from "inquirer";
import { execSync } from "child_process";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import path from "path";
import ora from "ora"; // 🔄 Loading effect
import chalk from "chalk"; // 🎨 Colored output

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, "templates", "turbo-repo");

const program = new Command();

program
  .argument("<project-name>", "Name of the new Turbo Repo project")
  .action(async (projectName) => {
    console.log(chalk.blue.bold(`\n🚀 Creating Turbo monorepo: ${projectName}...\n`));

    // User choices
    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "Next js",
        message: "Do you want to include an React Js For Frontend?",
        default: true,
      },
      {
        type: "confirm",
        name: "React Js",
        message: "Do you want to include an Next js?",
        default: true,
      },
      {
        type: "confirm",
        name: "React Native Expo",
        message: "Do you want to include an React Native Expo project ?",
        default: true,
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

    // Step 1: Copy Turbo Repo template
    const setupSpinner = ora("Setting up Turbo Repo...").start();
    try {
      fs.copySync(templatePath, targetPath, {
        dereference: true,
        filter: (src) => !src.includes("node_modules"),
      });
      setupSpinner.succeed(chalk.green("✅ Turbo Repo template added."));
    } catch (err) {
      setupSpinner.fail(chalk.red("❌ Failed to add Turbo Repo template."));
      console.error(err);
      process.exit(1);
    }

    // Step 2: Add selected components
    if (answers["Next js"]) {
      const httpSpinner = ora("Adding Next js ...").start();
      try {
        fs.copySync(
          path.join(__dirname, "templates/web"),
          path.join(targetPath, "apps/web")
        );
        httpSpinner.succeed(chalk.green("✅ Next js added."));
      } catch (err) {
        httpSpinner.fail(chalk.red("❌ Failed to add Next js."));
        console.error(err);
      }
    }
    if (answers["React Js"]) {
      const httpSpinner = ora("Adding React js ...").start();
      try {
        fs.copySync(
          path.join(__dirname, "templates/with-react"),
          path.join(targetPath, "apps/web")
        );
        httpSpinner.succeed(chalk.green("✅ React js added."));
      } catch (err) {
        httpSpinner.fail(chalk.red("❌ Failed to add React js."));
        console.error(err);
      }
    }
    if (answers.httpServer) {
      const httpSpinner = ora("Adding HTTP Server...").start();
      try {
        fs.copySync(
          path.join(__dirname, "templates/http-server"),
          path.join(targetPath, "apps/http-server")
        );
        httpSpinner.succeed(chalk.green("✅ HTTP Server added."));
      } catch (err) {
        httpSpinner.fail(chalk.red("❌ Failed to add HTTP Server."));
        console.error(err);
      }
    }

    if (answers.wsServer) {
      const wsSpinner = ora("Adding WebSocket Server...").start();
      try {
        fs.copySync(
          path.join(__dirname, "templates/ws-server"),
          path.join(targetPath, "apps/ws-server")
        );
        wsSpinner.succeed(chalk.green("✅ WebSocket Server added."));
      } catch (err) {
        wsSpinner.fail(chalk.red("❌ Failed to add WebSocket Server."));
        console.error(err);
      }
    }

    if (answers.database === "PostgreSQL (Prisma)") {
      const prismaSpinner = ora("Adding Prisma with PostgreSQL...").start();
      try {
        fs.copySync(
          path.join(__dirname, "templates/db/postgres"),
          path.join(targetPath, "packages/db")
        );
        prismaSpinner.succeed(chalk.green("✅ PostgreSQL (Prisma) added."));
      } catch (err) {
        prismaSpinner.fail(chalk.red("❌ Failed to add PostgreSQL (Prisma)."));
        console.error(err);
      }
    }

    // Step 3: Install dependencies
    const installSpinner = ora("📦 Installing dependencies...").start();
    try {
      execSync(`cd ${projectName} && pnpm install`, { stdio: "inherit" });
      installSpinner.succeed(chalk.green("✅ Dependencies installed."));
    } catch (err) {
      installSpinner.fail(chalk.red("❌ Failed to install dependencies."));
      console.error(err);
      process.exit(1);
    }

    console.log(chalk.cyan(`\n🚀 Done! Your Turbo Repo is ready in ${projectName}\n`));
  });

program.parse();
