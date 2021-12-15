const Gameloft = artifacts.require("Gameloft");
module.exports = async (deployer) => {
  deployer.deploy(Gameloft);
};
