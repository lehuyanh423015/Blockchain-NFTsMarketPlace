// hooks/useMyNFTs.js
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { ipfsToHttp } from "../utils/format";

export function useMyNFTs() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyNFTs = useCallback(async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        alert("Cần MetaMask để xem tài sản.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const market = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);

      const data = await market.fetchMyNFTs();

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
            console.error("map my nft error:", e);
            return null;
          }
        })
      );

      setNfts(items.filter(Boolean));
    } catch (err) {
      console.error("loadMyNFTs error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyNFTs();
  }, [loadMyNFTs]);

  return { nfts, loading, reload: loadMyNFTs };
}
