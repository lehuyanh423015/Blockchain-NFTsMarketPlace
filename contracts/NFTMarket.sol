// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // --- NEW: Offer Structure ---
    struct Offer {
        address payable bidder;
        uint256 price;
        bool active;
    }

    uint256 public itemCount;
    mapping(uint256 => MarketItem) public idToMarketItem;
    
    // --- NEW: Mapping itemId -> Array of Offers ---
    mapping(uint256 => Offer[]) public itemOffers; 

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

    // --- NEW: Offer Events ---
    event OfferMade(uint256 indexed itemId, address indexed bidder, uint256 price, uint256 offerIndex);
    event OfferCancelled(uint256 indexed itemId, uint256 offerIndex);
    event OfferAccepted(uint256 indexed itemId, address indexed bidder, uint256 price, uint256 offerIndex);

    // 1. Create Listing
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public nonReentrant {
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

    // 2. Buy NFT (Instant Buy)
    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
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

    // 3. Resell NFT
    function resellMarketItem(
        address nftContract,
        uint256 itemId,
        uint256 price
    ) public nonReentrant {
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

    // ---------------- NEW OFFER FUNCTIONS ----------------

    // 4. Make Offer (Buyer sends ETH to contract)
    function makeOffer(uint256 itemId) public payable nonReentrant {
        require(msg.value > 0, "Offer price must be > 0");
        MarketItem storage item = idToMarketItem[itemId];
        require(!item.sold, "Item already sold"); 

        Offer memory newOffer = Offer(
            payable(msg.sender),
            msg.value,
            true
        );

        itemOffers[itemId].push(newOffer);
        
        emit OfferMade(itemId, msg.sender, msg.value, itemOffers[itemId].length - 1);
    }

    // 5. Cancel Offer (Buyer withdraws ETH)
    function cancelOffer(uint256 itemId, uint256 offerIndex) public nonReentrant {
        Offer storage offer = itemOffers[itemId][offerIndex];
        require(offer.bidder == msg.sender, "Not your offer");
        require(offer.active == true, "Offer already inactive");

        offer.active = false;
        payable(msg.sender).transfer(offer.price);

        emit OfferCancelled(itemId, offerIndex);
    }

    // 6. Accept Offer (Seller accepts, NFT moves to bidder, ETH moves to seller)
    function acceptOffer(uint256 itemId, uint256 offerIndex) public nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        Offer storage offer = itemOffers[itemId][offerIndex];

        // Checks
        require(msg.sender == item.seller, "Only seller can accept");
        require(offer.active == true, "Offer inactive");
        require(!item.sold, "Item already sold");

        // State Updates
        offer.active = false;
        item.sold = true;
        item.owner = offer.bidder; // Ownership changes to Bidder

        // Transfers
        // 1. Pay the Seller (using the money stored in the offer)
        item.seller.transfer(offer.price);

        // 2. Transfer NFT from Contract to Bidder
        IERC721(item.nftContract).transferFrom(address(this), offer.bidder, item.tokenId);

        emit OfferAccepted(itemId, offer.bidder, offer.price, offerIndex);
    }

    // 7. Fetch Offers for an Item (For Frontend)
    function fetchOffers(uint256 itemId) public view returns (Offer[] memory) {
        return itemOffers[itemId];
    }

    // 🟢 8. Reject Offer (Seller rejects, money goes back to bidder)
    function rejectOffer(uint256 itemId, uint256 offerIndex) public nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        Offer storage offer = itemOffers[itemId][offerIndex];

        require(msg.sender == item.seller, "Only seller can reject");
        require(offer.active == true, "Offer already inactive");

        offer.active = false;
        
        // Refund the bidder
        payable(offer.bidder).transfer(offer.price);

        emit OfferCancelled(itemId, offerIndex);
    }
    // ---------------- EXISTING FETCH FUNCTIONS ----------------

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