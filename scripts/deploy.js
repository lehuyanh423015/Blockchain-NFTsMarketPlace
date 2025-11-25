const hre = require("hardhat");
const { saveFrontendFiles } = require("./utils/updateConfig");

async function main() {
  console.log("🚀 Deploying contracts...");

  // 1. Deploy Marketplace trước
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const market = await NFTMarket.deploy();
  await market.deployed();
  console.log("✔ NFTMarket deployed to:", market.address);

  // 2. Deploy NFT, truyền market.address vào constructor
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(market.address);
  await nft.deployed();
  console.log("✔ NFT deployed to:", nft.address);

  // 3. Ghi lại địa chỉ vào frontend/config.js
  saveFrontendFiles(nft.address, market.address);

  // 4. Copy artifacts cho frontend
  await hre.run("copy-artifacts");

  console.log("🎉 Deploy completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
