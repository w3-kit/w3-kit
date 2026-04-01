// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Subscription is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable 
{
    // Subscription Plan struct
    struct Plan {
        uint256 price;
        uint256 duration; // in seconds
        bool active;
    }

    // Subscription struct
    struct UserSubscription {
        uint256 planId;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }

    // State variables
    mapping(uint256 => Plan) public plans;
    mapping(address => UserSubscription) public subscriptions;
    uint256 public nextPlanId;

    // Events
    event PlanCreated(uint256 indexed planId, uint256 price, uint256 duration);
    event SubscriptionPurchased(address indexed user, uint256 indexed planId, uint256 startTime, uint256 endTime);
    event SubscriptionCancelled(address indexed user, uint256 indexed planId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        nextPlanId = 1;
    }

    // Create a new subscription plan (admin only)
    function createPlan(uint256 price, uint256 duration) external onlyOwner {
        require(duration > 0, "Duration must be greater than 0");
        require(price > 0, "Price must be greater than 0");

        plans[nextPlanId] = Plan({
            price: price,
            duration: duration,
            active: true
        });

        emit PlanCreated(nextPlanId, price, duration);
        nextPlanId++;
    }

    // Purchase a subscription
    function subscribe(uint256 planId) external payable {
        require(plans[planId].active, "Plan does not exist or is not active");
        require(msg.value == plans[planId].price, "Incorrect payment amount");
        require(!subscriptions[msg.sender].active, "Active subscription exists");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + plans[planId].duration;

        subscriptions[msg.sender] = UserSubscription({
            planId: planId,
            startTime: startTime,
            endTime: endTime,
            active: true
        });

        emit SubscriptionPurchased(msg.sender, planId, startTime, endTime);
    }

    // Cancel subscription
    function cancelSubscription() external {
        require(subscriptions[msg.sender].active, "No active subscription");
        
        subscriptions[msg.sender].active = false;
        emit SubscriptionCancelled(msg.sender, subscriptions[msg.sender].planId);
    }

    // Check if user has active subscription
    function hasActiveSubscription(address user) external view returns (bool) {
        return subscriptions[user].active && 
               subscriptions[user].endTime > block.timestamp;
    }

    // Required by UUPS
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 