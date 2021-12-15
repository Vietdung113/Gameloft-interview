const { BN, expectRevert, time } = require("@openzeppelin/test-helpers");
const Gameloft = artifacts.require("Gameloft");
const TokenTimelock = artifacts.require("TokenTimelock");
const TimelockFactory = artifacts.require("TimelockFactory");
const Web3 = require("web3");
const web3 = new Web3();
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
let tokenTimelockContract;
let tokenTimelockContractAddress;
let periodReleaseAmount;
let targetMonthReleaseAmount;
contract("Gameloft", function (accounts) {
  before(async function () {
    GameloftToken = await Gameloft.deployed();
    timelockFactoryContract = await TimelockFactory.deployed();
    // should burn for run test.
  });
  describe("tokenTimelock Contract for private, team, partner, reverse", async function () {
    beforeEach(async function () {
      let startDuration = time.duration.days(120);
      let currentTime = await time.latest();
      let startTime = currentTime.add(startDuration);
      let period = time.duration.days(30);
      periodReleaseAmount = web3.utils.toWei("9450000", "ether");
      const tokenTimeLockContractReceipt =
        await timelockFactoryContract.createTimelock(
          Gameloft.address,
          accounts[1],
          startTime,
          period,
          periodReleaseAmount,
          [],
          []
        );
      tokenTimelockContractAddress =
        tokenTimeLockContractReceipt.logs[0].args["0"];

      console.log(tokenTimelockContractAddress);
      tokenTimelockContract = await TokenTimelock.at(
        tokenTimelockContractAddress
      );
    });
    it("init tokenTimelockContract", async function () {
      let tokenAddress = await tokenTimelockContract.token();
      assert.equal(tokenAddress, Gameloft.address);
      let beneficiary = await tokenTimelockContract.beneficiary();
      assert.equal(beneficiary, accounts[1]);
    });
    it("token Release for Private sale, team, partner, reverse", async function () {
      // mint 189000000 locked tokens for tokenTimelockContract
      let mintAmount = web3.utils.toWei("189000000", "ether");
      await GameloftToken.mint(tokenTimelockContractAddress, mintAmount);
      await expectRevert(
        tokenTimelockContract.release(),
        "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
      );
      // console.log(tokenAddress);
      let days120 = time.duration.days(120);
      await time.increase(days120);

      await tokenTimelockContract.release();

      let currentTokenReceived = await GameloftToken.balanceOf(accounts[1]);

      assert.equal(currentTokenReceived.toString(), periodReleaseAmount);

      let days31 = time.duration.days(31);
      await time.increase(days31);
      await tokenTimelockContract.release();
      currentTokenReceived = await GameloftToken.balanceOf(accounts[1]);
      let expectedReleaseAmount = new BN(periodReleaseAmount, 10).mul(
        new BN("2", 10)
      );
      // console.log(expectedReleaseAmount.toString());
      assert.equal(
        currentTokenReceived.toString(),
        expectedReleaseAmount.toString()
      );
      // console.log(currentTokenReceived.toString());

      // write more some tests here
    });
  });

  describe("tokenTimelock Contract for public sale, airdrop", async function () {
    beforeEach(async function () {
      targetMonthReleaseAmount = web3.utils.toWei("15142800", "ether");
      const tokenTimeLockContractReceipt =
        await timelockFactoryContract.createTimelock(
          Gameloft.address,
          accounts[2],
          0,
          0,
          0,
          [
            (await time.latest()).add(time.duration.days(120)),
            (await time.latest()).add(time.duration.days(240)),
          ],
          [targetMonthReleaseAmount, targetMonthReleaseAmount]
        );
      tokenTimelockContractAddress =
        tokenTimeLockContractReceipt.logs[0].args["0"];
      tokenTimelockContract = await TokenTimelock.at(
        tokenTimelockContractAddress
      );
    });
    it("token Release for public sale and airdrop", async function () {
      // mint 189000000 locked tokens for tokenTimelockContract
      let mintAmount = web3.utils.toWei("30285600", "ether");
      await GameloftToken.mint(tokenTimelockContractAddress, mintAmount);

      await expectRevert(tokenTimelockContract.release(), "error");
      // go through 90 days = 3 months
      await time.increase(time.duration.days(90));
      await expectRevert(tokenTimelockContract.release(), "error");
      // 120 days later
      await time.increase(time.duration.days(30));
      await tokenTimelockContract.release();

      let currentTokenReceived = await GameloftToken.balanceOf(accounts[2]);
      assert.equal(
        currentTokenReceived.toString(),
        targetMonthReleaseAmount.toString()
      );
      // 130 days later
      await time.increase(time.duration.days(10));
      await expectRevert(tokenTimelockContract.release(), "error");
      // 240 days later
      await time.increase(time.duration.days(110));
      await tokenTimelockContract.release();
      let expectedReleaseAmount = new BN(targetMonthReleaseAmount, 10).mul(
        new BN("2", 10)
      );
      currentTokenReceived = await GameloftToken.balanceOf(accounts[2]);
      assert.equal(
        currentTokenReceived.toString(),
        expectedReleaseAmount.toString()
      );
      // after that
      await time.increase(time.duration.days(10));
      await expectRevert(tokenTimelockContract.release(), "out of tokens");
    });
  });

  describe("tokenTimelock Contract for marketing, development", async function () {
    beforeEach(async function () {
      let startDuration = time.duration.days(390);
      let currentTime = await time.latest();
      let startTime = currentTime.add(startDuration);
      let period = time.duration.days(30);
      periodReleaseAmount = web3.utils.toWei("11250000", "ether");
      targetMonthReleaseAmount = web3.utils.toWei("11250000", "ether");

      const tokenTimeLockContractReceipt =
        await timelockFactoryContract.createTimelock(
          Gameloft.address,
          accounts[3],
          startTime,
          period,
          periodReleaseAmount,
          [(await time.latest()).add(time.duration.days(60))],
          [targetMonthReleaseAmount]
        );
      tokenTimelockContractAddress =
        tokenTimeLockContractReceipt.logs[0].args["0"];
      tokenTimelockContract = await TokenTimelock.at(
        tokenTimelockContractAddress
      );
    });
    it("token Release for marketing, development", async function () {
      // mint 189000000 locked tokens for tokenTimelockContract
      let mintAmount = web3.utils.toWei("150000000", "ether");
      await GameloftToken.mint(tokenTimelockContractAddress, mintAmount);
      await expectRevert(
        tokenTimelockContract.release(),
        "TokenTimelock: current time is before release time -- Reason given: TokenTimelock: current time is before release time."
      );
      // console.log(tokenAddress);
      // 10 days after start
      await time.increase(time.duration.days(10));
      await expectRevert(tokenTimelockContract.release(), "error");
      // 60 days after start
      await time.increase(time.duration.days(50));
      await tokenTimelockContract.release();
      let currentReceivedToken = await GameloftToken.balanceOf(accounts[3]);
      assert.equal(
        currentReceivedToken.toString(),
        targetMonthReleaseAmount.toString()
      );
      // 110 days after start
      await time.increase(time.duration.days(50));
      await expectRevert(tokenTimelockContract.release(), "error");
      /// 390 days after start
      await time.increase(time.duration.days(280));
      await tokenTimelockContract.release();
      currentReceivedToken = await GameloftToken.balanceOf(accounts[3]);
      let expectedReleaseAmount = new BN(targetMonthReleaseAmount, 10).add(
        new BN(periodReleaseAmount, 10)
      );
      assert.equal(
        currentReceivedToken.toString(),
        expectedReleaseAmount.toString()
      );
      // 420 days after start
      await time.increase(time.duration.days(30));
      await tokenTimelockContract.release();
      currentReceivedToken = await GameloftToken.balanceOf(accounts[3]);
      expectedReleaseAmount = expectedReleaseAmount.add(
        new BN(periodReleaseAmount, 10)
      );
      assert.equal(
        currentReceivedToken.toString(),
        expectedReleaseAmount.toString()
      );
    });
  });

  it("should assert true", async function () {
    await Gameloft.deployed();
    return assert.isTrue(true);
  });
});
