/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(_, config) {
      config.baseUrl = "http://localhost:3000/";
      config.defaultCommandTimeout = 20000;
      config.projectId = "8vp4zn";
      config.video = false;
      config.screenshotOnRunFailure = false;
      config.scrollBehavior = "center";
      // config.retries = 1;
      //config.specPattern = "**/*.test.ts"
      return config;
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
