pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./TokenTimelock.sol";

contract Gameloft is ERC20, Ownable {
    using SafeMath for uint256;

    uint256 private _maxTotalSupply;
    address public PRIVATE_SALE = 0x11C6b725cC4A20462337d8d77431ACCb973DdCf8;
    address public PUBLIC_SALE = 0x7ab737bFaE5702594AF5e5CE98714a12aB946785;
    address public DEPOSIT = 0x6b9B136cCBc35586ab5ad7F6480C517B36034C49;
    address public MARKETING = 0x3887534C1b6E5907c8b166FC2D36f37400327883;
    address public PARTNER = 0x2e09e5Ed57D6b11b4f8b24d7cD94482C87626993;
    address public TEAM = 0x18f41A12Efd1a36367ab155518c5C704D62FE197;
    address public DEVELOPMENT = 0xA2c70A1ea1B0CcE5dE984625024D81E7550E03C9;
    address public RESERVE = 0xD0Dac32a432E75D659f715162531ABeC3fcb4569;
    address public AIRDROP = 0xd1152E640b8F86e035F1A4833EBF64Dbf3165A54;

    address public privateERC20lockAddress;
    address public publicERC20lockAddress;
    address public marketingERC20lockAddress;
    address public partnerERC20lockAddress;
    address public teamERC20lockAddress;
    address public developmentERC20lockAddress;
    address public reverseERC20lockAddress;
    address public airdropERC20lockAddress;

    // for public sale
    uint256[] private _publicSaleTargetTime = [
        block.timestamp + 120 days,
        block.timestamp + 240 days
    ];
    uint256[] private _publicSaleTargetAmount = [
        15142800 ether,
        15142800 ether
    ];

    // for marketing
    uint256[] private _marketingTargetTime = [block.timestamp + 60 days];
    uint256[] private _markettingTargetAmount = [15000000 ether];

    // for development
    uint256[] private _developmentTargetTime = [block.timestamp + 180 days];
    uint256[] private _developmentTargetAmount = [15000000 ether];

    // airdrop
    uint256[] private _airdropTargetTime = [
        block.timestamp + 60 days,
        block.timestamp + 180 days
    ];
    uint256[] private _airdropTargetAmount = [5000000 ether, 5000000 ether];

    constructor() ERC20("Gameloft token", "GL") {
        _maxTotalSupply = 1000000000 ether;
        TimelockFactory timelockFactory = new TimelockFactory();
        // token release at TGE time 10%
        // startTime:4 months
        // periods = 1months
        // periods release amount = 5 * 189000000 / 100
        // targetTimes =[]
        // targetAmount = []

        mint(PRIVATE_SALE, 21000000 ether);
        privateERC20lockAddress = timelockFactory.createTimelock(
            this,
            PRIVATE_SALE,
            block.timestamp + 120 days,
            30 days,
            9450000 ether,
            new uint256[](0),
            new uint256[](0)
        );
        mint(privateERC20lockAddress, 189000000 ether);

        // Public sale
        // token release at TGE time 20%
        // total: 37857000
        // 40% tokens each release time = 15142800
        mint(PUBLIC_SALE, 7571400 ether);
        publicERC20lockAddress = timelockFactory.createTimelock(
            this,
            PUBLIC_SALE,
            block.timestamp,
            0 days,
            0,
            _publicSaleTargetTime,
            _publicSaleTargetAmount
        );
        mint(publicERC20lockAddress, 30285600 ether);
        // mint for deposit
        // msg.sender use for burn in test tokentimelock. 
        mint(DEPOSIT, 150000000 ether);

        // martketing
        // starTime 13 months
        // period: 1 month
        // period release amount =  1000000000 * 15% * 7.5% = 11250000
        // targetTimes = [2]
        // targetAmount = [15000000]

        marketingERC20lockAddress = timelockFactory.createTimelock(
            this,
            MARKETING,
            block.timestamp + 390 days,
            30 days,
            11250000 ether,
            _marketingTargetTime,
            _markettingTargetAmount
        );
        mint(marketingERC20lockAddress, 150000000 ether);
        // partner
        // start time 13 months
        // period: 1 month
        // period release amount = 1000000000 * 3% * 8.33 % = 2499000
        partnerERC20lockAddress = timelockFactory.createTimelock(
            this,
            PARTNER,
            block.timestamp + 390 days,
            30 days,
            2499000 ether,
            new uint256[](0),
            new uint256[](0)
        );
        mint(partnerERC20lockAddress, 30000000 ether);
        // Team
        // startTime: 13 months
        // period: 1 month
        // period release amount = 1000000000 * 12% * 5.55% = 6660000
        teamERC20lockAddress = timelockFactory.createTimelock(
            this,
            TEAM,
            block.timestamp + 390 days,
            30 days,
            6660000 ether,
            new uint256[](0),
            new uint256[](0)
        );
        mint(teamERC20lockAddress, 120000000 ether);
        // Development
        // startTime: 13 months
        // period: 3 months
        // period release amount = 1000000000 * 15% * 10* = 15000000
        // targetTimes = [6]
        // targetAmount = [15000000]
        developmentERC20lockAddress = timelockFactory.createTimelock(
            this,
            DEVELOPMENT,
            block.timestamp + 390 days,
            120 days,
            15000000 ether,
            _developmentTargetTime,
            _developmentTargetAmount
        );
        mint(developmentERC20lockAddress, 150000000 ether);
        // Reverse
        // startTime: 6 months
        // period: 3 months
        // period release amount = 1000000000 * 14.2143% * 25% = 35535750
        reverseERC20lockAddress = timelockFactory.createTimelock(
            this,
            RESERVE,
            block.timestamp + 180 days,
            120 days,
            35535750 ether,
            new uint256[](0),
            new uint256[](0)
        );
        mint(reverseERC20lockAddress, 142143000 ether);
        // Airdrop
        // startTime: 0 months
        // period: 0 months
        // period release amount = 0
        // targetTimes = [2,6]
        // targetAmount = [5000000, 5000000]
        airdropERC20lockAddress = timelockFactory.createTimelock(
            this,
            AIRDROP,
            0,
            0,
            0,
            _airdropTargetTime,
            _airdropTargetAmount
        );
        mint(airdropERC20lockAddress, 10000000 ether);
    }

    function mint(address account, uint256 amount)
        public
        onlyOwner
        returns (bool)
    {
        // comment require for test tokenTimelock -> should be uncomment when deploy contract
        // require(
        //     totalSupply().add(amount) <= _maxTotalSupply,
        //     "Mint more than max total supply"
        // );
        _mint(account, amount);
        return true;
    }

    function burn(uint256 amount) public returns (bool) {
        _burn(msg.sender, amount);
        return true;
    }
}
