// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarket {
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    uint256 public itemCount;
    mapping(uint256 => MarketItem) public idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event MarketItemReselled(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    // 🟢 Tạo listing mới
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public {
        require(price > 0, "Price must be > 0");

        itemCount++;
        uint256 itemId = itemCount;

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    // 🟢 Mua NFT
    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable {
        MarketItem storage item = idToMarketItem[itemId];
        require(msg.value == item.price, "Incorrect price");
        require(!item.sold, "Already sold");

        item.owner = payable(msg.sender);
        item.sold = true;

        item.seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, item.tokenId);

        emit MarketItemSold(
            itemId,
            nftContract,
            item.tokenId,
            item.seller,
            msg.sender,
            item.price
        );
    }

    // 🟢 Resell NFT (chủ mới bán lại)
    function resellMarketItem(
        address nftContract,
        uint256 itemId,
        uint256 price
    ) public {
        require(price > 0, "Price must be > 0");

        MarketItem storage item = idToMarketItem[itemId];
        require(item.owner == msg.sender, "Only owner can resell");

        item.seller = payable(msg.sender);
        item.owner = payable(address(0));
        item.price = price;
        item.sold = false;

        IERC721(nftContract).transferFrom(msg.sender, address(this), item.tokenId);

        emit MarketItemReselled(
            itemId,
            nftContract,
            item.tokenId,
            msg.sender,
            price
        );
    }

    // 🟢 NFT đang rao bán (owner == 0, chưa sold)
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 unsoldCount = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (!idToMarketItem[i].sold && idToMarketItem[i].owner == address(0)) {
                unsoldCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](unsoldCount);
        uint256 idx = 0;

        for (uint256 i = 1; i <= itemCount; i++) {
            if (!idToMarketItem[i].sold && idToMarketItem[i].owner == address(0)) {
                items[idx] = idToMarketItem[i];
                idx++;
            }
        }

        return items;
    }

    // 🟢 NFT tôi đang sở hữu (đã mua hoặc được chuyển cho mình)
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                count++;
            }
        }

        MarketItem[] memory items = new MarketItem[](count);
        uint256 idx = 0;

        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].owner == msg.sender) {
                items[idx] = idToMarketItem[i];
                idx++;
            }
        }

        return items;
    }

    // 🟢 Các NFT tôi đã đưa lên bán (dù đã bán hay chưa)
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                count++;
            }
        }

        MarketItem[] memory items = new MarketItem[](count);
        uint256 idx = 0;

        for (uint256 i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                items[idx] = idToMarketItem[i];
                idx++;
            }
        }

        return items;
    }
}
