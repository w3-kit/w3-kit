import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { TokenPayment, IERC20Upgradeable, IERC721Upgradeable } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TokenPayment", function () {
  let tokenPayment: TokenPayment;
  let mockERC20: any;
  let mockERC721: any;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let tokenPrice = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy("Mock Token", "MTK");

    const MockERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721.deploy("Mock NFT", "MNFT");

    // Deploy TokenPayment
    const TokenPayment = await ethers.getContractFactory("TokenPayment");
    tokenPayment = await upgrades.deployProxy(TokenPayment, [], {
      initializer: "initialize",
      kind: "uups",
    }) as unknown as TokenPayment;

    // Configure tokens
    await tokenPayment.configureToken(mockERC20.target, tokenPrice);
    await tokenPayment.configureNFT(mockERC721.target);

    // Mint tokens to user
    await mockERC20.mint(user.address, tokenPrice);
    await mockERC721.mint(user.address, 1);
  });

  describe("Token Configuration", function () {
    it("Should configure ERC20 token correctly", async function () {
      const config = await tokenPayment.acceptedTokens(mockERC20.target);
      expect(config.isEnabled).to.be.true;
      expect(config.price).to.equal(tokenPrice);
    });

    it("Should configure NFT correctly", async function () {
      const config = await tokenPayment.acceptedNFTs(mockERC721.target);
      expect(config.isEnabled).to.be.true;
    });
  });

  describe("ERC20 Payments", function () {
    beforeEach(async function () {
      await mockERC20.connect(user).approve(tokenPayment.target, tokenPrice);
    });

    it("Should process ERC20 payment correctly", async function () {
      await tokenPayment.connect(user).payWithToken(mockERC20.target);
      expect(await tokenPayment.checkAccess(user.address)).to.be.true;
    });

    it("Should fail with insufficient allowance", async function () {
      await mockERC20.connect(user).approve(tokenPayment.target, 0);
      await expect(
        tokenPayment.connect(user).payWithToken(mockERC20.target)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("NFT Access", function () {
    it("Should grant access with valid NFT", async function () {
      await tokenPayment.connect(user).validateNFTAccess(mockERC721.target, 1);
      expect(await tokenPayment.checkAccess(user.address)).to.be.true;
    });

    it("Should fail with invalid NFT", async function () {
      await expect(
        tokenPayment.connect(user).validateNFTAccess(mockERC721.target, 2)
      ).to.be.revertedWith("ERC721: invalid token ID");
    });
  });

  describe("Access Management", function () {
    it("Should allow admin to revoke access", async function () {
      await tokenPayment.connect(user).validateNFTAccess(mockERC721.target, 1);
      await tokenPayment.revokeAccess(user.address);
      expect(await tokenPayment.checkAccess(user.address)).to.be.false;
    });
  });

  describe("Token Withdrawal", function () {
    it("Should allow admin to withdraw tokens", async function () {
      // First approve spending
      await mockERC20.connect(user).approve(tokenPayment.target, tokenPrice);
      // Then make payment
      await tokenPayment.connect(user).payWithToken(mockERC20.target);
      // Then withdraw as admin
      await tokenPayment.withdrawTokens(mockERC20.target, tokenPrice);
      expect(await mockERC20.balanceOf(owner.address)).to.equal(tokenPrice);
    });
  });
}); 