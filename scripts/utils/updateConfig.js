const fs = require("fs");
const path = require("path");

function saveFrontendFiles(nftAddress, marketAddress) {
  const configPath = path.join(__dirname, "../../frontend/config.js");

  const content = `
export const nftaddress = "${nftAddress}";
export const nftmarketaddress = "${marketAddress}";
`;

  fs.writeFileSync(configPath, content);
  console.log("✔ Updated frontend/config.js with new contract addresses");
}

module.exports = { saveFrontendFiles };
