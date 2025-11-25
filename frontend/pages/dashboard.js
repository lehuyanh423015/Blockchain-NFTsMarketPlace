// pages/dashboard.js
import { useCreatedNFTs } from "../hooks/useCreatedNFTs";
import { useMyNFTs } from "../hooks/useMyNFTs";

export default function Dashboard() {
  const { nfts: createdNfts, loading: loadingCreated } = useCreatedNFTs();
  const { nfts: ownedNfts, loading: loadingOwned } = useMyNFTs();

  const totalCreated = createdNfts.length;
  const totalOwned = ownedNfts.length;

  const listedCount = createdNfts.filter((n) => !n.sold).length;
  const soldCount = createdNfts.filter((n) => n.sold).length;

  const totalVolume = createdNfts
    .filter((n) => n.sold)
    .reduce((sum, n) => sum + parseFloat(n.price || "0"), 0);

  const loading = loadingCreated || loadingOwned;

  if (loading) {
    return <div className="p-10 text-lg font-medium">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Cards thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow border p-4">
          <div className="text-sm text-gray-500">NFTs created</div>
          <div className="text-3xl font-bold">{totalCreated}</div>
        </div>

        <div className="bg-white rounded-xl shadow border p-4">
          <div className="text-sm text-gray-500">NFTs currently listed</div>
          <div className="text-3xl font-bold">{listedCount}</div>
        </div>

        <div className="bg-white rounded-xl shadow border p-4">
          <div className="text-sm text-gray-500">NFTs sold</div>
          <div className="text-3xl font-bold">{soldCount}</div>
        </div>

        <div className="bg-white rounded-xl shadow border p-4">
          <div className="text-sm text-gray-500">Total volume (ETH)</div>
          <div className="text-3xl font-bold text-pink-600">
            {totalVolume.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Danh sách nhanh NFTs đã tạo */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recently created NFTs</h2>
        {createdNfts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Bạn chưa tạo NFT nào. Hãy vào trang <span className="font-semibold">Create</span>.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {createdNfts.slice(0, 5).map((nft) => (
              <li
                key={nft.itemId}
                className="flex justify-between border-b pb-1 text-gray-700"
              >
                <span>
                  #{nft.tokenId} – {nft.name || "Unnamed"}
                </span>
                <span>
                  {nft.price} ETH{" "}
                  <span className={nft.sold ? "text-green-600" : "text-yellow-600"}>
                    ({nft.sold ? "sold" : "listed"})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
