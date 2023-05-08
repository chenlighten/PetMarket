# E6883: PetMarket
*The project for course ELEN 6883 Blockchain*

## Team Member
Shichen Xu(sx2314).

## Project URL
https://github.com/chenlighten/PetMarket

## Overview
This project presents a virtual Pet Market. It is an etherum smart contract satisfying the ERC721 standard that provides a secure, effecient, and scalable way to trade the digital pets on etherum.

## Functions
This smart contract is called MyPetMarket and it is compatible with ERC721 standard. It enables the creation, transfer, listing, and buying of pet tokens, where each token represents a unique pet.
The contract has several functions. The `mint` function creates a new pet token and assigns ownership to the specified address. The `transfer` function allows the owner or an approved account to transfer the ownership of a pet token to another address.
The `listPetForSale` function allows the owner of a pet token to list it for sale with a specified price. The `getAllPetsForSale` function retrieves all the pets currently listed for sale along with their prices. The `removePetForSale` function allows the owner of a pet token to remove it from the sale listing.
Finally, the `buyPet` function allows a buyer to purchase a pet token listed for sale by transferring the specified amount of Ether to the owner's address and transferring the ownership of the token to the buyer. If the buyer does not send enough Ether or tries to buy their own pet, the transaction fails.

## Security
### Access Control
`transfer`, `listPetForSale`, and `removePetForSale` are functions that change the ownership or for-sale status of a token. For these functions, access control machanism is added to ensure these operations will only be executed by the authorized message senders, i.e. the owner of the token.
### Consistency and Data Validation
The `listPetForSale` and `buyPet` functions perform data validation to ensure that inputs and outputs are valid. For instance, the buyPet function checks that the pet is listed for sale and that the amount of Ether sent is sufficient.
### Atomicity
The buyPet function performs two critical actions - transferring the pet token ownership and transferring the Ether to the seller. These actions are performed atomically, which means that either both actions are executed or neither is executed. This is enforced by transferring the Ether to the seller before transferring the pet token ownership to the buyer.

## Efficiency
This smart contract is designed to be efficient in terms of data storage and retrieval, and the use of efficient data structures and algorithms reduces the computational cost of the contract's functions. For example, the `tokensForSale` uses an EnumerableSet.UintSet which is a set of uint256 values implemented using a hash table. This data structure has a constant time complexity for adding, removing, and checking for the presence of an element, which is an efficient way to keep track of which tokens are currently for sale.

## Run and Deploy
```
$ npm install
$ truffle compile
$ truffle install
```

## Test
Compehensive and detailed tests are conducted to ensure this smart contract perform the correct functions with security. To run the tests, use
```
$ truffle test
```
The test cases cover the mint and transfer of a pet token, the function to list a pet for sale, and several situations when a purchase is being made. The concret test cases are shown below:
```
  Contract: MyPetMarket: test mint and transfer
    ✔ should mint a new token (193ms)
    ✔ should transfer a token (240ms)
    ✔ should not transfer a token that does not belong to oneself (564ms)

  Contract: MyPetMarket: test list for sale
    ✔ should list a pet for sale (88ms)
    ✔ should not list a pet that already exists
    ✔ should not list a pet that does not belong to oneself
    ✔ should not list a pet that does not exist
    ✔ should remove a token for sale (118ms)
    ✔ should not remove a pet that does not exist
    ✔ should not remove a pet that does not belong to oneself
    ✔ should not remove a pet that is not listed

  Contract: MyPetMarket: should make purchases
    ✔ should buy a token with enough ether (227ms)
    ✔ should not buy a token with insufficient ether (38ms)
    ✔ should not buy a token that does not exist
    ✔ should not buy a token from oneself
    ✔ should not buy a token that is not for sale (211ms)
```

## Contribution
Shichen Xu(sx2314) has done all this project.