import fs from 'fs';
import path from 'path';
import https from 'https';

const logoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCLpyknJVAtY4UFKawD4WuPFJm6smo0i1eWsb-htmj4EBxKsbnICT3w1Pn2XqMSIc7sVGrdtxL4uMkaNSfsiEpdzlWsfM9Cds2-S9ucCW83g8n21OIpOFI-Qxw4bPLGjevKS6W-yYqhPT8pTfoiEskm6cK43_QJlE9QAjENRKovlgfcf7OAiYhCiNSiBfoWNVpa2Azl4lQzQzYaVXVAAXQLf01_bWPFP_PEKlH4xs1bTioEe_WYGA";

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  const tempPath = path.resolve('scratch/logo.png');
  fs.mkdirSync(path.resolve('scratch'), { recursive: true });
  console.log('Downloading logo...');
  await downloadImage(logoUrl, tempPath);
  console.log('Logo downloaded.');

  const baseResDir = path.resolve('android/app/src/main/res');
  const mipmapDirs = [
    'mipmap-hdpi',
    'mipmap-mdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi',
    'drawable',
    'drawable-port-hdpi',
    'drawable-port-mdpi',
    'drawable-port-xhdpi',
    'drawable-port-xxhdpi',
    'drawable-port-xxxhdpi',
  ];

  for (const dir of mipmapDirs) {
    const targetDir = path.join(baseResDir, dir);
    if (fs.existsSync(targetDir)) {
      const filesToReplace = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png', 'splash.png'];
      for (const fileName of filesToReplace) {
        const filePath = path.join(targetDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.copyFileSync(tempPath, filePath);
          console.log(`Updated ${filePath}`);
        }
      }
    }
  }

  // Also update public/logo.png
  fs.copyFileSync(tempPath, path.resolve('public/logo.png'));
  console.log('Done replacing Android app icons!');
}

main().catch(console.error);
