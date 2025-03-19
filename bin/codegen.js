#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

const plopfilePath = path.resolve(__dirname, "../dist/index.js");

try {
  execSync(
    `cross-env NODE_OPTIONS='--import tsx' plop --plopfile=${plopfilePath} generate-queries`,
    {
      stdio: "inherit",
      shell: true,
    }
  );
} catch (error) {
  console.error("❌ Error running postman-codegen:", error);
  process.exit(1);
}
