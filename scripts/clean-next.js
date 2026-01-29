const fs = require("fs");
const path = require("path");

const target = process.argv[2] || ".next";
const dir = path.resolve(process.cwd(), target);

try {
  fs.rmSync(dir, {recursive: true, force: true});
} catch (error) {
  if (error && error.code !== "ENOENT") {
    console.error(`Failed to remove ${dir}:`, error);
    process.exit(1);
  }
}
