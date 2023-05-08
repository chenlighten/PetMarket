const MyPetMarket = artifacts.require("MyPetMarket");

module.exports = function (deployer) {
  deployer.deploy(MyPetMarket);
};
