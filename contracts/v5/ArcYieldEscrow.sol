// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../v2/FeeCollector.sol";
import "./IUSYC.sol";

/// @title ArcYieldEscrow
/// @notice Yield-bearing escrow that converts USDC to USYC for yield accrual
/// @dev Created by ArcYieldEscrowFactory. No dispute support (MVP).
///      Fee: 1% on principal only. Yield goes 100% to creator on release.
contract ArcYieldEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // States: CREATED=awaiting deposit, FUNDED=USDC deposited+converted to USYC,
    //         RELEASED=creator received funds, REFUNDED=payer received refund
    enum EscrowState { CREATED, FUNDED, RELEASED, REFUNDED }

    // Immutable state (set by factory)
    address public immutable creator;
    IERC20 public immutable usdc;
    IUSYC public immutable usyc;
    FeeCollector public immutable feeCollector;
    uint256 public immutable autoReleaseDays;

    // Mutable state
    address public payer;
    uint256 public originalUsdcAmount;   // Invoice amount deposited (excl. payer fee)
    uint256 public depositedUsycShares;  // USYC shares received from deposit
    uint256 public fundedAt;             // Timestamp of deposit
    EscrowState public state;

    // Events
    event Deposited(address indexed payer, uint256 usdcAmount, uint256 usycShares);
    event Released(address indexed creator, uint256 totalRedeemed, uint256 fee, uint256 yieldEarned);
    event Refunded(address indexed payer, uint256 totalRedeemed, uint256 yieldEarned);

    // Modifiers
    modifier onlyPayer() {
        require(msg.sender == payer, "Only payer");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator");
        _;
    }

    modifier inState(EscrowState _state) {
        require(state == _state, "Invalid state");
        _;
    }

    constructor(
        address _creator,
        address _usdc,
        address _usyc,
        address _feeCollector,
        uint256 _autoReleaseDays
    ) {
        require(_creator != address(0), "Invalid creator");
        require(_usdc != address(0), "Invalid USDC");
        require(_usyc != address(0), "Invalid USYC");
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_autoReleaseDays > 0 && _autoReleaseDays <= 90, "Invalid auto-release days");

        creator = _creator;
        usdc = IERC20(_usdc);
        usyc = IUSYC(_usyc);
        feeCollector = FeeCollector(_feeCollector);
        autoReleaseDays = _autoReleaseDays;
        state = EscrowState.CREATED;
    }

    /// @notice Payer deposits USDC. Fee collected upfront, remainder converts to USYC.
    /// @param invoiceAmount The base invoice amount (payer sends invoiceAmount + halfFee)
    function deposit(uint256 invoiceAmount) external nonReentrant inState(EscrowState.CREATED) {
        require(invoiceAmount > 0, "Zero amount");

        // Calculate payer total (invoice + 0.5% payer fee)
        uint256 payerTotal = feeCollector.calculatePayerAmount(invoiceAmount);

        // Transfer total USDC from payer
        usdc.safeTransferFrom(msg.sender, address(this), payerTotal);

        // Collect fee upfront: send full 1% fee to FeeCollector
        uint256 fee = feeCollector.calculateFee(invoiceAmount);
        if (fee > 0) {
            usdc.safeTransfer(address(feeCollector), fee);
            feeCollector.recordFee(fee);
        }

        // Remaining USDC goes into USYC (invoiceAmount - creatorHalfFee)
        // payerTotal - fee = invoiceAmount + halfFee - fee = invoiceAmount - halfFee
        uint256 usycDeposit = payerTotal - fee;

        // Approve USYC contract and deposit
        usdc.forceApprove(address(usyc), usycDeposit);
        uint256 shares = usyc.deposit(usycDeposit, address(this));
        require(shares > 0, "Zero shares received");

        // Update state
        payer = msg.sender;
        originalUsdcAmount = usycDeposit;
        depositedUsycShares = shares;
        fundedAt = block.timestamp;
        state = EscrowState.FUNDED;

        emit Deposited(msg.sender, invoiceAmount, shares);
    }

    /// @notice Release funds to creator. Redeems USYC→USDC. Creator gets principal + yield.
    /// @dev Only payer can release, or anyone after autoRelease period.
    function release() external nonReentrant inState(EscrowState.FUNDED) {
        require(
            msg.sender == payer ||
            block.timestamp >= fundedAt + (autoReleaseDays * 1 days),
            "Not authorized"
        );

        // Redeem all USYC shares for USDC
        uint256 redeemed = usyc.redeem(depositedUsycShares, address(this), address(this));

        // All redeemed USDC goes to creator (fee already collected at deposit)
        usdc.safeTransfer(creator, redeemed);

        uint256 yieldEarned = redeemed > originalUsdcAmount ? redeemed - originalUsdcAmount : 0;
        state = EscrowState.RELEASED;

        emit Released(creator, redeemed, 0, yieldEarned);
    }

    /// @notice Refund to payer. Redeems USYC→USDC. Payer gets principal + yield.
    /// @dev Only creator can refund.
    function refund() external onlyCreator nonReentrant inState(EscrowState.FUNDED) {
        // Redeem all USYC shares for USDC
        uint256 redeemed = usyc.redeem(depositedUsycShares, address(this), address(this));

        // All redeemed USDC goes to payer (they get the yield on refund)
        usdc.safeTransfer(payer, redeemed);

        uint256 yieldEarned = redeemed > originalUsdcAmount ? redeemed - originalUsdcAmount : 0;
        state = EscrowState.REFUNDED;

        emit Refunded(payer, redeemed, yieldEarned);
    }

    // --- View Functions ---

    /// @notice Current USDC value of deposited USYC shares (includes yield)
    function getCurrentValue() external view returns (uint256) {
        if (state != EscrowState.FUNDED) return 0;
        return usyc.convertToAssets(depositedUsycShares);
    }

    /// @notice Accrued yield (currentValue - originalDeposit)
    function getAccruedYield() external view returns (uint256) {
        if (state != EscrowState.FUNDED) return 0;
        uint256 currentValue = usyc.convertToAssets(depositedUsycShares);
        return currentValue > originalUsdcAmount ? currentValue - originalUsdcAmount : 0;
    }

    /// @notice Check if auto-release is available
    function canAutoRelease() external view returns (bool) {
        return state == EscrowState.FUNDED &&
               block.timestamp >= fundedAt + (autoReleaseDays * 1 days);
    }

    /// @notice Get escrow details
    function getDetails() external view returns (
        address _creator,
        address _payer,
        uint256 _originalUsdcAmount,
        uint256 _depositedUsycShares,
        EscrowState _state,
        uint256 _fundedAt,
        uint256 _autoReleaseDays
    ) {
        return (creator, payer, originalUsdcAmount, depositedUsycShares, state, fundedAt, autoReleaseDays);
    }
}
