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
    }
    
    mapping(uint256 => CreationInfo) public creationInfo;

    event CreationMinted(
        address indexed creator, 
        uint256 indexed tokenId, 
        string metadataURI,
        uint256 creationDate
    );

    constructor() ERC721("Creations", "CRT") {}

    /// -----------------------------------------------------------------------
    /// 1) Mint NFT (to the connected user)
    /// -----------------------------------------------------------------------
    /// @param metadataURI The metadata URI (e.g. "ipfs://QmYUnFD8jD4jsptncWVbfyy5ZMaKQ1wmSpEY6XWnXmn6bn")
    /// @return tokenId The newly minted token ID
    function mintNFT(string memory metadataURI) external returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;               // start IDs at 1
        _safeMint(msg.sender, tokenId);         // mint to caller
        _setTokenURI(tokenId, metadataURI);     // store metadata URI
        
        // Store creation info for better tracking
        creationInfo[tokenId] = CreationInfo({
            creator: msg.sender,
            creationDate: block.timestamp,
            metadataURI: metadataURI
        });
        
        emit CreationMinted(msg.sender, tokenId, metadataURI, block.timestamp);
    }

    /// -----------------------------------------------------------------------
    /// 2) Fetch my NFTs (by wallet address you provide)
    /// -----------------------------------------------------------------------
    /// @param owner The wallet address to query (MetaMask account)
    /// @return ids All token IDs owned by `owner`
    /// @return uris Corresponding tokenURIs for each token ID
    /// @return creators Original creators of each token
    /// @return creationDates Creation timestamps for each token
    function fetchNFTsByOwner(address owner)
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory uris,
            address[] memory creators,
            uint256[] memory creationDates
        )
    {
        uint256 count = balanceOf(owner);
        ids = new uint256[](count);
        uris = new string[](count);
        creators = new address[](count);
        creationDates = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            ids[i] = tokenId;
            uris[i] = tokenURI(tokenId);
            creators[i] = creationInfo[tokenId].creator;
            creationDates[i] = creationInfo[tokenId].creationDate;
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
    function fetchAllCreations()
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory uris,
            address[] memory owners,
            address[] memory creators,
            uint256[] memory creationDates
        )
    {
        uint256 count = totalSupply();
        ids = new uint256[](count);
        uris = new string[](count);
        owners = new address[](count);
        creators = new address[](count);
        creationDates = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenByIndex(i);
            ids[i] = tokenId;
            uris[i] = tokenURI(tokenId);
            owners[i] = ownerOf(tokenId);
            creators[i] = creationInfo[tokenId].creator;
            creationDates[i] = creationInfo[tokenId].creationDate;
        }
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