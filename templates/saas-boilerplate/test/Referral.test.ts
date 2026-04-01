import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Referral } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Referral", function () {
  let referral: Referral;
  let owner: SignerWithAddress;
  let referrer: SignerWithAddress;
  let referee: SignerWithAddress;
  let programId: string;
  let referrerReward = ethers.parseEther("0.1");
  let refereeDiscount = ethers.parseEther("0.05");

  beforeEach(async function () {
    [owner, referrer, referee] = await ethers.getSigners();
    
    const Referral = await ethers.getContractFactory("Referral");
    referral = await upgrades.deployProxy(Referral, [], {
      initializer: "initialize",
      kind: "uups",
    }) as unknown as Referral;

    programId = ethers.keccak256(ethers.toUtf8Bytes("TEST_PROGRAM"));
    
    // Setup reward config
    await referral.setRewardConfig(programId, referrerReward, refereeDiscount);
  });

  describe("Reward Configuration", function () {
    it("Should set reward config correctly", async function () {
      const config = await referral.rewardConfigs(programId);
      expect(config.referrerReward).to.equal(referrerReward);
      expect(config.refereeDiscount).to.equal(refereeDiscount);
      expect(config.active).to.be.true;
    });

    it("Should only allow owner to set config", async function () {
      await expect(
        referral.connect(referrer).setRewardConfig(programId, referrerReward, refereeDiscount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Referral Recording", function () {
    it("Should record referral correctly", async function () {
      await referral.connect(referee).recordReferral(referrer.address, programId);
      
      const record = await referral.referrals(referee.address);
      expect(record.referrer).to.equal(referrer.address);
      expect(record.rewardClaimed).to.be.false;
    });

    it("Should prevent self-referral", async function () {
      await expect(
        referral.connect(referee).recordReferral(referee.address, programId)
      ).to.be.revertedWith("Cannot refer self");
    });

    it("Should prevent duplicate referrals", async function () {
      await referral.connect(referee).recordReferral(referrer.address, programId);
      
      await expect(
        referral.connect(referee).recordReferral(referrer.address, programId)
      ).to.be.revertedWith("Already referred");
    });
  });

  describe("Reward Claims", function () {
    beforeEach(async function () {
      await referral.connect(referee).recordReferral(referrer.address, programId);
      await owner.sendTransaction({
        to: referral.target,
        value: referrerReward
      });
    });

    it("Should allow referrer to claim reward", async function () {
      const balanceBefore = await ethers.provider.getBalance(referrer.address);
      await referral.connect(referrer).claimReward(referee.address, programId);
      const balanceAfter = await ethers.provider.getBalance(referrer.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should prevent double claims", async function () {
      await referral.connect(referrer).claimReward(referee.address, programId);
      
      await expect(
        referral.connect(referrer).claimReward(referee.address, programId)
      ).to.be.revertedWith("Reward already claimed");
    });
  });

  describe("Referral Stats", function () {
    it("Should track referral counts correctly", async function () {
      await referral.connect(referee).recordReferral(referrer.address, programId);
      
      const [totalCount, unclaimedCount] = await referral.getReferralStats(referrer.address);
      expect(totalCount).to.equal(1);
    });
  });

  describe("Upgradability", function () {
    it("Should only allow owner to upgrade", async function () {
      const ReferralV2 = await ethers.getContractFactory("Referral");
      await expect(
        upgrades.upgradeProxy(referral.target, ReferralV2.connect(referrer))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 