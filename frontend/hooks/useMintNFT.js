// hooks/useMintNFT.js
import { useState } from "react";
import { ethers } from "ethers";
import { uploadFileToPinata, uploadMetadataToPinata } from "../utils/pinata";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export function useMintNFT() {
  const [status, setStatus] = useState("");

  const createNFT = async (file, price) => {
    try {
      if (!file || !price) {
        alert("Nhập giá và chọn file trước.");
        return;
      }

      setStatus("📤 Uploading image to IPFS...");
      const imageUri = await uploadFileToPinata(file);

      setStatus("📝 Uploading metadata...");
      const metadata = {
        name: `NFT #${Date.now()}`,
        description: "My NFT",
        image: imageUri,
      };
      const tokenURI = await uploadMetadataToPinata(metadata);

      if (!window.ethereum) {
        alert("Cài MetaMask trước đã.");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);

      setStatus("⛏ Minting NFT...");
      const tx = await nftContract.mintToken(tokenURI);
      const receipt = await tx.wait();

      let tokenId;
      try {
        const event = receipt.events.find((e) => e.event === "TokenMinted");
        tokenId = event.args.tokenId.toNumber();
      } catch {
        tokenId = await nftContract._tokenIds();
      }

      setStatus("🛒 Listing NFT...");
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      const priceInWei = ethers.utils.parseEther(price.toString());
      const tx2 = await market.createMarketItem(nftaddress, tokenId, priceInWei);
      await tx2.wait();

      setStatus("✅ NFT created & listed!");
      return true;
    } catch (err) {
      console.error("Create error:", err);
      setStatus("❌ Error: " + err.message);
      return false;
    }
  };

  return { createNFT, status };
}
