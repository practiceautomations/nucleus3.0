# Nucleus 3.0
### Feature branch flow

- Each Jira ticket needs a branch
- When the feature is ready for review, make a pull-request
- Two people must go through and review the PR
- If you have comments, mention them on the line level for others can see.
- Once you complete the review, comment on the PR that you have reviewed it
- The PR owner will go revise the code based on the comments
- Squash and merge the PR into the Dev repo

### Requirements

- [nvm](https://github.com/nvm-sh/nvm)

### Getting started

At root folder, run the following commands (if not installed the right node version, please install it before running this command):

```shell
nvm use
npm install
```

Then, you can run locally in development mode with live reload:

```shell
npm run dev
```

Open http://localhost:3000 with your favorite browser to see your project.

### Customizing SVG icons

For handling custom SVG icons that we have inside the new PAPM, we use the Image component from NextJS, and. to match the colors properly, we need to have all the SVG in black and from there apply some CSS to match the color that we want (you can use [this](https://codepen.io/sosuke/pen/Pjoqqp) CSS filter generator to convert from black to target hex color) to generate a CSS filter rule to match the color that you need.

### Deploy to production

You can see the results locally in production mode with:

```shell
$ npm run build
$ npm run start
```

The generated HTML and CSS files are minified (built-in feature from Next js). It will also removed unused CSS from [Tailwind CSS](https://tailwindcss.com).

You can create an optimized production build with:

```shell
npm run build-prod
```

Now, your blog is ready to be deployed. All generated files are located at `out` folder, which you can deploy with any hosting service.

### Testing

All tests are colocated with the source code inside the same directory. So, it makes it easier to find them. Unfortunately, it is not possible with the `pages` folder which is used by Next.js for routing. So, what is why we have a `pages.test` folder to write tests from files located in `pages` folder.

### VSCode information (optional)

If you are VSCode users, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode. The Debug configuration is also provided for frontend and backend debugging experience.

With the plugins installed on your VSCode, ESLint and Prettier can automatically fix the code and show you the errors. Same goes for testing, you can install VSCode Jest extension to automatically run your tests and it also show the code coverage in context.

Pro tips: if you need a project wide type checking with TypeScript, you can run a build with <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> on Mac.

### License

Licensed under the commercial license, Copyright © 2022
