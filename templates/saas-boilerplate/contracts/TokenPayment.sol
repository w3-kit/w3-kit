// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract TokenPayment is 
    Initializable, 
    UUPSUpgradeable,
    Ownable2StepUpgradeable,
    ReentrancyGuardUpgradeable
{
    // Payment token configuration
    struct TokenConfig {
        address tokenAddress;
        uint256 price;  // Price in token units
        bool isEnabled;
    }

    // NFT configuration for access
    struct NFTConfig {
        address nftAddress;
        bool isEnabled;
    }

    // State variables
    mapping(address => TokenConfig) public acceptedTokens;
    mapping(address => NFTConfig) public acceptedNFTs;
    mapping(address => bool) public hasAccess;

    // Events
    event TokenConfigured(address indexed token, uint256 price);
    event NFTConfigured(address indexed nft);
    event PaymentProcessed(address indexed user, address indexed token, uint256 amount);
    event NFTAccessGranted(address indexed user, address indexed nft, uint256 tokenId);
    event AccessRevoked(address indexed user);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }

    // Configure accepted ERC20 token
    function configureToken(address tokenAddress, uint256 price) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(price > 0, "Price must be greater than 0");

        acceptedTokens[tokenAddress] = TokenConfig({
            tokenAddress: tokenAddress,
            price: price,
            isEnabled: true
        });

        emit TokenConfigured(tokenAddress, price);
    }

    // Configure accepted NFT
    function configureNFT(address nftAddress) external onlyOwner {
        require(nftAddress != address(0), "Invalid NFT address");

        acceptedNFTs[nftAddress] = NFTConfig({
            nftAddress: nftAddress,
            isEnabled: true
        });

        emit NFTConfigured(nftAddress);
    }

    // Pay with ERC20 token
    function payWithToken(address tokenAddress) external nonReentrant {
        TokenConfig memory config = acceptedTokens[tokenAddress];
        require(config.isEnabled, "Token not accepted");

        IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
        require(
            token.transferFrom(msg.sender, address(this), config.price),
            "Transfer failed"
        );

        hasAccess[msg.sender] = true;
        emit PaymentProcessed(msg.sender, tokenAddress, config.price);
    }

    // Validate NFT ownership for access
    function validateNFTAccess(address nftAddress, uint256 tokenId) external {
        NFTConfig memory config = acceptedNFTs[nftAddress];
        require(config.isEnabled, "NFT not accepted");

        IERC721Upgradeable nft = IERC721Upgradeable(nftAddress);
        require(
            nft.ownerOf(tokenId) == msg.sender,
            "Must own the NFT"
        );

        hasAccess[msg.sender] = true;
        emit NFTAccessGranted(msg.sender, nftAddress, tokenId);
    }

    // Revoke access
    function revokeAccess(address user) external onlyOwner {
        hasAccess[user] = false;
        emit AccessRevoked(user);
    }

    // Withdraw tokens (admin only)
    function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20Upgradeable token = IERC20Upgradeable(tokenAddress);
        require(
            token.transfer(owner(), amount),
            "Transfer failed"
        );
    }

    // Check if user has access
    function checkAccess(address user) external view returns (bool) {
        return hasAccess[user];
    }

    // Required by UUPS
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 