const fs = require('fs');
const path = require('path');

const traverseAndFix = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndFix(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('tnDemoData')) {
        content = content.replace(/import \{ tnDemoData \} from "@\/lib\/tn-ai-data";/g, 'import { overviewEvents } from "@/lib/tn-ai-data";');
        content = content.replace(/tnDemoData\?\.evidenceStream \|\| \[\]/g, 'overviewEvents');
        content = content.replace(/tnDemoData\.evidenceStream/g, 'overviewEvents');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
};

traverseAndFix(path.join(__dirname, 'app'));
traverseAndFix(path.join(__dirname, 'components/tn-command-center'));
console.log('Fixed imports');
