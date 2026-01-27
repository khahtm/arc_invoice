// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IUSYC
/// @notice Interface for USYC yield-bearing token (Hashnote US Yield Coin)
/// @dev Teller-style interface for deposit/redeem operations (ERC-4626-like)
interface IUSYC is IERC20 {
    /// @notice Deposit USDC and receive USYC shares
    /// @param assets Amount of USDC to deposit
    /// @param receiver Address to receive minted shares
    /// @return shares Amount of USYC shares minted
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);

    /// @notice Redeem USYC shares for USDC
    /// @param shares Amount of USYC shares to redeem
    /// @param receiver Address to receive USDC
    /// @param owner Address that owns the shares
    /// @return assets Amount of USDC received
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);

    /// @notice Convert USYC shares to USDC amount (includes accrued yield)
    /// @param shares Amount of shares to convert
    /// @return assets Equivalent USDC amount
    function convertToAssets(uint256 shares) external view returns (uint256 assets);

    /// @notice Convert USDC amount to USYC shares
    /// @param assets Amount of USDC to convert
    /// @return shares Equivalent USYC shares
    function convertToShares(uint256 assets) external view returns (uint256 shares);
}
