const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const replacements = {
  '#0F0F12': '#0f172a', // slate-900
  '#111114': '#1e293b', // slate-800
  '#16161A': '#1e293b', // slate-800
  '#1C1C22': '#334155', // slate-700
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [oldColor, newColor] of Object.entries(replacements)) {
        if (content.includes(oldColor)) {
          content = content.split(oldColor).join(newColor);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Replacement complete.');
