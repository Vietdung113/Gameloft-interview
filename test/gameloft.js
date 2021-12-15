const { BN, expectRevert, time } = require("@openzeppelin/test-helpers");
const TokenTimelock = artifacts.require("TokenTimelock");
const Web3 = require("web3");
const web3 = new Web3();
const Gameloft = artifacts.require("Gameloft");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
let GameloftToken;
// private
let privateERC20lockAddress;
let privateERC20lockContract;
let privateSaleAddress;
let privateCurrentBalance;
// public
let publicERC20lockAddress;
let publicERC20lockContract;
let publicSaleAddress;
let publicCurrentBalance;
// marketing
let marketingERC20lockAddress;
let marketingERC20lockContract;
let marketingAddress;
let marketingCurrentBalance;
contract("Gameloft", function (accounts) {
  before(async () => {
    GameloftToken = await Gameloft.deployed();
    // private
    privateERC20lockAddress = await GameloftToken.privateERC20lockAddress();
    privateERC20lockContract = await TokenTimelock.at(privateERC20lockAddress);
    privateSaleAddress = await GameloftToken.PRIVATE_SALE();
    // public
    publicERC20lockAddress = await GameloftToken.publicERC20lockAddress();
    publicERC20lockContract = await TokenTimelock.at(publicERC20lockAddress);
    publicSaleAddress = await GameloftToken.PUBLIC_SALE();

    // marketing
    marketingERC20lockAddress = await GameloftToken.marketingERC20lockAddress();
    marketingERC20lockContract = await TokenTimelock.at(
      marketingERC20lockAddress
    );
    marketingAddress = await GameloftToken.MARKETING();
  });
  it("test release at TGE", async () => {
    // TGE
    // private release 10%
    let amountPrivateTokenAtTGE = await GameloftToken.balanceOf(
      privateSaleAddress
    );
    privateCurrentBalance = new BN(amountPrivateTokenAtTGE, 10);
    let expectInitAmountPrivateTokenAtTGE = web3.utils.toWei(
      "21000000",
      "ether"
    );
    assert.equal(
      amountPrivateTokenAtTGE.toString(),
      expectInitAmountPrivateTokenAtTGE.toString()
    );
    // public release 20%
    let amountPublicTokenAtTGE = await GameloftToken.balanceOf(
      publicSaleAddress
    );
    publicCurrentBalance = new BN(amountPublicTokenAtTGE, 10);
    let expectInitAmountPublicTokenAtTGE = web3.utils.toWei("7571400", "ether");
    assert.equal(
      amountPublicTokenAtTGE.toString(),
      expectInitAmountPublicTokenAtTGE.toString()
    );
    // marketing
    let amountMarketingTokenAtTGE = await GameloftToken.balanceOf(
      marketingAddress
    );
    marketingCurrentBalance = new BN(amountMarketingTokenAtTGE, 10);
    let expectInitAmountMarketingTokenAtTGE = web3.utils.toWei("0", "ether");
    assert.equal(
      amountMarketingTokenAtTGE.toString(),
      expectInitAmountMarketingTokenAtTGE.toString()
    );
  });
  it("Test 30 days after deployed contract", async () => {
    time.increase(time.duration.days(30));
    // private shouldn't release any tokens
    await expectRevert(
      privateERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
    // public shouldn't release any tokens
    await expectRevert(
      publicERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
    // marketing shouldn't release any tokens
    await expectRevert(
      marketingERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
  });
  it("test 60 days after deployed contract", async () => {
    time.increase(time.duration.days(30));
    // private shouldn't release any tokens
    await expectRevert(
      privateERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
    // public shouldn't release any tokens
    await expectRevert(
      publicERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
    // marketing should release 10% (15000000 tokens) at 2rd month

    let previousMarketingToken = marketingCurrentBalance;
    await marketingERC20lockContract.release();
    marketingCurrentBalance = await GameloftToken.balanceOf(marketingAddress);
    let expectedMarketingReceivedToken = new BN(
      web3.utils.toWei("15000000", "ether"),
      10
    );
    assert.equal(
      marketingCurrentBalance.toString(),
      previousMarketingToken.add(expectedMarketingReceivedToken).toString()
    );
  });
  it("test 90 days after deployed contract", async () => {
    time.increase(time.duration.days(30));
    // private shouldn't release any tokens
    await expectRevert(
      privateERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
    // public shouldn't release any tokens
    await expectRevert(
      publicERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
    // marketing shouldn't release any tokens
    await expectRevert(
      marketingERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
  });
  it("test 120 days after deployed contract", async () => {
    time.increase(time.duration.days(30));
    // private should release 5%(9450000) tokens
    let previousPrivateToken = privateCurrentBalance;

    await privateERC20lockContract.release();
    let expectPrivateReceivedToken = new BN(
      web3.utils.toWei("9450000", "ether"),
      10
    );
    privateCurrentBalance = await GameloftToken.balanceOf(privateSaleAddress);
    assert.equal(
      privateCurrentBalance.toString(),
      expectPrivateReceivedToken.add(previousPrivateToken).toString()
    );
    // public should release 40%(15142800) tokens
    let previousPublicToken = publicCurrentBalance;
    await publicERC20lockContract.release();
    let expectPublicReceivedToken = new BN(
      web3.utils.toWei("15142800", "ether"),
      10
    );
    publicCurrentBalance = await GameloftToken.balanceOf(publicSaleAddress);
    assert.equal(
      publicCurrentBalance.toString(),
      expectPublicReceivedToken.add(previousPublicToken).toString()
    );
    // marketing shouldn't release any tokens
    await expectRevert(
      marketingERC20lockContract.release(),
      "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
    );
  });
});

it("should assert true", async function () {
  await Gameloft.deployed();
  return assert.isTrue(true);
});
