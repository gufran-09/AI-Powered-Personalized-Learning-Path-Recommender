/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  transform: {},
  moduleFileExtensions: ["js", "mjs"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/services/**/*.js",
    "src/api/**/*.js",
    "!src/**/*.test.js",
  ],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 30000,
};
