const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.webp'];

function findAllImages(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAllImages(fullPath, results);
    } else if (IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

async function stripMetadata(filePath) {
  const buffer = fs.readFileSync(filePath);

  // sharp по умолчанию НЕ переносит метаданные (дату, геолокацию и т.п.) при пересохранении -
  // достаточно просто прогнать файл через него без .withMetadata(), формат сохраняется автоматически
  const cleaned = await sharp(buffer).toBuffer();
  fs.writeFileSync(filePath, cleaned);
}

async function main() {
  const targetDir = process.argv[2] || '.';
  const images = findAllImages(targetDir);
  console.log(`Найдено картинок: ${images.length}`);

  for (const imagePath of images) {
    try {
      await stripMetadata(imagePath);
      console.log(`Очищено: ${imagePath}`);
    } catch (err) {
      console.error(`Ошибка при обработке ${imagePath}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
