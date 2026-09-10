const fs = require('fs');

async function test() {
  const res = await fetch('http://localhost:3000/about');
  const html = await res.text();
  const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
  console.log('Style tags found:', styleMatches.length);
  for (let i = 0; i < styleMatches.length; i++) {
    const s = styleMatches[i];
    console.log(`Style ${i} length:`, s.length);
    console.log('has flex-row:', s.includes('flex-row'));
    console.log('has w-72:', s.includes('w-72'));
  }
}

test();
