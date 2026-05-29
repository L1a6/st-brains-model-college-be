const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git'].includes(e.name)) continue;
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const repoRoot = path.resolve(__dirname, '..');
const srcDir = path.join(repoRoot, 'src');
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.yml', '.yaml']);

const files = walk(srcDir).filter((f) => exts.has(path.extname(f)));
let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes('<<<<<<< HEAD')) continue;
  // Replace all conflict blocks by keeping the HEAD part
  const pattern = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======[\s\S]*?\r?\n>>>>>>>[^\r\n]*\r?\n?/g;
  const newText = text.replace(pattern, (_, headPart) => headPart);
  if (newText !== text) {
    fs.writeFileSync(file, newText, 'utf8');
    changed++;
    console.log('Cleaned', file);
  }
}
console.log('Done. Files cleaned:', changed);
if (changed === 0) process.exit(1);
