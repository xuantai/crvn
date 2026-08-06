const sharp = require('sharp');
const fs = require('fs');

async function processImage(inputPath, outputPath, publicPath, quality, maxWidth) {
  try {
    const inputSize = fs.statSync(inputPath).size;
    
    await sharp(inputPath)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .webp({ quality: quality })
      .toFile(outputPath);
      
    const outputSize = fs.statSync(outputPath).size;
    fs.copyFileSync(outputPath, publicPath);
    
    console.log(`Converted ${inputPath}:`);
    console.log(`  Original size: ${(inputSize / 1024).toFixed(2)} KB`);
    console.log(`  New size: ${(outputSize / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function main() {
  await processImage(
    'F:/code/git/crvn/dist/turntable-header.jpg',
    'F:/code/git/crvn/dist/turntable-header.webp',
    'F:/code/git/crvn/public/turntable-header.webp',
    75,
    1200
  );
  
  await processImage(
    'F:/code/git/crvn/dist/shelf-wood.jpg',
    'F:/code/git/crvn/dist/shelf-wood.webp',
    'F:/code/git/crvn/public/shelf-wood.webp',
    75,
    1200
  );
  
  await processImage(
    'F:/code/git/crvn/dist/musician2-bg.jpg',
    'F:/code/git/crvn/dist/musician2-bg.webp',
    'F:/code/git/crvn/public/musician2-bg.webp',
    70,
    800
  );
}

main();
