const TimeLockFactory = artifacts.require("TimelockFactory");
module.exports = async (deployer) => {
    deployer.deploy(TimeLockFactory);
}