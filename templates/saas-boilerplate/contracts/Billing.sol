// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Billing is 
    Initializable,
    UUPSUpgradeable, 
    OwnableUpgradeable
{
    // Billing record struct
    struct BillingRecord {
        uint256 amount;
        uint256 timestamp;
        string invoiceURI;
        bool refunded;
    }

    // State variables
    mapping(address => BillingRecord[]) public billingHistory;
    uint256 public totalRevenue;
    uint256 public refundWindow; // Time window for refunds in seconds

    // Events
    event PaymentProcessed(address indexed user, uint256 amount, string invoiceURI);
    event RefundIssued(address indexed user, uint256 amount);
    event RefundWindowUpdated(uint256 newWindow);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        refundWindow = 3 days;
    }

    // Process payment and generate invoice
    function processPayment(string calldata invoiceURI) external payable {
        require(msg.value > 0, "Payment amount must be greater than 0");

        billingHistory[msg.sender].push(BillingRecord({
            amount: msg.value,
            timestamp: block.timestamp,
            invoiceURI: invoiceURI,
            refunded: false
        }));

        totalRevenue += msg.value;
        emit PaymentProcessed(msg.sender, msg.value, invoiceURI);
    }

    // Issue refund for recent payment
    function issueRefund(uint256 recordIndex) external {
        require(billingHistory[msg.sender].length > recordIndex, "Invalid record index");
        BillingRecord storage record = billingHistory[msg.sender][recordIndex];
        
        require(!record.refunded, "Already refunded");
        require(
            block.timestamp <= record.timestamp + refundWindow,
            "Refund window expired"
        );

        record.refunded = true;
        totalRevenue -= record.amount;

        (bool sent, ) = payable(msg.sender).call{value: record.amount}("");
        require(sent, "Failed to send refund");

        emit RefundIssued(msg.sender, record.amount);
    }

    // Get billing history for a user
    function getBillingHistory(address user) external view returns (BillingRecord[] memory) {
        return billingHistory[user];
    }

    // Update refund window (admin only)
    function setRefundWindow(uint256 newWindow) external onlyOwner {
        refundWindow = newWindow;
        emit RefundWindowUpdated(newWindow);
    }

    // Withdraw contract balance (admin only)
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Failed to withdraw");
    }

    // Required by UUPS
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Allow contract to receive ETH
    receive() external payable {}
} 