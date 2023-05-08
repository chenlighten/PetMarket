// SPDX-License-Identifier: MIT
pragma solidity 0.8.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract MyPetMarket is ERC721 {
    // Mapping from tokenId to the prices for sale.
    // If the tokenId does not exist in `tokensForSale`, the price is invalid.
    mapping (uint256 => uint256) private tokensPrice;
    // Actual tokenId of tokens listed for sale.
    EnumerableSet.UintSet private tokensForSale;

    constructor() ERC721("MyPetMarket", "MPM") {}
    
    // Mint a new pet (token)
    function mint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    // Transfer the ownership of a pet `tokenId` to another account specified by `to`.
    // The message sender must be owner of the token or approved to do so.
    function transfer(address to, uint256 tokenId) public {
        // Check if the message sender is authorized to transfer `tokenId`.
        require(_isApprovedOrOwner(_msgSender(), tokenId), "MyPetMarket: transfer caller is not owner nor approved");
        // Transfer the token actually.
        _transfer(_msgSender(), to, tokenId);
    }

    // List a pet `tokenId` for sale with a price `price`.
    // (1) The message sender must be the owner of `tokenId`
    // (2) The token `tokenId` must exist.
    // (3) The token must not be already listed for sale.
    function listPetForSale(uint256 tokenId, uint256 price) public {
        // Check all the requirements.
        require(_exists(tokenId), "The token for sale does not exist");
        require(_ownerOf(tokenId) == _msgSender(), "The token for sale does not belongs to you");
        require(!EnumerableSet.contains(tokensForSale, tokenId), "The token is already listed for sale");
        // Add the tokenId to `tokensForSale`.
        EnumerableSet.add(tokensForSale, tokenId);
        // Update the prices.
        tokensPrice[tokenId] = price;
    }

    // Get all the tokens and corresponding prices for sale.
    // No special permission is needed for this interface
    function getAllPetsForSale() public view returns (uint256[] memory, uint256[] memory) {
        // Get the tokens from tokensForSale
        uint256[] memory tokens = EnumerableSet.values(tokensForSale);
        uint256[] memory prices = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i += 1) {
            prices[i] = tokensPrice[tokens[i]];
        }
        return (tokens, prices);
    }

    // Remove a pet for sale.
    // The message sender must be the owner of the pet.
    // The pet must exists.
    // The pet must be listed for sale.
    function removePetForSale(uint256 tokenId) public {
        // Do the requirements checking
        require(_exists(tokenId), "The token for sale does not exist");
        require(_ownerOf(tokenId) == _msgSender(), "The token for sale does not belongs to you");
        require(EnumerableSet.contains(tokensForSale, tokenId), "The token is already listed for sale");
        // Do the actual removal.
        EnumerableSet.remove(tokensForSale, tokenId);
    }

    // But a pet.
    // The amount of ether should be set in message's value.
    // The pet must exists.
    // If the amount of ether specified is not enough, the transaction fails.
    // The buyer must be different from the owner.
    function buyPet(uint256 tokenId) public payable {
        // Do the checkings.
        require(_exists(tokenId), "Token id does not exist");
        require(EnumerableSet.contains(tokensForSale, tokenId), "The pet is not for sale");
        address tokenOwner = ownerOf(tokenId);
        require(_msgSender() != tokenOwner, "Can not buy a pet from yourself");
        require(msg.value >= tokensPrice[tokenId], "Insufficient Ether sent");

        // Transfer the ownership of pet
        _transfer(tokenOwner, msg.sender, tokenId);
        // Transfer the ether
        payable(tokenOwner).transfer(tokensPrice[tokenId]);

        // Remove the pet for sale.
        EnumerableSet.remove(tokensForSale, tokenId);
    }
}
