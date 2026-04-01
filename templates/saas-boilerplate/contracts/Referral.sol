// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

contract Referral is 
    Initializable, 
    UUPSUpgradeable,
    Ownable2StepUpgradeable
{
    // Referral reward configuration
    struct RewardConfig {
        uint256 referrerReward;    // Amount for referrer
        uint256 refereeDiscount;   // Discount for referee
        bool active;
    }

    // Referral record
    struct ReferralRecord {
        address referrer;
        uint256 timestamp;
        bool rewardClaimed;
    }

    // State variables
    mapping(bytes32 => RewardConfig) public rewardConfigs;
    mapping(address => ReferralRecord) public referrals;
    mapping(address => uint256) public referralCount;
    uint256 public totalReferrals;

    // Events
    event RewardConfigSet(bytes32 indexed programId, uint256 referrerReward, uint256 refereeDiscount);
    event ReferralRecorded(address indexed referrer, address indexed referee, bytes32 indexed programId);
    event RewardClaimed(address indexed referrer, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable2Step_init();
        __UUPSUpgradeable_init();
    }

    // Set reward configuration for a program
    function setRewardConfig(
        bytes32 programId,
        uint256 referrerReward,
        uint256 refereeDiscount
    ) external onlyOwner {
        rewardConfigs[programId] = RewardConfig({
            referrerReward: referrerReward,
            refereeDiscount: refereeDiscount,
            active: true
        });

        emit RewardConfigSet(programId, referrerReward, refereeDiscount);
    }

    // Record a referral
    function recordReferral(
        address referrer,
        bytes32 programId
    ) external {
        require(rewardConfigs[programId].active, "Program not active");
        require(referrer != msg.sender, "Cannot refer self");
        require(referrals[msg.sender].referrer == address(0), "Already referred");

        referrals[msg.sender] = ReferralRecord({
            referrer: referrer,
            timestamp: block.timestamp,
            rewardClaimed: false
        });

        referralCount[referrer]++;
        totalReferrals++;

        emit ReferralRecorded(referrer, msg.sender, programId);
    }

    // Get referral discount for a user
    function getReferralDiscount(
        address user,
        bytes32 programId
    ) external view returns (uint256) {
        if (referrals[user].referrer != address(0)) {
            return rewardConfigs[programId].refereeDiscount;
        }
        return 0;
    }

    // Claim referral reward
    function claimReward(
        address referee,
        bytes32 programId
    ) external {
        ReferralRecord storage record = referrals[referee];
        require(record.referrer == msg.sender, "Not the referrer");
        require(!record.rewardClaimed, "Reward already claimed");
        
        uint256 reward = rewardConfigs[programId].referrerReward;
        require(reward > 0, "No reward available");

        record.rewardClaimed = true;
        
        (bool sent, ) = payable(msg.sender).call{value: reward}("");
        require(sent, "Failed to send reward");

        emit RewardClaimed(msg.sender, reward);
    }

    // Get referral stats
    function getReferralStats(
        address referrer
    ) external view returns (
        uint256 totalCount,
        uint256 unclaimedCount
    ) {
        totalCount = referralCount[referrer];
        // Count unclaimed referrals
        unclaimedCount = 0;
        // Implementation left to frontend due to gas costs
    }

    // Required by UUPS
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Allow contract to receive ETH
    receive() external payable {}
} 