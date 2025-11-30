import { useRouter } from "next/router";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useNFTDetail } from "../../hooks/useNFTDetail";
import { nftaddress, nftmarketaddress } from "../../config";
import NFTMarket from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function NFTDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { nft, loading } = useNFTDetail(id);
  
  const [offerPrice, setOfferPrice] = useState("");
  const [offers, setOffers] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // 1. Check Wallet on Load
  useEffect(() => {
    checkWallet();
  }, []);

  // 2. Fetch Offers (FIXED: Only runs when nft.itemId changes)
  useEffect(() => {
    if (nft?.itemId) {
      fetchOffers(nft.itemId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft?.itemId]); 

  async function checkWallet() {
    if (typeof window !== "undefined" && window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0].toLowerCase());
      }
    }
  }

  async function fetchOffers(itemId) {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider);
      
      const data = await marketContract.fetchOffers(itemId);
      
      const formattedOffers = data.map((offer, index) => ({
        bidder: offer.bidder.toLowerCase(),
        price: ethers.utils.formatEther(offer.price),
        active: offer.active,
        index: index 
      }));
      
      setOffers(formattedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  }

  async function makeOffer() {
    if (!offerPrice || !nft) return;
    try {
      if (!window.ethereum) return alert("Install MetaMask");
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);

      const priceWei = ethers.utils.parseEther(offerPrice);

      const tx = await market.makeOffer(nft.itemId, { value: priceWei });
      setIsLoadingOffers(true);
      await tx.wait();
      
      alert("Offer made successfully!");
      setOfferPrice("");
      fetchOffers(nft.itemId); 
      setIsLoadingOffers(false);
    } catch (err) {
      console.error("Make offer error:", err);
      alert("Error: " + err.message);
      setIsLoadingOffers(false);
    }
  }

  // --- Cancel Offer Function (For Buyers) ---
  async function cancelOffer(offerIndex) {
    try {
      if (!window.ethereum) return alert("Install MetaMask");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);

      const tx = await market.cancelOffer(nft.itemId, offerIndex);
      setIsLoadingOffers(true);
      await tx.wait();

      alert("Offer Cancelled! Money refunded.");
      fetchOffers(nft.itemId); // Refresh list to remove the offer
      setIsLoadingOffers(false);
    } catch (err) {
      console.error("Cancel offer error:", err);
      alert("Error: " + err.message);
      setIsLoadingOffers(false);
    }
  }

  // --- Accept Offer Function (For Sellers) ---
  async function acceptOffer(offerIndex) {
    try {
      if (!window.ethereum) return alert("Install MetaMask");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);

      const tx = await market.acceptOffer(nft.itemId, offerIndex);
      setIsLoadingOffers(true);
      await tx.wait();

      alert("Offer Accepted! NFT Sold.");
      router.push("/");
    } catch (err) {
      console.error("Accept offer error:", err);
      alert("Error: " + err.message);
      setIsLoadingOffers(false);
    }
  }

  // --- NEW: Reject Offer Function (For Sellers) ---
  async function rejectOffer(offerIndex) {
    try {
      if (!window.ethereum) return alert("Install MetaMask");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);

      const tx = await market.rejectOffer(nft.itemId, offerIndex);
      setIsLoadingOffers(true);
      await tx.wait();

      alert("Offer Rejected! Money returned to bidder.");
      fetchOffers(nft.itemId); // Refresh list
      setIsLoadingOffers(false);
    } catch (err) {
      console.error("Reject offer error:", err);
      alert("Error: " + err.message);
      setIsLoadingOffers(false);
    }
  }

  async function buyNFT() {
    if (!nft) return;
    try {
      if (!window.ethereum) return alert("Install MetaMask");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      const price = ethers.utils.parseEther(nft.price.toString());

      const tx = await market.createMarketSale(nftaddress, nft.itemId, { value: price });
      await tx.wait();

      alert("Bought successfully!");
      router.push("/");
    } catch (e) {
      console.error("Buy error:", e);
      alert("Error: " + e.message);
    }
  }

  if (loading || !nft)
    return <div className="p-10 text-lg font-medium">Loading NFT...</div>;

  const isSeller = currentAccount === nft.seller?.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded-xl space-y-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
            <img src={nft.image} className="w-full rounded-xl shadow" alt={nft.name} />
        </div>

        <div className="w-full md:w-1/2 space-y-4">
            <h1 className="text-3xl font-bold">{nft.name}</h1>
            <p className="text-gray-600">{nft.description}</p>
            <p className="text-3xl font-semibold text-pink-600">{nft.price} ETH</p>

            {isSeller ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-bold text-yellow-800">You are the seller</p>
                    <p className="text-sm text-yellow-600">You cannot buy your own item, but you can manage offers below.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <button
                        onClick={buyNFT}
                        className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
                    >
                        Buy Now for {nft.price} ETH
                    </button>

                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="Offer Amount (ETH)" 
                            className="border p-3 rounded w-full"
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                        />
                        <button
                            onClick={makeOffer}
                            disabled={isLoadingOffers}
                            className="px-6 bg-gray-800 hover:bg-gray-900 text-white rounded font-semibold whitespace-nowrap"
                        >
                            {isLoadingOffers ? "Making..." : "Make Offer"}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4">Offers</h2>
        {offers.filter(o => o.active).length === 0 ? (
            <p className="text-gray-500">No active offers yet.</p>
        ) : (
            <div className="space-y-3">
                {offers.map((offer) => (
                    offer.active && (
                        <div key={offer.index} className="flex justify-between items-center p-4 bg-gray-50 rounded border">
                            <div>
                                <p className="font-bold">{offer.price} ETH</p>
                                <p className="text-sm text-gray-500">From: {offer.bidder.slice(0, 6)}...{offer.bidder.slice(-4)}</p>
                            </div>
                            
                            <div className="flex gap-2">
                                {/* SECTION: SELLER ACTIONS (Accept / Reject) */}
                                {isSeller && (
                                    <>
                                        <button 
                                            onClick={() => acceptOffer(offer.index)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold"
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            onClick={() => rejectOffer(offer.index)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {/* SECTION: BIDDER ACTIONS (Cancel) */}
                                {currentAccount === offer.bidder && (
                                     <button 
                                        onClick={() => cancelOffer(offer.index)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold"
                                     >
                                         Cancel
                                     </button>
                                )}
                            </div>
                        </div>
                    )
                ))}
            </div>
        )}
      </div>
    </div>
  );
}