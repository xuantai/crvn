const fs = require('fs');
const babel = require('@babel/core');

try {
  babel.transformSync(fs.readFileSync('src/App.tsx', 'utf8'), {
    presets: ['@babel/preset-react', '@babel/preset-typescript'],
    filename: 'src/App.tsx'
  });
  print("Success");
} catch (e) {
  console.log(e.message);
}
