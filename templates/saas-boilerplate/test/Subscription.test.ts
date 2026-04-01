import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Subscription } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Subscription", function () {
  let subscription: Subscription;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let planPrice = ethers.parseEther("0.1"); // 0.1 ETH
  let planDuration = 30 * 24 * 60 * 60; // 30 days in seconds

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const Subscription = await ethers.getContractFactory("Subscription");
    subscription = await upgrades.deployProxy(Subscription, [], {
      initializer: "initialize",
      kind: "uups",
    }) as unknown as Subscription;
    
    // Create a test plan
    await subscription.createPlan(planPrice, planDuration);
  });

  describe("Plan Management", function () {
    it("Should create a plan correctly", async function () {
      const plan = await subscription.plans(1);
      expect(plan.price).to.equal(planPrice);
      expect(plan.duration).to.equal(planDuration);
      expect(plan.active).to.be.true;
    });

    it("Should only allow owner to create plans", async function () {
      await expect(
        subscription.connect(user).createPlan(planPrice, planDuration)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Subscription Management", function () {
    it("Should allow user to subscribe", async function () {
      await subscription.connect(user).subscribe(1, { value: planPrice });
      
      const userSub = await subscription.subscriptions(user.address);
      expect(userSub.active).to.be.true;
      expect(userSub.planId).to.equal(1);
    });

    it("Should reject subscription with incorrect payment", async function () {
      await expect(
        subscription.connect(user).subscribe(1, { value: 0 })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should reject subscription to inactive plan", async function () {
      await expect(
        subscription.connect(user).subscribe(999)
      ).to.be.revertedWith("Plan does not exist or is not active");
    });

    it("Should prevent multiple active subscriptions", async function () {
      await subscription.connect(user).subscribe(1, { value: planPrice });
      
      await expect(
        subscription.connect(user).subscribe(1, { value: planPrice })
      ).to.be.revertedWith("Active subscription exists");
    });

    it("Should allow subscription cancellation", async function () {
      await subscription.connect(user).subscribe(1, { value: planPrice });
      await subscription.connect(user).cancelSubscription();
      
      const userSub = await subscription.subscriptions(user.address);
      expect(userSub.active).to.be.false;
    });

    it("Should correctly check subscription status", async function () {
      await subscription.connect(user).subscribe(1, { value: planPrice });
      
      expect(await subscription.hasActiveSubscription(user.address)).to.be.true;

      // Fast forward past subscription duration
      await time.increase(planDuration + 1);
      
      expect(await subscription.hasActiveSubscription(user.address)).to.be.false;
    });
  });

  describe("Upgradability", function () {
    it("Should only allow owner to upgrade", async function () {
      const SubscriptionV2 = await ethers.getContractFactory("Subscription");
      await expect(
        upgrades.upgradeProxy(subscription.target, SubscriptionV2.connect(user))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 