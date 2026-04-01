import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SaaSAccessControl } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SaaSAccessControl", function () {
  let accessControl: SaaSAccessControl;
  let admin: SignerWithAddress;
  let subscriber: SignerWithAddress;
  let user: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  beforeEach(async function () {
    [admin, subscriber, user, otherAccount] = await ethers.getSigners();
    
    const AccessControl = await ethers.getContractFactory("SaaSAccessControl");
    accessControl = await upgrades.deployProxy(AccessControl, [], {
      initializer: "initialize",
      kind: "uups",
    }) as unknown as SaaSAccessControl;
  });

  describe("Role Management", function () {
    it("Should set deployer as admin", async function () {
      expect(await accessControl.isAdmin(admin.address)).to.be.true;
    });

    it("Should allow admin to assign subscriber role", async function () {
      await accessControl.addSubscriber(subscriber.address);
      expect(await accessControl.isSubscriber(subscriber.address)).to.be.true;
    });

    it("Should allow subscriber to assign user role", async function () {
      await accessControl.addSubscriber(subscriber.address);
      await accessControl.connect(subscriber).addUser(user.address);
      expect(await accessControl.isUser(user.address)).to.be.true;
    });

    it("Should prevent non-admin from assigning subscriber role", async function () {
      await expect(
        accessControl.connect(otherAccount).addSubscriber(subscriber.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Role Revocation", function () {
    beforeEach(async function () {
      await accessControl.addSubscriber(subscriber.address);
      await accessControl.connect(subscriber).addUser(user.address);
    });

    it("Should allow admin to revoke subscriber role", async function () {
      await accessControl.removeSubscriber(subscriber.address);
      expect(await accessControl.isSubscriber(subscriber.address)).to.be.false;
    });

    it("Should allow subscriber to revoke user role", async function () {
      await accessControl.connect(subscriber).removeUser(user.address);
      expect(await accessControl.isUser(user.address)).to.be.false;
    });
  });

  describe("Batch Operations", function () {
    it("Should allow subscriber to batch assign user roles", async function () {
      await accessControl.addSubscriber(subscriber.address);
      const users = [user.address, otherAccount.address];
      
      await accessControl.connect(subscriber).batchAddUsers(users);
      
      expect(await accessControl.isUser(user.address)).to.be.true;
      expect(await accessControl.isUser(otherAccount.address)).to.be.true;
    });
  });

  describe("Upgradability", function () {
    it("Should only allow admin to upgrade", async function () {
      const AccessControlV2 = await ethers.getContractFactory("SaaSAccessControl");
      await expect(
        upgrades.upgradeProxy(accessControl.target, AccessControlV2.connect(otherAccount))
      ).to.be.reverted;
    });
  });
}); 