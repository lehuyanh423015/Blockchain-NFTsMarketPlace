// components/NFTCard.js
export default function NFTCard({ nft, onClick, onAction, actionLabel }) {
  return (
    <div
      className="bg-white rounded-xl shadow hover:shadow-lg transition border cursor-pointer"
      onClick={onClick}
    >
      <img
        src={nft.image}
        className="w-full h-56 object-cover rounded-t-xl"
        alt={nft.name}
      />

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{nft.name}</h3>
        <p className="text-gray-500 text-sm min-h-[2rem]">{nft.description}</p>
        <p className="font-bold text-pink-600">{nft.price} ETH</p>

        {onAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
