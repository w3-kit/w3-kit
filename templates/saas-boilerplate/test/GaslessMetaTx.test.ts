import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { GaslessMetaTx, SaaSAccessControl } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("GaslessMetaTx", function () {
  let metaTx: GaslessMetaTx;
  let accessControl: SaaSAccessControl; // Target contract for testing meta-transactions
  let owner: SignerWithAddress;
  let relayer: SignerWithAddress;
  let user: SignerWithAddress;
  let otherAccount: SignerWithAddress;
  const relayerReward = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, relayer, user, otherAccount] = await ethers.getSigners();
    
    // Deploy GaslessMetaTx
    const MetaTx = await ethers.getContractFactory("GaslessMetaTx");
    metaTx = await upgrades.deployProxy(MetaTx, [relayerReward], {
      initializer: "initialize",
      kind: "uups",
    }) as unknown as GaslessMetaTx;

    // Deploy target contract (AccessControl for testing)
    const AccessControl = await ethers.getContractFactory("SaaSAccessControl");
    accessControl = await upgrades.deployProxy(AccessControl, [], {
      initializer: "initialize",
      kind: "uups",
    }) as unknown as SaaSAccessControl;

    // Authorize relayer
    await metaTx.setRelayer(relayer.address, true);

    // Fund contract with ETH for relayer rewards
    await owner.sendTransaction({
      to: metaTx.target,
      value: ethers.parseEther("1.0")
    });

    // Transfer ownership of AccessControl to GaslessMetaTx contract
    await accessControl.transferOwnership(metaTx.target);
  });

  describe("Initialization", function () {
    it("Should set initial relayer reward", async function () {
      expect(await metaTx.relayerReward()).to.equal(relayerReward);
    });

    it("Should set owner correctly", async function () {
      expect(await metaTx.owner()).to.equal(owner.address);
    });
  });

  describe("Relayer Management", function () {
    it("Should authorize relayer correctly", async function () {
      expect(await metaTx.authorizedRelayers(relayer.address)).to.be.true;
    });

    it("Should revoke relayer authorization", async function () {
      await metaTx.setRelayer(relayer.address, false);
      expect(await metaTx.authorizedRelayers(relayer.address)).to.be.false;
    });

    it("Should only allow owner to manage relayers", async function () {
      await expect(
        metaTx.connect(otherAccount).setRelayer(otherAccount.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Meta Transaction Execution", function () {
    let deadline: bigint;
    let nonce: bigint;
    let signature: string;
    let metaTxData: any;

    beforeEach(async function () {
      deadline = BigInt(await time.latest()) + BigInt(3600);
      nonce = await metaTx.getNonce(owner.address);

      // Create meta-transaction to add user as subscriber in AccessControl
      const data = accessControl.interface.encodeFunctionData("addUser", [user.address]);
      
      metaTxData = {
        from: owner.address,
        to: accessControl.target,
        data: data,
        value: BigInt(0),
        nonce: nonce,
        deadline: deadline
      };

      // Sign the meta-transaction
      const domain = {
        name: "GaslessMetaTx",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await metaTx.getAddress()
      };

      const types = {
        MetaTx: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "data", type: "bytes" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      };

      signature = await owner.signTypedData(domain, types, metaTxData);
    });

    it("Should execute meta-transaction successfully", async function () {
      await metaTx.connect(relayer).executeMetaTx(metaTxData, signature);
      expect(await accessControl.isUser(user.address)).to.be.true;
    });

    it("Should increment nonce after execution", async function () {
      await metaTx.connect(relayer).executeMetaTx(metaTxData, signature);
      expect(await metaTx.getNonce(owner.address)).to.equal(nonce + BigInt(1));
    });

    it("Should pay relayer reward", async function () {
      const balanceBefore = await ethers.provider.getBalance(relayer.address);
      await metaTx.connect(relayer).executeMetaTx(metaTxData, signature);
      const balanceAfter = await ethers.provider.getBalance(relayer.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should verify signature correctly", async function () {
      await metaTx.connect(relayer).executeMetaTx(metaTxData, signature);
      expect(await metaTx.getNonce(owner.address)).to.equal(nonce + BigInt(1));
    });

    it("Should allow multiple meta-transactions with increasing nonces", async function () {
      // First transaction
      await metaTx.connect(relayer).executeMetaTx(metaTxData, signature);
      
      // Second transaction
      const newNonce = nonce + BigInt(1);
      const newMetaTxData = { ...metaTxData, nonce: newNonce };
      const newSignature = await owner.signTypedData(
        {
          name: "GaslessMetaTx",
          version: "1",
          chainId: (await ethers.provider.getNetwork()).chainId,
          verifyingContract: await metaTx.getAddress()
        },
        types,
        newMetaTxData
      );

      await metaTx.connect(relayer).executeMetaTx(newMetaTxData, newSignature);
      expect(await metaTx.getNonce(owner.address)).to.equal(newNonce + BigInt(1));
    });
  });

  describe("Upgradability", function () {
    it("Should only allow owner to upgrade", async function () {
      const MetaTxV2 = await ethers.getContractFactory("GaslessMetaTx");
      await expect(
        upgrades.upgradeProxy(metaTx.target, MetaTxV2.connect(otherAccount))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 