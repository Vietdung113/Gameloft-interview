pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TokenTimelock {
    using SafeMath for uint256;
    IERC20 private _token;
    address private _beneficiary;
    uint256 private _nextReleaseTime;
    uint256 private _period;
    uint256 private _periodReleaseAmount;
    uint256 private _remainingBalance;
    uint256[] private _targetTimes;
    uint256[] private _targetAmounts;

    // count if release at certain time
    uint256 private _count;

    event Released(address indexed beneficiary, uint256 amount);

    constructor() {
        _token = IERC20(address(1));
    }

    function init(
        IERC20 token_,
        address beneficiary_,
        uint256 startTime_,
        uint256 period_,
        uint256 periodReleaseAmount_,
        uint256[] memory targetTimes_,
        uint256[] memory targetAmounts_
    ) external {
        // marketing tge: 0%,
        require(
            token_ != IERC20(address(0)),
            "TokenTimelock: erc20 token address is zeor"
        );
        _token = token_;
        _beneficiary = beneficiary_;
        _nextReleaseTime = startTime_;
        _period = period_;
        _periodReleaseAmount = periodReleaseAmount_;
        _targetTimes = targetTimes_;
        _targetAmounts = targetAmounts_;
        // release periodAmount% each time
        _count = 0;
    }

    function token() public view virtual returns (IERC20) {
        return _token;
    }

    function beneficiary() public view virtual returns (address) {
        return _beneficiary;
    }

    function balance() public view virtual returns (uint256) {
        return token().balanceOf(address(this));
    }

    function targetTimes() public view virtual returns (uint256[] memory) {
        return _targetTimes;
    }

    function nextReleaseTime() public view virtual returns (uint256) {
        return _nextReleaseTime;
    }

    function getReleaseAmount(uint256 amount)
        public
        view
        virtual
        returns (uint256)
    {
        uint256 remainingBalance = balance();
        if (remainingBalance < amount) return remainingBalance;
        return amount;
    }

    function release() public virtual returns (bool) {
        if (targetTimes().length == _count) {
            require(
                block.timestamp >= nextReleaseTime(),
                "TokenTimelock: current time is before release time"
            );
            uint256 releaseAmount = getReleaseAmount(_periodReleaseAmount);
            require(releaseAmount > 0, "TokenTimelock: out of tokens");
            emit Released(beneficiary(), releaseAmount);
            require(
                token().transfer(beneficiary(), releaseAmount),
                "TokenTimelock: Transfer error"
            );

            if (_period != 0) {
                uint256 passedPeriods = (block.timestamp - _nextReleaseTime) /
                    _period;
                _nextReleaseTime += (passedPeriods + 1) * _period;
            }
        } else {
            require(
                _count < targetTimes().length,
                "TokenTimelock: Releasing have finished"
            );
            uint256 targetMonthRelease = _targetTimes[_count];
            // return targetMonthRelease;
            uint256 targetMonthReleaseAmount = _targetAmounts[_count];
            require(
                block.timestamp >= targetMonthRelease,
                "TokenTimelock: current time is before release time"
            );
            uint256 releaseAmount = getReleaseAmount(targetMonthReleaseAmount);
            require(releaseAmount > 0, "TokenTimelock: out of tokens");
            emit Released(beneficiary(), releaseAmount);
            require(
                token().transfer(beneficiary(), releaseAmount),
                "TokenTimelock: Transfer error"
            );
            _count += 1;
        }
        return true;
    }
}

contract CloneFactory {
    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(
                clone,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )
            mstore(add(clone, 0x14), targetBytes)
            mstore(
                add(clone, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )
            result := create(0, clone, 0x37)
        }
    }
}

contract TimelockFactory is CloneFactory {
    address private _tokenTimelockImpl;
    event Timelock(address timelockContract);

    constructor() {
        _tokenTimelockImpl = address(new TokenTimelock());
    }

    function createTimelock(
        IERC20 token,
        address to,
        uint256 startTime,
        uint256 period,
        uint256 periodReleaseAmount,
        uint256[] memory targetTimes,
        uint256[] memory targetAmounts
    ) public returns (address) {
        address clone = createClone(_tokenTimelockImpl);
        TokenTimelock(clone).init(
            token,
            to,
            startTime,
            period,
            periodReleaseAmount,
            targetTimes,
            targetAmounts
        );

        emit Timelock(clone);
        return clone;
    }
}
