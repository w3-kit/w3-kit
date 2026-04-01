import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Billing } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Billing", function () {
  let billing: Billing;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let paymentAmount = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const Billing = await ethers.getContractFactory("Billing");
    billing = await upgrades.deployProxy(Billing, [], {
      initializer: "initialize",
      kind: "uups",
    }) as unknown as Billing;
  });

  describe("Payment Processing", function () {
    it("Should process payment correctly", async function () {
      await billing.connect(user).processPayment("ipfs://invoice1", { value: paymentAmount });
      
      const history = await billing.getBillingHistory(user.address);
      expect(history[0].amount).to.equal(paymentAmount);
      expect(history[0].invoiceURI).to.equal("ipfs://invoice1");
      expect(history[0].refunded).to.be.false;
    });

    it("Should reject zero payments", async function () {
      await expect(
        billing.connect(user).processPayment("ipfs://invoice1", { value: 0 })
      ).to.be.revertedWith("Payment amount must be greater than 0");
    });
  });

  describe("Refunds", function () {
    beforeEach(async function () {
      await billing.connect(user).processPayment("ipfs://invoice1", { value: paymentAmount });
    });

    it("Should allow refunds within window", async function () {
      const balanceBefore = await ethers.provider.getBalance(user.address);
      await billing.connect(user).issueRefund(0);
      const balanceAfter = await ethers.provider.getBalance(user.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
      
      const history = await billing.getBillingHistory(user.address);
      expect(history[0].refunded).to.be.true;
    });

    it("Should prevent refunds after window", async function () {
      await time.increase(4 * 24 * 60 * 60); // 4 days
      
      await expect(
        billing.connect(user).issueRefund(0)
      ).to.be.revertedWith("Refund window expired");
    });

    it("Should prevent double refunds", async function () {
      await billing.connect(user).issueRefund(0);
      
      await expect(
        billing.connect(user).issueRefund(0)
      ).to.be.revertedWith("Already refunded");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to withdraw", async function () {
      await billing.connect(user).processPayment("ipfs://invoice1", { value: paymentAmount });
      
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await billing.withdraw();
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should allow owner to update refund window", async function () {
      const newWindow = 7 * 24 * 60 * 60; // 7 days
      await billing.setRefundWindow(newWindow);
      expect(await billing.refundWindow()).to.equal(newWindow);
    });
  });

  describe("Upgradability", function () {
    it("Should only allow owner to upgrade", async function () {
      const BillingV2 = await ethers.getContractFactory("Billing");
      await expect(
        upgrades.upgradeProxy(billing.target, BillingV2.connect(user))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 