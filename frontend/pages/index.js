import { useRouter } from "next/router";
import { ethers } from "ethers";
import { nftaddress, nftmarketaddress } from "../config";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { useMarketNFTs } from "../hooks/useMarketNFTs";
import NFTCard from "../components/NFTCard";

export default function Home() {
  const router = useRouter();
  const { nfts, loading, reload } = useMarketNFTs();

  async function buyNft(nft) {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("Cài MetaMask trước đã.");
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
      alert("✅ Mua NFT thành công!");
    } catch (err) {
      console.error("buyNft error:", err);
      alert("❌ Lỗi mua NFT: " + err.message);
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
          {nfts.map((nft, idx) => (
            <NFTCard
              key={idx}
              nft={nft}
              onClick={() => router.push(`/nft/${nft.itemId}`)}
              onAction={() => buyNft(nft)}
              actionLabel="Buy"
            />
          ))}
        </div>
      )}
    </div>
  );
}
