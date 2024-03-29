import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying Hikuru Passport...");
    console.log("Deployer: ", deployer.address);

    // Deploying the contract
    const contractFactory = await ethers.getContractFactory("contracts/HikuruPassportV2.sol:HikuruPassport");
    const contract = await contractFactory.deploy(
        "0x2D1CC54da76EE2aF14b289527CD026B417764fAB",
        "0x1bCec961363dC355558421E8a66423006aB75a25"
    );
    await contract.waitForDeployment();

    console.log("Hikuru Passport contract deployed to: ", contract.target);
    console.log("Deployer: ", deployer.address);

    return { contract, deployer };
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

