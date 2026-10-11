// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import OpenZeppelin's audited ERC-721 implementation
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// Ownable restricts certain functions (not strictly needed for open minting, but good practice)
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MyNFT - a simple mintable ERC-721 NFT contract
/// @notice Anyone can mint an NFT to themselves by paying gas + providing a metadata URI
contract MyNFT is ERC721, Ownable {
    // Keeps track of the next token ID to assign.
    // Starts at 0, increments every time someone mints.
    uint256 private _nextTokenId;

    // Maps each token ID to its metadata URI (the IPFS link to the JSON file)
    mapping(uint256 => string) private _tokenURIs;

    // constructor runs once, when the contract is deployed
    // ERC721("Name", "SYMBOL") sets the collection name and ticker
    // Ownable(msg.sender) sets the deployer as the contract owner
    constructor() ERC721("MyCollegeNFT", "MCNFT") Ownable(msg.sender) {}

    /// @notice Mint a new NFT to the caller's wallet
    /// @param tokenURI_ the IPFS link to this NFT's metadata JSON (e.g. "ipfs://<CID>")
    /// @return the new token's ID
    function mintNFT(string memory tokenURI_) public returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
    
        // _safeMint checks the receiving address can actually handle NFTs
        // (prevents NFTs getting permanently stuck in contracts that don't support them)
        _safeMint(msg.sender, tokenId);
        
        _tokenURIs[tokenId] = tokenURI_;
        
        return tokenId;
    }
    
    /// @notice Returns the metadata URI for a given token ID
    /// @dev Overrides the base ERC721 tokenURI function to use our custom mapping
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // ownerOf() reverts automatically if tokenId doesn't exist — this IS our validation
        ownerOf(tokenId);
        return _tokenURIs[tokenId];
    }
    
    /// @notice How many NFTs have been minted so far
    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }
}
