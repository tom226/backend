const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.resolve(__dirname, '..', 'Images');

const productFiles = [
  'Vermi Compost.jpg',
  'Neem Cake Powder.jpg',
  'Flower Mixture.png',
  'All in one mixture.png',
  'Plant Booster Spray.png',
  'Flower Booster Spray.png',
  'Plant Booster Spray (2).png',
  'Neem Oil.png',
  'Bone Meal.jpg',
  'Flower mixture 2.png',
];

const maxWidth = 1200;

async function optimizeImage(fileName) {
  const fullPath = path.join(imagesDir, fileName);
  if (!fs.existsSync(fullPath)) {
    return { fileName, status: 'missing' };
  }

  const originalStat = fs.statSync(fullPath);
  const image = sharp(fullPath, { failOnError: false });
  const metadata = await image.metadata();

  const pipeline = image
    .rotate()
    .resize({ width: Math.min(maxWidth, metadata.width || maxWidth), withoutEnlargement: true })
    .withMetadata({ exif: undefined, icc: undefined });

  if ((metadata.format || '').toLowerCase() === 'png') {
    await pipeline.png({ compressionLevel: 9, quality: 80, palette: true }).toFile(fullPath + '.tmp');
  } else {
    await pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(fullPath + '.tmp');
  }

  fs.renameSync(fullPath + '.tmp', fullPath);
  const optimizedStat = fs.statSync(fullPath);

  return {
    fileName,
    status: 'optimized',
    beforeKB: Math.round((originalStat.size / 1024) * 10) / 10,
    afterKB: Math.round((optimizedStat.size / 1024) * 10) / 10,
    reducedPct: Math.round(((originalStat.size - optimizedStat.size) / originalStat.size) * 1000) / 10,
  };
}

(async () => {
  const results = [];
  for (const fileName of productFiles) {
    results.push(await optimizeImage(fileName));
  }

  console.log('Product image optimization results:');
  for (const r of results) {
    if (r.status === 'missing') {
      console.log(`- ${r.fileName}: missing`);
    } else {
      console.log(`- ${r.fileName}: ${r.beforeKB}KB -> ${r.afterKB}KB (${r.reducedPct}% smaller)`);
    }
  }
})();
