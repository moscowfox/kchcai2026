// 生成单文件部署版 index-deploy.html（内联 CSS/JS）
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const js = fs.readFileSync('script.js', 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n    </style>');
html = html.replace('<script src="script.js"></script>', '<script>\n' + js + '\n    </script>');
fs.writeFileSync('index-deploy.html', html);
console.log('index-deploy.html built:', html.length, 'bytes');
