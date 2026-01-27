// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ArcYieldEscrow.sol";

/// @title ArcYieldEscrowFactory
/// @notice Factory contract for creating yield escrow instances (V5)
/// @dev Deploys new ArcYieldEscrow for each invoice. Follows V3 factory pattern.
contract ArcYieldEscrowFactory {
    address public immutable usdc;
    address public immutable usyc;
    address public immutable feeCollector;

    // Tracking
    mapping(bytes32 => address) public invoiceToEscrow;
    address[] public allEscrows;

    // Events
    event EscrowCreated(
        bytes32 indexed invoiceId,
        address indexed escrow,
        address indexed creator,
        uint256 amount,
        uint256 autoReleaseDays
    );

    constructor(address _usdc, address _usyc, address _feeCollector) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_usyc != address(0), "Invalid USYC address");
        require(_feeCollector != address(0), "Invalid fee collector address");
        usdc = _usdc;
        usyc = _usyc;
        feeCollector = _feeCollector;
    }

    /// @notice Create a new yield escrow for an invoice
    /// @param invoiceId Unique identifier for the invoice (bytes32 hash)
    /// @param amount The invoice amount in USDC (for event tracking only)
    /// @param autoReleaseDays Days after funding before auto-release is allowed
    /// @return escrowAddress The address of the newly created escrow
    function createEscrow(
        bytes32 invoiceId,
        uint256 amount,
        uint256 autoReleaseDays
    ) external returns (address escrowAddress) {
        require(invoiceToEscrow[invoiceId] == address(0), "Escrow already exists for invoice");

        ArcYieldEscrow escrow = new ArcYieldEscrow(
            msg.sender, // creator
            usdc,
            usyc,
            feeCollector,
            autoReleaseDays
        );

        escrowAddress = address(escrow);
        invoiceToEscrow[invoiceId] = escrowAddress;
        allEscrows.push(escrowAddress);

        emit EscrowCreated(invoiceId, escrowAddress, msg.sender, amount, autoReleaseDays);

        return escrowAddress;
    }

    /// @notice Get the escrow address for an invoice
    /// @param invoiceId The invoice identifier
    /// @return The escrow contract address (or zero if not exists)
    function getEscrow(bytes32 invoiceId) external view returns (address) {
        return invoiceToEscrow[invoiceId];
    }

    /// @notice Get the total number of escrows created
    /// @return The count of all escrow contracts
    function getEscrowCount() external view returns (uint256) {
        return allEscrows.length;
    }

    /// @notice Get escrow address by index
    /// @param index The index in allEscrows array
    /// @return The escrow address at that index
    function getEscrowByIndex(uint256 index) external view returns (address) {
        require(index < allEscrows.length, "Index out of bounds");
        return allEscrows[index];
    }
}
