const fs = require("fs");
const path = require("path");

function walk(dir, ext, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, ext, callback);
    } else if (filepath.endsWith(ext)) {
      callback(filepath);
    }
  });
}

walk("./frontend/app", ".tsx", file => {
  let content = fs.readFileSync(file, "utf8");
  let updated = content
    .replace(/<Link([^>]*)>\s*<a([^>]*)>/g, "<Link$1$2>")
    .replace(/<\/a>\s*<\/Link>/g, "</Link>");
  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    console.log(`Fixed: ${file}`);
  }
});
