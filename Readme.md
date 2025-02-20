🚀 create-100xrepo

A powerful CLI tool to quickly scaffold a Turbo Repo-based monorepo with optional configurations for a frontend, backend, WebSocket server, and database setup.

✨ Features

Generates a Turbo Repo monorepo structure.

Includes optional templates:

Frontend: React, Next.js

Backend: Express (HTTP server)

WebSocket Server

Database: PostgreSQL (Prisma), MongoDB

Uses pnpm for package management.

📦 Installation

You can install the package globally:

npm install -g create-100xrepo

Or use it directly via npx:

npx create-100xrepo my-project

🛠 Usage

Run the CLI and follow the prompts:

npx create-100xrepo <project-name>

Example:

npx create-100xrepo my-turbo-app

The CLI will guide you through selecting the components you want to include in your project.

📂 Generated Folder Structure

Depending on your selections, your monorepo will look something like this:

my-turbo-app/
├── apps/
    ├── web/                    # Frontend (Next.js)
    ├── http-server/            # Backend (Http Server)
    ├── ws-server/              # Backend (Websocket server)
├── packages/
│   ├── db/             # Database setup (PostgreSQL)
├── turbo.json          # Turbo Repo config
├── package.json        # Root package.json
└── README.md

⚡ Commands

Run the development server

pnpm dev

Build the project

pnpm build

Start the production server

pnpm start

🔥 Contributing

Feel free to open issues and submit pull requests on GitHub:
GitHub Repository

📜 License

MIT License. See LICENSE for details.

