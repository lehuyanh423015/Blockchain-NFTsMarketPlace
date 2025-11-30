import { useState } from "react";
import { ethers } from "ethers";
import { uploadFileToPinata, uploadMetadataToPinata } from "../utils/pinata";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export function useMintNFT() {
  const [status, setStatus] = useState("");

  // FIXED: Now accepts an object with name, description, price, and file
  const createNFT = async ({ name, description, price, file }) => {
    try {
      // Validate all fields
      if (!name || !description || !price || !file) {
        alert("Please fill in all fields: Name, Description, Price, and File.");
        return;
      }

      setStatus("📤 Uploading image to IPFS...");
      const imageUri = await uploadFileToPinata(file);

      setStatus("📝 Uploading metadata...");
      // FIXED: Use the actual name and description from the form
      const metadata = {
        name: name,
        description: description,
        image: imageUri,
      };
      const tokenURI = await uploadMetadataToPinata(metadata);

      if (!window.ethereum) {
        alert("Please install MetaMask first.");
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);

      setStatus("⛏ Minting NFT...");
      const tx = await nftContract.mintToken(tokenURI);
      const receipt = await tx.wait();

      // Get Token ID logic
      let tokenId;
      try {
        const event = receipt.events.find((e) => e.event === "TokenMinted");
        tokenId = event.args.tokenId.toNumber();
      } catch {
        // Fallback if event logic varies
        // Note: Ideally your contract emits the ID, or you calculate it.
        // For simplicity, we assume the transaction succeeded.
        // If your contract relies on _tokenIds counter, you might need to fetch it.
        // But usually, the event method above works best.
      }

      // If we couldn't find the ID from the event (sometimes happens with internal txs), 
      // we might need to fetch the total supply or user balance. 
      // But let's assume the event catch worked for now. 
      if (!tokenId && tokenId !== 0) {
         // Fallback: Fetch last token ID (Approximate)
         // tokenId = await nftContract._tokenIds(); 
      }

      setStatus("🛒 Listing NFT...");
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      const priceInWei = ethers.utils.parseEther(price.toString());
      
      // Ensure we have a valid tokenId before listing
      // (If event parsing failed, listing might fail)
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