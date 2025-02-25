#!/usr/bin/env node

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

const program = new Command();

process.on("uncaughtException", (err) => {
  console.error(chalk.red("❌ Fatal error:"));
  console.error(chalk.yellow(err.stack));
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error(chalk.red("❌ Unhandled promise rejection:"));
  console.error(chalk.yellow(err));
  process.exit(1);
});

program
  .argument("<project-name>", "Name of the new Turbo Repo project")
  .action(async (projectName) => {
    try {
      // Validate project name
      if (!projectName.match(/^[a-zA-Z0-9-_]+$/)) {
        throw new Error(
          "Project name can only contain letters, numbers, dashes and underscores"
        );
      }

      // Check if directory already exists
      if (fs.existsSync(path.join(process.cwd(), projectName))) {
        throw new Error(`Directory ${projectName} already exists`);
      }

      console.log(
        chalk.blue.bold(`\n🚀 Creating Turbo monorepo: ${projectName}...\n`)
      );

      // First ask for package manager
      const packageManagerAnswer = await inquirer.prompt([
        {
          type: "list",
          name: "packageManager",
          message: "Which package manager would you like to use?",
          choices: ["pnpm", "npm", "bun"],
          default: "pnpm",
        },
      ]);

      const templatePath = path.join(
        __dirname,
        "templates",
        "package_manager",
        packageManagerAnswer.packageManager,
        "turbo-repo"
      );

      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "database",
          message: "Which database would you like to use?",
          choices: ["postgres", "mongodb", "none"],
          default: "postgres",
        },
        {
          type: "confirm",
          name: "nextJs",
          message: "Do you want to include a Next.js app?",
          default: true,
        },
        {
          type: "confirm",
          name: "reactNativeExpo",
          message: "Do you want to include a React Native Expo app?",
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
      ]);

      const targetPath = path.join(process.cwd(), projectName);
      const setupSpinner = ora("Setting up Turbo Repo...").start();

      // Verify template exists before proceeding
      if (!fs.existsSync(templatePath)) {
        setupSpinner.fail(chalk.red("❌ Template directory not found."));
        throw new Error(`Template directory not found at: ${templatePath}`);
      }

      try {
        fs.copySync(templatePath, targetPath, {
          dereference: true,
          filter: (src) => !src.includes("node_modules"),
        });
        setupSpinner.succeed(chalk.green("✅ Turbo Repo template added."));
      } catch (err) {
        setupSpinner.fail(chalk.red("❌ Failed to add Turbo Repo template."));
        throw err;
      }

      const addComponent = (name, src, dest) => {
        const sourcePath = path.join(
          __dirname,
          "templates",
          "package_manager",
          packageManagerAnswer.packageManager,
          src
        );
        const spinner = ora(`Adding ${name}...`).start();

        if (!fs.existsSync(sourcePath)) {
          spinner.fail(
            chalk.red(`❌ Template for ${name} not found at ${sourcePath}`)
          );
          throw new Error(`Template directory not found: ${sourcePath}`);
        }

        try {
          fs.copySync(sourcePath, path.join(targetPath, dest));
          spinner.succeed(chalk.green(`✅ ${name} added.`));
        } catch (err) {
          spinner.fail(chalk.red(`❌ Failed to add ${name}.`));
          throw err;
        }
      };

      // Add database if selected
      if (answers.database === "postgres") {
        addComponent("PostgreSQL (Prisma)", "db/postgres", "packages/db");
      } else if (answers.database === "mongodb") {
        addComponent("MongoDB", "db/mongodb", "packages/db");
      }

      // Add apps using common templates regardless of database choice
      if (answers.nextJs) {
        if (answers.database === "mongodb") {
          addComponent("Next.js App", "with_mongodb/web", "apps/web");
        } else if (answers.database === "postgres") {
          addComponent("Next.js App", "with_postgres/web", "apps/web");
        }
      }

      if (answers.reactNativeExpo) {
        addComponent("React Native Expo App", "mobile", "apps/mobile");
      }

      if (answers.httpServer) {
        if (answers.database === "mongodb") {
          addComponent(
            "HTTP Server",
            "with_mongodb/http-server",
            "apps/http-server"
          );
        } else if (answers.database === "postgres") {
          addComponent(
            "HTTP Server",
            "with_postgres/http-server",
            "apps/http-server"
          );
        }
      }

      if (answers.wsServer) {
        if (answers.database === "mongodb") {
          addComponent(
            "WebSocket Server",
            "with_mongodb/ws-server",
            "apps/ws-server"
          );
        } else if (answers.database === "postgres") {
          addComponent(
            "WebSocket Server",
            "with_postgres/ws-server",
            "apps/ws-server"
          );
        }
      }

      const installSpinner = ora("📦 Installing dependencies...").start();
      try {
        execSync(
          `cd ${projectName} && ${packageManagerAnswer.packageManager} install`,
          {
            stdio: "inherit",
          }
        );
        installSpinner.succeed(chalk.green("✅ Dependencies installed."));
      } catch (err) {
        installSpinner.fail(
          chalk.red(
            `❌ Failed to install dependencies using ${packageManagerAnswer.packageManager}.`
          )
        );
        throw err;
      }

      if (answers.database === "postgres") {
        const prismaSpinner = ora("🔧 Setting up Prisma...").start();
        try {
          execSync(
            `cd ${projectName}/packages/db && ${
              packageManagerAnswer.packageManager
            } install && ${
              packageManagerAnswer.packageManager === "npm"
                ? "npx"
                : packageManagerAnswer.packageManager === "bun"
                ? "bunx"
                : "pnpx"
            } prisma generate`,
            {
              stdio: "inherit",
            }
          );
          prismaSpinner.succeed(chalk.green("✅ Prisma setup completed."));
          if (answers.reactNativeExpo) {
            execSync(
              `cd ${projectName}/apps/mobile && ${packageManagerAnswer.packageManager} install`,
              {
                stdio: "inherit",
              }
            );
            prismaSpinner.succeed(
              chalk.green("✅ React Native Expo setup completed.")
            );
          }
        } catch (err) {
          prismaSpinner.fail(chalk.red("❌ Failed to setup Prisma."));
          throw err;
        }
      } else if (answers.database === "mongodb") {
        const mongoSpinner = ora("🔧 Setting up MongoDB...").start();
        try {
          execSync(
            `cd ${projectName}/packages/db && ${packageManagerAnswer.packageManager} install`,
            {
              stdio: "inherit",
            }
          );
          mongoSpinner.succeed(chalk.green("✅ MongoDB setup completed."));

          if (answers.reactNativeExpo) {
            execSync(
              `cd ${projectName}/apps/mobile && ${packageManagerAnswer.packageManager} install`,
              {
                stdio: "inherit",
              }
            );
            mongoSpinner.succeed(
              chalk.green("✅ React Native Expo setup completed.")
            );
          }
        } catch (err) {
          mongoSpinner.fail(chalk.red("❌ Failed to setup MongoDB."));
          throw err;
        }
      }

      console.log(
        chalk.cyan(`\n🚀 Done! Your Turbo Repo is ready in ${projectName}\n`)
      );
      console.log(chalk.magenta("📌 Next Steps:"));
      console.log(
        chalk.green(
          `  1. cd ${projectName} && ${packageManagerAnswer.packageManager} install`
        )
      );
      console.log(chalk.green("  2. Run your development server:"));

      console.log(
        chalk.yellow("     " + packageManagerAnswer.packageManager + " dev")
      );

      if (answers.reactNativeExpo) {
        console.log(chalk.green(`for react native expo, run: `));
        console.log(
          chalk.yellow(
            "     " + packageManagerAnswer.packageManager + " mobile"
          )
        );
      }
      console.log(chalk.green("  3. Start coding! 🚀"));
    } catch (error) {
      console.error(chalk.red("\n❌ Setup failed:"));
      console.error(chalk.yellow(error.message));

      // Cleanup on failure
      try {
        const projectPath = path.join(process.cwd(), projectName);
        if (fs.existsSync(projectPath)) {
          fs.removeSync(projectPath);
          console.log(chalk.yellow("\nCleaned up failed installation"));
        }
      } catch (cleanupError) {
        console.error(chalk.red("\nFailed to clean up:"), cleanupError.message);
      }

      process.exit(1);
    }
  });

program.parse();
