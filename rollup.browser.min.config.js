import uglify from "rollup-plugin-uglify";
import config from "./rollup.browser.config";

config.plugins.push(uglify());
config.output.file = "dist/indigo-trace-sdk.min.js";

export default config;
