const fs = require("fs");
const path = require("path");

task("copy-artifacts", "Copy ABI artifacts to frontend")
  .setAction(async () => {
    const source = path.join(__dirname, "../artifacts/contracts");
    const destination = path.join(__dirname, "../frontend/artifacts/contracts");

    // Xóa artifacts cũ
    if (fs.existsSync(destination)) {
      fs.rmSync(destination, { recursive: true });
    }

    // Tạo lại thư mục
    fs.mkdirSync(destination, { recursive: true });

    // Copy toàn bộ ABI từ artifacts/contracts → frontend/artifacts/contracts
    copyFolderSync(source, destination);

    console.log("✔ Artifacts copied to frontend/artifacts");
  });

function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}
