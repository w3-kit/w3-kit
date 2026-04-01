// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

contract SaaSAccessControl is 
    Initializable, 
    UUPSUpgradeable,
    Ownable2StepUpgradeable 
{
    // Role definitions
    mapping(address => bool) public subscribers;
    mapping(address => bool) public users;

    // Events
    event SubscriberAdded(address indexed account);
    event SubscriberRemoved(address indexed account);
    event UserAdded(address indexed account);
    event UserRemoved(address indexed account);
    event UserSubscriptionUpdated(address indexed user, bool active);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
    }

    // Role management functions
    function addSubscriber(address account) external onlyOwner {
        subscribers[account] = true;
        emit SubscriberAdded(account);
    }

    function removeSubscriber(address account) external onlyOwner {
        subscribers[account] = false;
        emit SubscriberRemoved(account);
    }

    function addUser(address account) external {
        require(
            msg.sender == owner() || subscribers[msg.sender],
            "Caller must be admin or subscriber"
        );
        users[account] = true;
        emit UserAdded(account);
    }

    function removeUser(address account) external {
        require(
            msg.sender == owner() || subscribers[msg.sender],
            "Caller must be admin or subscriber"
        );
        users[account] = false;
        emit UserRemoved(account);
    }

    // Access check functions
    function isAdmin(address account) public view returns (bool) {
        return account == owner();
    }

    function isSubscriber(address account) public view returns (bool) {
        return subscribers[account];
    }

    function isUser(address account) public view returns (bool) {
        return users[account];
    }

    // Batch role management
    function batchAddUsers(address[] calldata accounts) external {
        require(subscribers[msg.sender], "Caller must be subscriber");
        for (uint i = 0; i < accounts.length; i++) {
            users[accounts[i]] = true;
            emit UserAdded(accounts[i]);
        }
    }

    // Required by UUPS
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 