// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract GaslessMetaTx is 
    Initializable,
    UUPSUpgradeable,
    Ownable2StepUpgradeable,
    EIP712Upgradeable,
    ReentrancyGuardUpgradeable
{
    using ECDSAUpgradeable for bytes32;

    // State variables
    mapping(address => bool) public authorizedRelayers;
    mapping(address => uint256) public nonces;
    uint256 public relayerReward; // Amount paid to relayers for their service

    // Events
    event RelayerUpdated(address indexed relayer, bool authorized);
    event MetaTxExecuted(
        address indexed from,
        address indexed to,
        bytes data,
        uint256 nonce
    );
    event RelayerRewardUpdated(uint256 newReward);

    // Custom errors
    error UnauthorizedRelayer();
    error InvalidSignature();
    error NonceAlreadyUsed();
    error InsufficientRelayerReward();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(uint256 initialRelayerReward) public initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __EIP712_init("GaslessMetaTx", "1");
        __ReentrancyGuard_init();
        
        relayerReward = initialRelayerReward;
    }

    // Struct for meta-transaction data
    struct MetaTx {
        address from;      // Original transaction sender
        address to;        // Target contract address
        bytes data;        // Encoded function call
        uint256 value;     // ETH value to send
        uint256 nonce;     // Nonce to prevent replay attacks
        uint256 deadline;  // Timestamp after which tx is invalid
    }

    // Update relayer authorization
    function setRelayer(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
        emit RelayerUpdated(relayer, authorized);
    }

    // Update relayer reward
    function setRelayerReward(uint256 newReward) external onlyOwner {
        relayerReward = newReward;
        emit RelayerRewardUpdated(newReward);
    }

    // Execute meta-transaction
    function executeMetaTx(
        MetaTx calldata metaTx,
        bytes calldata signature
    ) external nonReentrant {
        // Verify relayer
        if (!authorizedRelayers[msg.sender]) revert UnauthorizedRelayer();

        // Verify nonce
        if (nonces[metaTx.from] != metaTx.nonce) revert NonceAlreadyUsed();
        
        // Verify deadline
        if (block.timestamp > metaTx.deadline) revert InvalidSignature();

        // Verify signature
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("MetaTx(address from,address to,bytes data,uint256 value,uint256 nonce,uint256 deadline)"),
            metaTx.from,
            metaTx.to,
            keccak256(metaTx.data),
            metaTx.value,
            metaTx.nonce,
            metaTx.deadline
        )));

        address signer = digest.recover(signature);
        if (signer != metaTx.from) revert InvalidSignature();

        // Update nonce before execution
        nonces[metaTx.from]++;

        // Execute transaction
        (bool success, bytes memory returnData) = metaTx.to.call{value: metaTx.value}(metaTx.data);
        if (!success) {
            // If the call failed, bubble up the error message
            assembly {
                let ptr := mload(0x40)
                let size := returndatasize()
                returndatacopy(ptr, 0, size)
                revert(ptr, size)
            }
        }

        // Pay relayer
        if (relayerReward > 0) {
            (bool sent, ) = payable(msg.sender).call{value: relayerReward}("");
            if (!sent) revert InsufficientRelayerReward();
        }

        emit MetaTxExecuted(metaTx.from, metaTx.to, metaTx.data, metaTx.nonce);
    }

    // Get current nonce for an address
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    // Required by UUPS
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Allow contract to receive ETH
    receive() external payable {}
} 