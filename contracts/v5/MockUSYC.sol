// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IUSYC.sol";

/// @title MockUSYC
/// @notice Mock USYC token for testnet. Simulates yield via time-based share price appreciation.
/// @dev NOT for production. Uses ERC-4626-like deposit/redeem with configurable APY.
contract MockUSYC is ERC20, Ownable, ReentrancyGuard, IUSYC {
    IERC20 public immutable usdc;

    /// @notice Yield rate in basis points (500 = 5% APY)
    uint256 public yieldRateAPY;

    /// @notice Total USDC assets held (grows with yield accrual)
    uint256 public totalAssets;

    /// @notice Last time yield was accrued
    uint256 public lastYieldUpdate;

    // Events
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event YieldAccrued(uint256 newTotalAssets, uint256 yieldAmount);
    event YieldRateUpdated(uint256 newRate);

    /// @param _usdc Address of USDC token
    /// @param _yieldRateAPY Initial APY in basis points (500 = 5%)
    constructor(
        address _usdc,
        uint256 _yieldRateAPY
    ) ERC20("Mock USYC", "mUSYC") Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC");
        require(_yieldRateAPY <= 5000, "APY too high"); // Max 50%
        usdc = IERC20(_usdc);
        yieldRateAPY = _yieldRateAPY;
        lastYieldUpdate = block.timestamp;

        // Seed vault with virtual shares to prevent inflation attack
        // Mint 1000 shares to dead address, set totalAssets to 1000e6
        _mint(address(0xdead), 1000e6);
        totalAssets = 1000e6;
    }

    /// @notice Accrue yield based on time elapsed since last update
    /// @dev Anyone can call. Yield = totalAssets * APY * timeDelta / (365 days * 10000)
    function accrueYield() public {
        uint256 timeDelta = block.timestamp - lastYieldUpdate;
        if (timeDelta == 0) return;

        uint256 yieldAmount = (totalAssets * yieldRateAPY * timeDelta) / (365 days * 10000);
        if (yieldAmount > 0) {
            totalAssets += yieldAmount;
            emit YieldAccrued(totalAssets, yieldAmount);
        }
        lastYieldUpdate = block.timestamp;
    }

    /// @notice Owner can update APY rate
    /// @param _newRate New APY in basis points
    function setYieldRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 5000, "APY too high");
        accrueYield(); // Accrue with old rate first
        yieldRateAPY = _newRate;
        emit YieldRateUpdated(_newRate);
    }

    /// @inheritdoc IUSYC
    function deposit(uint256 assets, address receiver) external override nonReentrant returns (uint256 shares) {
        require(assets > 0, "Zero deposit");
        require(receiver != address(0), "Invalid receiver");

        accrueYield();

        shares = convertToShares(assets);
        require(shares > 0, "Zero shares");

        require(usdc.transferFrom(msg.sender, address(this), assets), "Transfer failed");

        totalAssets += assets;
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);

        return shares;
    }

    /// @inheritdoc IUSYC
    function redeem(uint256 shares, address receiver, address owner) external override nonReentrant returns (uint256 assets) {
        require(shares > 0, "Zero shares");
        require(receiver != address(0), "Invalid receiver");

        // Only owner or approved can redeem
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            require(allowed >= shares, "Insufficient allowance");
            _approve(owner, msg.sender, allowed - shares);
        }

        accrueYield();

        assets = convertToAssets(shares);
        require(assets > 0, "Zero assets");
        require(assets <= totalAssets, "Insufficient assets");

        totalAssets -= assets;
        _burn(owner, shares);

        require(usdc.transfer(receiver, assets), "Transfer failed");

        emit Withdraw(msg.sender, receiver, owner, assets, shares);

        return assets;
    }

    /// @inheritdoc IUSYC
    function convertToAssets(uint256 shares) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return shares;
        return (shares * totalAssets) / supply;
    }

    /// @inheritdoc IUSYC
    function convertToShares(uint256 assets) public view override returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return assets;
        return (assets * supply) / totalAssets;
    }

    /// @notice Override decimals to match USDC (6 decimals)
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
