import { ethers } from "ethers";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { useMyNFTs } from "../hooks/useMyNFTs";
import NFTCard from "../components/NFTCard";

export default function MyAssets() {
  const { nfts, loading, reload } = useMyNFTs();

  async function resellNft(nft) {
    const newPrice = prompt("Nhập giá mới (ETH) để bán lại:", nft.price);
    if (!newPrice) return;

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("Cần MetaMask để resell.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);

      const approvalTx = await nftContract.setApprovalForAll(nftmarketaddress, true);
      await approvalTx.wait();

      const priceWei = ethers.utils.parseEther(newPrice.toString());
      const tx = await market.resellMarketItem(nftaddress, nft.itemId, priceWei);
      await tx.wait();

      alert("✅ Resell thành công!");
      await reload();
    } catch (err) {
      console.error("resellNft error:", err);
      alert("❌ Lỗi resell: " + err.message);
    }
  }

  if (loading) return <div className="p-10 text-lg font-medium">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Assets</h1>

      {nfts.length === 0 ? (
        <p>Bạn chưa sở hữu NFT nào.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {nfts.map((nft, idx) => (
            <NFTCard
              key={idx}
              nft={nft}
              onClick={() => {}}
              onAction={() => resellNft(nft)}
              actionLabel="Resell"
            />
          ))}
        </div>
      )}
    </div>
  );
}
