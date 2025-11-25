import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useNFTDetail } from "../../hooks/useNFTDetail";
import { nftaddress, nftmarketaddress } from "../../config";
import NFTMarket from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function NFTDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { nft, loading } = useNFTDetail(id);

  async function buyNFT() {
    if (!nft) return;
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("Cài MetaMask trước.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      const price = ethers.utils.parseEther(nft.price.toString());

      const tx = await market.createMarketSale(nftaddress, nft.itemId, { value: price });
      await tx.wait();

      alert("Bought successfully!");
      router.push("/");
    } catch (e) {
      console.error("buy from detail error:", e);
      alert("❌ Error: " + e.message);
    }
  }

  if (loading || !nft)
    return <div className="p-10 text-lg font-medium">Loading NFT...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow rounded-xl space-y-6">
      <img src={nft.image} className="w-full rounded-xl shadow" alt={nft.name} />

      <h1 className="text-3xl font-bold">{nft.name}</h1>
      <p className="text-gray-600">{nft.description}</p>

      <p className="text-2xl font-semibold text-pink-600">{nft.price} ETH</p>

      <button
        onClick={buyNFT}
        className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
      >
        Buy NFT
      </button>
    </div>
  );
}
