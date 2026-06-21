const fs = require('fs');

const readmePath = 'README.md';
let content = fs.readFileSync(readmePath, 'utf8');

// Regex to match markdown image tags that link to the numbered screenshots
// e.g. ![...](public/docs/01_...) up to 15_...
const regex = /!\[.*?\]\(public\/docs\/\d{2}_.*?\.png\)/g;

let newContent = content.replace(regex, '');

// Also remove any empty lines that might have been left behind (optional, but let's just do a clean replace)
newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync(readmePath, newContent);
console.log('Removed numbered screenshots from README.');
