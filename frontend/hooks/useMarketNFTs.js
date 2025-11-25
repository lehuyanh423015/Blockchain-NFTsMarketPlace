// hooks/useMarketNFTs.js
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { ipfsToHttp } from "../utils/format";

export function useMarketNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNFTs = useCallback(async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider);
      const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider);

      const data = await market.fetchMarketItems();

      const items = await Promise.all(
        data.map(async (i) => {
          try {
            const tokenUri = await nftContract.tokenURI(i.tokenId);
            const meta = await axios.get(ipfsToHttp(tokenUri));

            const image = ipfsToHttp(meta.data.image);

            return {
              price: ethers.utils.formatEther(i.price.toString()),
              itemId: i.itemId.toNumber(),
              tokenId: i.tokenId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image,
              name: meta.data.name || `NFT #${i.tokenId.toNumber()}`,
              description: meta.data.description || "",
            };
          } catch (e) {
            console.error("map market item error:", e);
            return null;
          }
        })
      );

      setNfts(items.filter(Boolean));
    } catch (err) {
      console.error("load market nfts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return { nfts, loading, reload: loadNFTs };
}
