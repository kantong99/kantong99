import { Config } from "@remotion/cli/config";
import { replaceLoadersWithBabel } from "@remotion/babel-loader";

Config.overrideBundlerConfig((currentConfiguration) => {
  return replaceLoadersWithBabel(currentConfiguration);
});
