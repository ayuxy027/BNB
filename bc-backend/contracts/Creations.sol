// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title Creations - Simple ERC721 for user-generated NFTs referencing IPFS metadata
/// @notice Store media/metadata on IPFS from the frontend; pass the ipfs:// URI here when minting.
contract Creations is ERC721Enumerable, ERC721URIStorage {
    uint256 private _nextTokenId;

    // Store additional metadata for better frontend integration
    struct CreationInfo {
        address creator;
        uint256 creationDate;
        string metadataURI;
        string license;     // NEW: License type (e.g., "free", "paid")
    }
    
    mapping(uint256 => CreationInfo) public creationInfo;
    
    // Store price information for paid NFTs
    mapping(uint256 => uint256) public tokenPrices;

    event CreationMinted(
        address indexed creator, 
        uint256 indexed tokenId, 
        string metadataURI,
        uint256 creationDate,
        string license      // NEW: Include license in event
    );
    
    event NFTPurchased(
        address indexed buyer,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );

    constructor() ERC721("Creations", "CRT") {}

    /// -----------------------------------------------------------------------
    /// 1) Mint NFT (to the connected user)
    /// -----------------------------------------------------------------------
    /// @param metadataURI The metadata URI (e.g. "ipfs://QmYUnFD8jD4jsptncWVbfyy5ZMaKQ1wmSpEY6XWnXmn6bn")
    /// @param license The license type (e.g., "free", "paid")
    /// @param price The price in wei (only required for paid NFTs)
    /// @return tokenId The newly minted token ID
    function mintNFT(string memory metadataURI, string memory license, uint256 price) external returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;               // start IDs at 1
        _safeMint(msg.sender, tokenId);         // mint to caller
        _setTokenURI(tokenId, metadataURI);     // store metadata URI
        
        // Store creation info for better tracking
        creationInfo[tokenId] = CreationInfo({
            creator: msg.sender,
            creationDate: block.timestamp,
            metadataURI: metadataURI,
            license: license
        });
        
        // Store price for paid NFTs
        if (keccak256(bytes(license)) == keccak256(bytes("paid"))) {
            require(price > 0, "Price must be greater than 0 for paid NFTs");
            tokenPrices[tokenId] = price;
        }
        
        emit CreationMinted(msg.sender, tokenId, metadataURI, block.timestamp, license);
    }

    /// -----------------------------------------------------------------------
    /// Purchase NFT (for paid NFTs only)
    /// -----------------------------------------------------------------------
    /// @param tokenId The token ID to purchase
    function purchaseNFT(uint256 tokenId) external payable {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) != msg.sender, "Cannot purchase your own NFT");
        
        string memory license = creationInfo[tokenId].license;
        require(keccak256(bytes(license)) == keccak256(bytes("paid")), "NFT is not for sale");
        
        uint256 price = tokenPrices[tokenId];
        require(price > 0, "NFT is not for sale");
        require(msg.value >= price, "Insufficient payment");
        
        address seller = ownerOf(tokenId);
        
        // Transfer the NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer the payment to the seller
        payable(seller).transfer(msg.value);
        
        // Clear the price (NFT is no longer for sale)
        delete tokenPrices[tokenId];
        
        emit NFTPurchased(msg.sender, seller, tokenId, msg.value);
    }

    /// -----------------------------------------------------------------------
    /// Helper function to check if token exists
    /// -----------------------------------------------------------------------
    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    /// -----------------------------------------------------------------------
    /// 2) Fetch my NFTs (by wallet address you provide)
    /// -----------------------------------------------------------------------
    /// @param owner The wallet address to query (MetaMask account)
    /// @return ids All token IDs owned by `owner`
    /// @return uris Corresponding tokenURIs for each token ID
    /// @return creators Original creators of each token
    /// @return creationDates Creation timestamps for each token
    /// @return licenses License types for each token
    function fetchNFTsByOwner(address owner)
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory uris,
            address[] memory creators,
            uint256[] memory creationDates,
            string[] memory licenses
        )
    {
        uint256 count = balanceOf(owner);
        ids = new uint256[](count);
        uris = new string[](count);
        creators = new address[](count);
        creationDates = new uint256[](count);
        licenses = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            ids[i] = tokenId;
            uris[i] = tokenURI(tokenId);
            creators[i] = creationInfo[tokenId].creator;
            creationDates[i] = creationInfo[tokenId].creationDate;
            licenses[i] = creationInfo[tokenId].license;
        }
    }

    /// -----------------------------------------------------------------------
    /// 3) Fetch all NFTs (for Home page)
    /// -----------------------------------------------------------------------
    /// @return ids All token IDs minted so far
    /// @return uris Corresponding tokenURIs
    /// @return owners Current owners of each token
    /// @return creators Original creators of each token
    /// @return creationDates Creation timestamps for each token
    /// @return licenses License types for each token
    function fetchAllCreations()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory uris,
            address[] memory owners,
            address[] memory creators,
            uint256[] memory creationDates,
            string[] memory licenses
        )
    {
        uint256 count = totalSupply();
        ids = new uint256[](count);
        uris = new string[](count);
        owners = new address[](count);
        creators = new address[](count);
        creationDates = new uint256[](count);
        licenses = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenByIndex(i);
            ids[i] = tokenId;
            uris[i] = tokenURI(tokenId);
            owners[i] = ownerOf(tokenId);
            creators[i] = creationInfo[tokenId].creator;
            creationDates[i] = creationInfo[tokenId].creationDate;
            licenses[i] = creationInfo[tokenId].license;
        }
    }

    /// -----------------------------------------------------------------------
    /// 4) Get license info for a specific token
    /// -----------------------------------------------------------------------
    /// @param tokenId The token ID to query
    /// @return license The license type for the token
    function getLicenseInfo(uint256 tokenId) external view returns (string memory license) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return creationInfo[tokenId].license;
    }

    /// -----------------------------------------------------------------------
    /// 5) Get all tokens by license type
    /// -----------------------------------------------------------------------
    /// @param licenseType The license type to filter by (e.g., "free", "paid")
    /// @return tokenIds Array of token IDs with the specified license
    function getTokensByLicense(string memory licenseType) external view returns (uint256[] memory tokenIds) {
        uint256 count = totalSupply();
        uint256 matchingCount = 0;
        
        // Count matching tokens first
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (keccak256(bytes(creationInfo[tokenId].license)) == keccak256(bytes(licenseType))) {
                matchingCount++;
            }
        }
        
        // Create array of matching token IDs
        tokenIds = new uint256[](matchingCount);
        uint256 index = 0;
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (keccak256(bytes(creationInfo[tokenId].license)) == keccak256(bytes(licenseType))) {
                tokenIds[index] = tokenId;
                index++;
            }
        }
    }

    /// -----------------------------------------------------------------------
    /// 6) Get price for a specific token
    /// -----------------------------------------------------------------------
    /// @param tokenId The token ID to query
    /// @return price The price in wei (0 if not for sale)
    function getTokenPrice(uint256 tokenId) external view returns (uint256 price) {
        require(_exists(tokenId), "Token does not exist");
        return tokenPrices[tokenId];
    }

    // --------------------------- Overrides (OZ v5 compatibility) ---------------------------

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Required by ERC721Enumerable (OZ v5)
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    // Required by ERC721Enumerable (OZ v5)
    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }
}