// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint256 private _tokenIds;
    address public marketplaceAddress;

    event TokenMinted(uint256 tokenId, address owner, string tokenURI);

    constructor(address _marketplaceAddress) ERC721("MyNFT", "MNFT") {
        marketplaceAddress = _marketplaceAddress;
    }

    function mintToken(string memory tokenURI) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        // approve market được phép bán tất cả NFT của owner
        setApprovalForAll(marketplaceAddress, true);

        emit TokenMinted(newItemId, msg.sender, tokenURI);

        return newItemId;
    }
}
