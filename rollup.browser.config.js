import nodeResolve from "rollup-plugin-node-resolve";

import config from "./rollup.base.config";

config.plugins.push(
  nodeResolve({
    browser: true
  })
);

config.output = {
  format: "umd",
  file: "dist/indigo-trace-sdk.js"
};

export default config;
