import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useEffect, useState } from "react"; // Import useState & useEffect
import { nftaddress, nftmarketaddress } from "../config";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { useMarketNFTs } from "../hooks/useMarketNFTs";
import NFTCard from "../components/NFTCard";

export default function Home() {
  const router = useRouter();
  const { nfts, loading, reload } = useMarketNFTs();
  
  // 1. State to store the current user's address
  const [currentAccount, setCurrentAccount] = useState("");

  // 2. Check wallet on load
  useEffect(() => {
    checkWallet();
  }, []);

  async function checkWallet() {
    if (typeof window !== "undefined" && window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0].toLowerCase());
      }
    }
  }

  async function buyNft(nft) {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("Please install MetaMask first.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      const price = ethers.utils.parseEther(nft.price.toString());

      const tx = await market.createMarketSale(nftaddress, nft.itemId, { value: price });
      await tx.wait();
      await reload();
      alert("✅ Bought NFT successfully!");
    } catch (err) {
      console.error("buyNft error:", err);
      alert("❌ Error buying NFT: " + err.message);
    }
  }

  if (loading) return <div className="p-10 text-lg font-medium">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>

      {nfts.length === 0 ? (
        <p>No NFTs listed.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {nfts.map((nft, idx) => {
            // 3. Check if current user is the seller
            // (We safely check if seller exists, then lowercase it)
            const isSeller = currentAccount === (nft.seller ? nft.seller.toLowerCase() : "");

            return (
              <NFTCard
                key={idx}
                nft={nft}
                onClick={() => router.push(`/nft/${nft.itemId}`)}
                
                // 4. Logic: If seller, pass NULL action (no button logic)
                onAction={isSeller ? null : () => buyNft(nft)}
                
                // 5. Logic: Change label to "Owner" or "Buy"
                actionLabel={isSeller ? "Owner" : "Buy"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}