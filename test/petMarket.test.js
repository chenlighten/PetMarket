const MyPetMarket = artifacts.require('MyPetMarket');
const truffleAssert = require('truffle-assertions');
const web3 = require("web3")

contract("MyPetMarket: test mint and transfer", (accounts) => {
    let myPetMarketInstance;

    before(async () => {
        myPetMarketInstance = await MyPetMarket.deployed();
    });

    it("should mint a new token", async () => {
        const tokenId1 = 1;
        const to1 = accounts[1];
        await myPetMarketInstance.mint(to1, tokenId1);
        const owner1 = await myPetMarketInstance.ownerOf(tokenId1);
        assert.equal(owner1, to1, "Token was not minted successfully");

        const tokenId2 = 2;
        const to2 = accounts[2];
        await myPetMarketInstance.mint(to2, tokenId2);
        const owner2 = await myPetMarketInstance.ownerOf(tokenId2);
        assert.equal(owner2, to2, "Token was not minted successfully");
    });

    it("should transfer a token", async () => {
        const tokenId = 1;
        const from = accounts[1];
        const to = accounts[2];
        await myPetMarketInstance.transfer(to, tokenId, { from });
        const owner = await myPetMarketInstance.ownerOf(tokenId);
        assert.equal(owner, to, "Token was not transferred successfully");
    });

    it("should not transfer a token that does not belong to oneself", async () => {
        const tokenId = 2;
        const from = await myPetMarketInstance.ownerOf(tokenId);
        const to = accounts[1];
        await truffleAssert.fails(myPetMarketInstance.transfer(to, tokenId, { to }));
    });
});

contract("MyPetMarket: test list for sale", (accounts) => {
    let myPetMarketInstance;
    let tokenId1, tokenId2;

    before(async () => {
        myPetMarketInstance = await MyPetMarket.deployed();
        tokenId1 = 1;
        tokenId2 = 2;
        const to1 = accounts[1];
        const to2 = accounts[2];
        await myPetMarketInstance.mint(to1, tokenId1);
        await myPetMarketInstance.mint(to2, tokenId2);
    });

    it("should list a pet for sale", async () => {
        const goodSender = accounts[1];
        await truffleAssert.passes(myPetMarketInstance.listPetForSale(tokenId1, 128, {from: goodSender}));
        const result = await myPetMarketInstance.getAllPetsForSale();
        const tokens = result[0];
        const prices = result[1];
        assert.equal(tokens.length, 1);
        assert.equal(prices.length, 1);
        assert.equal(tokens[0], tokenId1);
        assert.equal(prices[0], 128);
    });

    it("should not list a pet that already exists", async () => {
        const goodSender = accounts[1];
        await truffleAssert.fails(myPetMarketInstance.listPetForSale(tokenId1, 128, {from: goodSender}));
    });

    it("should not list a pet that does not belong to oneself", async () => {
        const badSender = accounts[1];
        await truffleAssert.fails(myPetMarketInstance.listPetForSale(tokenId2, 128, {from: badSender}));
    });

    it("should not list a pet that does not exist", async () => {
        await truffleAssert.fails(myPetMarketInstance.listPetForSale(10, 128));
    });

    it("should remove a token for sale", async () => {
        const goodSender = accounts[1];
        await truffleAssert.passes(myPetMarketInstance.removePetForSale(tokenId1, {from: goodSender}));
        const result = await myPetMarketInstance.getAllPetsForSale();
        const tokens = result[0];
        const prices = result[1];
        assert.equal(tokens.length, 0);
        assert.equal(prices.length, 0);
    });

    it("should not remove a pet that does not exist", async () => {
        const goodSender = accounts[1];
        await truffleAssert.fails(myPetMarketInstance.removePetForSale(10234, 128, {from: goodSender}));
    });

    it("should not remove a pet that does not belong to oneself", async () => {
        const badSender = accounts[1];
        await truffleAssert.fails(myPetMarketInstance.removePetForSale(tokenId2, 128, {from: badSender}));
    });

    it("should not remove a pet that is not listed", async () => {
        const goodSender = accounts[2];
        await truffleAssert.fails(myPetMarketInstance.removePetForSale(tokenId2, 128, {from: goodSender}));
    });
});

contract("MyPetMarket: should make purchases", (accounts) => {
    let myPetMarketInstance;
    let tokenId1, tokenId2;

    before(async () => {
        myPetMarketInstance = await MyPetMarket.deployed();
        tokenId1 = 1;
        tokenId2 = 2;
        const to1 = accounts[1];
        const to2 = accounts[2];
        await myPetMarketInstance.mint(to1, tokenId1);
        await myPetMarketInstance.mint(to2, tokenId2);
        await myPetMarketInstance.listPetForSale(tokenId1, 128, {from: to1});
        await myPetMarketInstance.listPetForSale(tokenId2, 128, {from: to2});
    }); 

    it("should buy a token with enough ether", async () => {
        await truffleAssert.passes(myPetMarketInstance.buyPet(tokenId1, {from: accounts[2], value: 256}));
        const owner = await myPetMarketInstance.ownerOf(tokenId1);
        assert.equal(owner, accounts[2], "Token was not bought successfully");
    });

    it("should not buy a token with insufficient ether", async () => {
        await truffleAssert.fails(myPetMarketInstance.buyPet(tokenId2, {from: accounts[1], value: 64}));
        const owner = await myPetMarketInstance.ownerOf(tokenId2);
        assert.equal(owner, accounts[2], "Token was bought successfully with insufficient ether");
    });

    it("should not buy a token that does not exist", async () => {
        await truffleAssert.fails(myPetMarketInstance.buyPet(100, {from: accounts[1], value: 128}));
    });

    it("should not buy a token from oneself", async () => {
        await truffleAssert.fails(myPetMarketInstance.buyPet(tokenId2, {from: accounts[2], value: 128}));
    });

    it("should not buy a token that is not for sale", async () => {
        await myPetMarketInstance.removePetForSale(tokenId2, {from: accounts[2]});
        await truffleAssert.fails(myPetMarketInstance.buyPet(tokenId2, {from: accounts[1], value: 128}));
    });
});
