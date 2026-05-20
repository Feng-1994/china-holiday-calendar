const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');
const unpackedDir = path.join(releaseDir, 'win-unpacked');
const resourcesDir = path.join(unpackedDir, 'resources');

console.log('=== 开始打包中国节假日日历 ===\n');

console.log('[1/5] 构建前端...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

console.log('\n[2/5] 使用 electron-builder 打包...');
if (!fs.existsSync(unpackedDir) || !fs.existsSync(path.join(unpackedDir, '中国节假日日历.exe'))) {
  try {
    execSync('npx electron-builder --dir --win portable', {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/' },
    });
  } catch (e) {
    if (!fs.existsSync(unpackedDir)) {
      console.error('错误：electron-builder 打包失败且未生成输出目录');
      process.exit(1);
    }
    console.log('electron-builder 报错（可能是签名步骤），但基础文件已生成，继续处理...');
  }
} else {
  console.log('已存在打包目录，跳过 electron-builder 步骤');
}

console.log('\n[3/5] 创建精简 asar 包...');
const asarSourceDir = path.join(releaseDir, 'app-source');
if (fs.existsSync(asarSourceDir)) {
  fs.rmSync(asarSourceDir, { recursive: true, force: true });
}
fs.mkdirSync(asarSourceDir, { recursive: true });

fs.cpSync(path.join(rootDir, 'dist'), path.join(asarSourceDir, 'dist'), { recursive: true });
fs.cpSync(path.join(rootDir, 'electron'), path.join(asarSourceDir, 'electron'), { recursive: true });

const pkgJson = {
  name: 'china-holiday-calendar',
  version: '1.0.0',
  main: 'electron/main.cjs',
};
fs.writeFileSync(path.join(asarSourceDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

const asarPath = path.join(resourcesDir, 'app.asar');
const asarNewPath = path.join(resourcesDir, 'app-new.asar');

try {
  execSync(`npx asar pack "${asarSourceDir}" "${asarNewPath}"`, { cwd: rootDir, stdio: 'inherit' });
} catch (e) {
  console.error('创建 asar 包失败:', e.message);
  process.exit(1);
}

if (fs.existsSync(asarPath)) {
  try {
    fs.unlinkSync(asarPath);
  } catch (e) {
    console.log('旧 asar 文件被锁定，尝试重命名...');
    try {
      fs.renameSync(asarPath, asarPath + '.old');
    } catch (e2) {
      console.log('重命名也失败，将使用新文件名');
    }
  }
}

try {
  fs.renameSync(asarNewPath, asarPath);
  console.log(`asar 包已创建: ${asarPath} (${(fs.statSync(asarPath).size / 1024 / 1024).toFixed(2)} MB)`);
} catch (e) {
  console.log(`asar 包已创建: ${asarNewPath} (${(fs.statSync(asarNewPath).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log('注意：由于旧文件被锁定，新 asar 使用了 app-new.asar 文件名');
}

fs.rmSync(asarSourceDir, { recursive: true, force: true });

console.log('\n[4/5] 清理多余文件...');
const localesDir = path.join(unpackedDir, 'locales');
if (fs.existsSync(localesDir)) {
  const keepLocales = ['zh-CN.pak', 'en-US.pak'];
  const allFiles = fs.readdirSync(localesDir);
  let removed = 0;
  for (const file of allFiles) {
    if (!keepLocales.includes(file)) {
      try {
        fs.unlinkSync(path.join(localesDir, file));
        removed++;
      } catch (e) {}
    }
  }
  console.log(`已清理 ${removed} 个多余语言文件，保留: ${keepLocales.join(', ')}`);
}

const cleanFiles = ['LICENSE.electron.txt', 'LICENSES.chromium.html'];
for (const file of cleanFiles) {
  const filePath = path.join(unpackedDir, file);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (e) {}
  }
}

console.log('\n[5/5] 创建 ZIP 压缩包...');
const zipPath = path.join(releaseDir, '中国节假日日历.zip');
if (fs.existsSync(zipPath)) {
  try { fs.unlinkSync(zipPath); } catch (e) {}
}

const sevenZipPath = path.join(rootDir, 'node_modules', '7zip-bin', 'win', 'x64', '7za.exe');
if (fs.existsSync(sevenZipPath)) {
  try {
    execSync(`"${sevenZipPath}" a -mx=9 "${zipPath}" "${unpackedDir}\\*"`, {
      cwd: unpackedDir,
      stdio: 'inherit',
    });
    console.log(`ZIP 包已创建: ${zipPath} (${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(2)} MB)`);
  } catch (e) {
    console.log('7-Zip 压缩失败，尝试 PowerShell 压缩...');
    tryCompressZip();
  }
} else {
  tryCompressZip();
}

function tryCompressZip() {
  try {
    execSync(`powershell -Command "Compress-Archive -Path '${unpackedDir}\\*' -DestinationPath '${zipPath}' -Force"`, {
      stdio: 'inherit',
    });
    console.log(`ZIP 包已创建: ${zipPath} (${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(2)} MB)`);
  } catch (e) {
    console.log('自动压缩失败，你可以手动压缩 release\\win-unpacked 目录');
  }
}

console.log('\n=== 打包完成！===');
console.log(`输出目录: ${unpackedDir}`);
console.log(`可执行文件: ${path.join(unpackedDir, '中国节假日日历.exe')}`);
console.log(`\n使用方法：将 win-unpacked 文件夹复制到任意 Windows 电脑，双击 中国节假日日历.exe 即可运行`);

const totalSize = getTotalSize(unpackedDir);
console.log(`总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

function getTotalSize(dir) {
  let size = 0;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getTotalSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (e) {}
  return size;
}
