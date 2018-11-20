# Artoo
Artoo is a library I built mostly for myself to set up a simple API and and SPA, avoiding verbose code and focus on the actual application.

Artoo offers:
- ORM
- Server solution using express
- Dependency injection and factory
- Database migration
- Scaffolding projects
- Limited CLI command palette
- Simple authentication service

The library is documented at most and offered as is. No guaranties that it will work out of the box. My goal is to offer a stable solution but for my needs this is working very well for now.

## Get Started
Download the scaffold folder from the repo and put the content in the root folder of your project. Install by running either npm or yarn. All dependencies are in the package.json folder.

The scaffold project has two major folders: `api` and `spa`. Each one is it's own application and in theory can be run on their own. Instead however they are run together under one express instance. Look at the `/server.ts` file to see for your self. The root of each application has and index.ts file (`/api/index.ts`). Here you will find configs for that server.

API apps has the following file structure:
- `index.ts` - The server configs
- `routes.ts` - Routing
- `middlewares.ts` - Route guards
- `controllers/` - Controllers
- `models/` - ORM models

Using yarn you can run the artoo CLI. Available commands are:
- `yarn artoo migrate` - Run migration scripts from your storage/migrations folder
- `yarn artoo create:migration --class="NAME"` - Create a new migration script named after the class argument
- `yarn artoo create:user --username="user@email.com" --password="yourpasswordhere" --group="nameofgroup"` - Creating a new user and insert it to the database. If group doesn't exists it will be created.

Feel happy to ask questions and submit pull requests. This document will be updated as the project continues.