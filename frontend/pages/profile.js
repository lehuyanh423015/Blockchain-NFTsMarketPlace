// pages/profile.js
import NFTCard from "../components/NFTCard";
import { useMyNFTs } from "../hooks/useMyNFTs";
import { useCreatedNFTs } from "../hooks/useCreatedNFTs";

export default function Profile() {
  const { nfts: ownedNfts, loading: loadingOwned } = useMyNFTs();
  const { nfts: createdNfts, loading: loadingCreated } = useCreatedNFTs();

  const loading = loadingOwned || loadingCreated;

  if (loading) {
    return <div className="p-10 text-lg font-medium">Loading profile...</div>;
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Profile</h1>

      {/* NFTs đang sở hữu */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">NFTs I Own</h2>
        {ownedNfts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Bạn chưa sở hữu NFT nào. Hãy mua NFT trên trang <span className="font-semibold">Marketplace</span>.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {ownedNfts.map((nft, idx) => (
              <NFTCard
                key={`owned-${idx}`}
                nft={nft}
                onClick={() => {}}
                // không truyền onAction => không có nút
              />
            ))}
          </div>
        )}
      </section>

      {/* NFTs đã tạo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">NFTs I Created</h2>
        {createdNfts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Bạn chưa tạo NFT nào. Hãy vào trang <span className="font-semibold">Create</span>.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {createdNfts.map((nft, idx) => (
              <NFTCard
                key={`created-${idx}`}
                nft={nft}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
