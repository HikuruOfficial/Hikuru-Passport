## HikuruPassport Smart Contract Overview

The HikuruPassport contract, developed by Hikuru Labs, is an advanced implementation of the ERC1155 standard, enhanced with ownership and supply management features. This contract is designed to issue unique digital passports on the Ethereum blockchain, leveraging the power of smart contracts for secure and verifiable digital asset management.

### Features and Capabilities

- **ERC1155 Standard Compliance**: Inherits the versatile ERC1155 standard, enabling efficient batch transfers, reduced transaction costs, and flexible token management.
- **Ownership Management**: Integrated with the Ownable contract to provide administrative controls and secure management functions to designated owners.
- **Supply Tracking**: Utilizes ERC1155Supply for precise tracking of token supplies, ensuring transparency and integrity in the issuance of digital passports.
- **Minting Fee and Piggy Bank**: Implements a minting fee mechanism, directing fees to the HikuruPiggyBank, a designated address for collecting transaction fees.
- **URI and Metadata Management**: Supports unique URIs for each token, allowing for rich metadata and digital identity information to be associated with each passport.
- **Whitelisting and Access Control**: Incorporates a whitelisting system to control access to minting functions, enhancing security and exclusivity.
- **Referral System**: Introduces a referral mechanism, rewarding users for inviting new participants and expanding the network.

### Key Functions
![image](https://github.com/HikuruOfficial/hikuru-passport/assets/132744928/1638b632-8f77-4aa8-b2c2-3dba348dbbe3)

- **Minting**: Offers two minting functions, one standard and one with referral rewards, facilitating the creation of new digital passports while incentivizing community growth.
- **User Type Determination**: Analyzes user scores to categorize participants into different tiers, such as "sybil," "human," and "crypto enthusiast," enriching the ecosystem's dynamics.
- **Administrative Controls**: Provides powerful tools for owners to manage URIs, update minting fees, modify the whitelist, and adjust user scores, ensuring adaptability and governance.
- **Ownership and Whitelist Management**: Enables the addition and removal of owners and whitelist members, granting flexibility in access and control.

### Security and Ownership

Ensuring the highest standards of security and governance, the contract employs modifiers and checks to restrict sensitive operations to authorized owners. This approach safeguards the contract against unauthorized access and malicious activities.

### Conclusion

The HikuruPassport contract represents a sophisticated blend of technology and strategy, aimed at creating a secure, scalable, and engaging digital passport ecosystem. By combining ERC1155's efficiency, Ownable's security, and ERC1155Supply's clarity, alongside innovative features like the referral system, Hikuru Labs sets a new standard for blockchain-based digital identities.

### Deployment and Verification
`npx hardhat run scripts/deploy.ts --network blast_sepolia`

Compiled 14 Solidity files successfully.
Deploying Hikuru Passport...

Deployer:  0x4d052115975db4a43D7471fa6E08696D4c0355A4

Hikuru Passport contract deployed to:  0xC4267e8a35281c30028752E69aAED43b34C3B539

`npx hardhat verify --network blast_sepolia --constructor-args args.js 0xC4267e8a35281c30028752E69aAED43b34C3B539`

Successfully submitted source code for contract

contracts/HikuruPassportV2.sol:HikuruPassport at 0xC4267e8a35281c30028752E69aAED43b34C3B539

for verification on the block explorer. Waiting for verification result...

Successfully verified contract HikuruPassport on the block explorer.
https://testnet.blastscan.io/address/0xC4267e8a35281c30028752E69aAED43b34C3B539#code

---

This description aims to provide a comprehensive overview of the HikuruPassport contract's purpose, functionality, and technical specifications, making it accessible to both technical and non-technical stakeholders.
