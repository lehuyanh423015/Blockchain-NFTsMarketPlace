// hooks/useNFTDetail.js
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { ipfsToHttp } from "../utils/format";

export function useNFTDetail(itemId) {
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadNFT = useCallback(async () => {
    if (!itemId) return;
    try {
      setLoading(true);

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider);
      const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider);

      const item = await market.idToMarketItem(itemId);
      const tokenUri = await nftContract.tokenURI(item.tokenId);
      const meta = await axios.get(ipfsToHttp(tokenUri));
      const image = ipfsToHttp(meta.data.image);

      setNft({
        price: ethers.utils.formatEther(item.price.toString()),
        itemId: item.itemId.toNumber(),
        tokenId: item.tokenId.toNumber(),
        seller: item.seller,
        owner: item.owner,
        image,
        name: meta.data.name,
        description: meta.data.description,
      });
    } catch (e) {
      console.error("detail load error:", e);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadNFT();
  }, [loadNFT]);

  return { nft, loading, reload: loadNFT };
}
