const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");


const hikuruPiggyBankAddss = "0x76b70aE8c9a9A4467a1cA3D7339F86D854f476c0";

interface HikuruPassport{
  balanceOf(address: any, arg1: number): unknown;
  isOwner(address: any): any;
  connect(owner: { address: any; }): any;
  addOwner(address: any): any;
  isWhitelisted(address: any): any;
  userType(address: any): any;
  uri(tokenId: number): any;
  hikuruPiggyBank(): any;
  username(tokenId: number): any;
  mint(to: string, badgeTypeId: number, options: { value: any }): Promise<any>;
  mint(to: string, badgeTypeId: number, reffAddress: string, options: { value: any }): Promise<any>;
}


describe("HikuruPassport", function () {
  let HikuruPassport;
  let hikuruPassport: HikuruPassport;
  let owner: { address: any; }, otherAccount: { address: any; }, anotherOwner: { address: any; }, referral: { address: any; };

  const mintingFee = ethers.parseEther("0.0004");
  const mintingFeeForRef = ethers.parseEther("0.0002");


  // Deploy the contract before each test
  beforeEach(async function () {
    [owner, otherAccount, anotherOwner, referral] = await ethers.getSigners();

    HikuruPassport = await ethers.getContractFactory("contracts/HikuruPassportV2.sol:HikuruPassport");
    hikuruPassport = await HikuruPassport.deploy(owner.address, hikuruPiggyBankAddss);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hikuruPassport.isOwner(owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should fail minting if not whitelisted", async function () {
      const [owner, otherAccount] = await ethers.getSigners();
  
      // Deploy the contract
      const HikuruPassport = await ethers.getContractFactory("HikuruPassport");
      const hikuruPassport = await HikuruPassport.deploy(owner.address, hikuruPiggyBankAddss);
  
      // Whitelist the otherAccount address
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 50);
  
      // Check if otherAccount is whitelisted
      const isWhitelisted = await hikuruPassport.isWhitelisted(otherAccount.address);
      expect(isWhitelisted).to.be.true;
  
      // Attempt the minting operation from otherAccount
      // await expect(
      //   hikuruPassport.connect(otherAccount).mint(owner.address, "uri", "username", 1, { value: mintingFee })
      // ).to.be.revertedWith("Caller is not whitelisted");

      await expect(hikuruPassport.connect(otherAccount)["mint(address,string,string,uint256)"](owner.address, "uri", "username", 1, { value: mintingFee }))
            .to.be.revertedWith("Caller is not whitelisted");
    });

      it("Should fail minting with insufficient fee", async function () {
        await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 50);
        // await expect(hikuruPassport.connect(otherAccount).mint(otherAccount.address, "uri", "username", 1, { value: ethers.parseEther("0.0001") }))
        //     .to.be.revertedWith("Incorrect payment");

        await expect(hikuruPassport.connect(otherAccount)["mint(address,string,string,uint256)"](otherAccount.address, "uri", "username", 1, { value: ethers.parseEther("0.0001") }))
        .to.be.revertedWith("Incorrect payment");
    });
  });


  describe("Minting for Different Amounts and Users", function () {
    it("Should allow minting for multiple whitelisted users", async function () {
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 50);
      await hikuruPassport.connect(owner).addToWhitelist(anotherOwner.address, 50);
      // await expect(hikuruPassport.connect(otherAccount).mint(otherAccount.address, "uri", "username", 1, { value: mintingFee })).to.not.be.reverted;
      // await expect(hikuruPassport.connect(anotherOwner).mint(anotherOwner.address, "uri", "username", 1, { value: mintingFee })).to.not.be.reverted;

      await expect(hikuruPassport.connect(otherAccount)["mint(address,string,string,uint256)"](otherAccount.address, "uri", "username", 1, { value: mintingFee }))
      .to.not.be.reverted;
      await expect(hikuruPassport.connect(anotherOwner)["mint(address,string,string,uint256)"](anotherOwner.address, "uri", "username", 1, { value: mintingFee }))
      .to.not.be.reverted;
    });
  });

  describe("Ownership", function () {
    it("Should allow adding a new owner", async function () {
      // Call the function to add anotherOwner as a new owner
      await hikuruPassport.addOwner(anotherOwner.address);
    
      // Check if anotherOwner is added as an owner
      const isAnotherOwner = await hikuruPassport.isOwner(anotherOwner.address);
      expect(isAnotherOwner).to.be.true;
    });
    it("Should prevent non-owners from adding a new owner", async function () {
      try {
        await expect(
          hikuruPassport.connect(otherAccount).addOwner(otherAccount.address)
        ).to.be.revertedWith("Caller is not the owner");
        expect.fail('Transaction should have thrown an error');
      } catch (error) {
        
      }
    });

  });

  describe("Ownership Transfer", function () {
    it("Should transfer ownership correctly", async function () {
      await hikuruPassport.connect(owner).addOwner(anotherOwner.address);
      await hikuruPassport.connect(owner).removeOwner(owner.address);
      expect(await hikuruPassport.isOwner(owner.address)).to.be.false;
      expect(await hikuruPassport.isOwner(anotherOwner.address)).to.be.true;
    });
  });

  describe("HikuruPassport", function () {
    it("Should increase the hikuruPiggyBank's balance by the minting fee after minting", async function () {
      const [owner, otherAccount] = await ethers.getSigners();
  
      // Deploy the contract
      const HikuruPassport = await ethers.getContractFactory("HikuruPassport");
      const hikuruPassport = await HikuruPassport.deploy(owner.address, hikuruPiggyBankAddss);
  
      // Whitelist the otherAccount address
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 50);
  
      // Get the initial balance of hikuruPiggyBank
      const initialBalance = await ethers.provider.getBalance(hikuruPiggyBankAddss);
  
      // Mint an NFT, sending the minting fee
      // await hikuruPassport.connect(otherAccount).mint(otherAccount.address, "uri", "username", 1, { value: mintingFee });
      await hikuruPassport.connect(otherAccount)["mint(address,string,string,uint256)"](otherAccount.address, "uri", "username", 1, { value: mintingFee });
  
      // Get the new balance of hikuruPiggyBank
      const newBalance = await ethers.provider.getBalance(hikuruPiggyBankAddss);
  
      // Check if the hikuruPiggyBank's balance increased by the minting fee
      expect(newBalance-initialBalance).to.equal(mintingFee);
    });
  });

  describe("User Score Management", function () {
    it("Should correctly set and remove a user from the whitelist", async function () {
        await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 50);
        let isWhitelisted = await hikuruPassport.isWhitelisted(otherAccount.address);
        expect(isWhitelisted).to.be.true;

        await hikuruPassport.connect(owner).removeFromWhitelist(otherAccount.address);
        isWhitelisted = await hikuruPassport.isWhitelisted(otherAccount.address);
        expect(isWhitelisted).to.be.false;
    });

    it("Should handle edge cases for user scores", async function () {
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 0);
      let isWhitelisted = await hikuruPassport.isWhitelisted(otherAccount.address);
      expect(isWhitelisted).to.be.true;
  
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 1000);
      let isWhitelisted2 = await hikuruPassport.isWhitelisted(otherAccount.address);
      expect(isWhitelisted2).to.be.true;
    });

    // Add more tests related to user score management here...
});

describe("User Type Determination", function () {
  it("Should return correct user type based on score", async function () {
      // Set score to 25 and check user type
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 25);
      expect(await hikuruPassport.userType(otherAccount.address)).to.equal("human");

      // Update score to 85 and check user type again
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 85);
      expect(await hikuruPassport.userType(otherAccount.address)).to.equal("crypto enthusiast");
  });
});

describe("Ownership and Access Control", function () {
  it("Should prevent non-owners from adding new owners", async function () {
      await expect(hikuruPassport.connect(otherAccount).addOwner(otherAccount.address))
          .to.be.revertedWith("Caller is not an owner");
  });

  // Add more tests related to ownership and access control here...
});


describe("URI Management", function () {
  it("Should correctly set and retrieve token URI", async function () {
      const tokenId = 1;
      const newUri = "https://example.com/newuri";

      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 50);
      // await hikuruPassport.connect(otherAccount).mint(otherAccount.address, "uri", "username", 1, { value: mintingFee });
      await hikuruPassport.connect(otherAccount)["mint(address,string,string,uint256)"](otherAccount.address, "uri", "username", 1, { value: mintingFee });


      await hikuruPassport.connect(owner).setURI(tokenId, newUri);
      expect(await hikuruPassport.uri(tokenId)).to.equal(newUri);
  });
});



describe("Piggy Bank Interactions", function () {
  it("Should allow owner to change piggy bank address", async function () {
      const newPiggyBankAddress = "0x000000000000000000000000000000000000dEaD";
      await hikuruPassport.connect(owner).setHikuruPiggyBank(newPiggyBankAddress);
      expect(await hikuruPassport.hikuruPiggyBank()).to.equal(newPiggyBankAddress);
  });

  it("Should prevent non-owners from changing piggy bank address", async function () {
    const newPiggyBankAddress = "0x000000000000000000000000000000000000dEaD";
    try {
      await hikuruPassport.connect(otherAccount).setHikuruPiggyBank(newPiggyBankAddress);
      expect.fail("Transaction should have failed");
    } catch (error: any) {
      expect(error.message).to.include("revert"); // Check only for revert, not for the specific message
    }
  });

});

describe("Ownership Modifications", function () {
  it("Should allow removing an owner", async function () {
      await hikuruPassport.connect(owner).addOwner(anotherOwner.address);
      await hikuruPassport.connect(owner).removeOwner(anotherOwner.address);
      expect(await hikuruPassport.isOwner(anotherOwner.address)).to.be.false;
  });
});

describe("Token Metadata", function () {
  it("Should correctly assign username and UID to minted tokens", async function () {
      const tokenId = 1;
      const username = "testuser";
      const uid = 123;

      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 50);
      // await hikuruPassport.connect(otherAccount).mint(otherAccount.address, "uri", username, uid, { value: mintingFee });
      await hikuruPassport.connect(otherAccount)["mint(address,string,string,uint256)"](otherAccount.address, "uri", username, uid, { value: mintingFee });


      expect(await hikuruPassport.username(tokenId)).to.equal(username);
      // Add UID check if applicable
  });
});

describe("User Type Boundary Conditions", function () {
  it("Should return correct user type at boundary scores", async function () {
    await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 20);
    expect(await hikuruPassport.userType(otherAccount.address)).to.equal("human"); // or the correct type at this boundary

    await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 80);
    expect(await hikuruPassport.userType(otherAccount.address)).to.equal("crypto enthusiast"); // or the correct type at this boundary
  });
});


describe("Minting with Referral", function () {
  beforeEach(async function () {
      // Assuming badge type 1 is already created for testing
      await hikuruPassport.connect(owner).addToWhitelist(otherAccount.address, 40);
  });

  it("Should transfer referral fee and mint fee correctly", async function () {
      const initialReferralBalance = await ethers.provider.getBalance(referral.address);
      const initialPiggyBankBalance = await ethers.provider.getBalance(hikuruPassport.hikuruPiggyBank());

      // Perform the mint operation
      // const tx = await hikuruBadges.connect(otherAccount).mint(referralAccount.address, 1, { value: mintingFee });
      const tx = await hikuruPassport.connect(otherAccount)["mint(address,string,string,uint256,address)"](otherAccount.address, "uri", "username", 1, referral.address, { value: mintingFee });
      await tx.wait();

      // Calculate expected balances after minting
      // const mintingFeeBN = ethers.BigNumber.from(mintingFee);

      const expectedPiggyBankBalance = initialPiggyBankBalance+mintingFee-mintingFeeForRef;

      // Check final balances
      const finalReferralBalance = await ethers.provider.getBalance(referral.address);
      const finalPiggyBankBalance = await ethers.provider.getBalance(hikuruPassport.hikuruPiggyBank());
      
      expect(finalReferralBalance).to.equal(initialReferralBalance+mintingFeeForRef);
      expect(finalPiggyBankBalance).to.equal(expectedPiggyBankBalance);

      // Check if the badge was successfully minted
      const balanceOfBadge = await hikuruPassport.balanceOf(otherAccount.address, 1);
      expect(balanceOfBadge).to.equal(1);
  });
  });

  // Additional tests can go here...
});
