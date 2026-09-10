const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const fs = require('fs');

async function check() {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  const res = await postcss([tailwind()]).process(css, { from: 'app/globals.css' });
  console.log('Output CSS length:', res.css.length);
  const lines = res.css.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('flex-row') || lines[i].includes('w-72')) {
      console.log(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5)).join('\n'));
      console.log('---');
    }
  }
}

check().catch(console.error);
