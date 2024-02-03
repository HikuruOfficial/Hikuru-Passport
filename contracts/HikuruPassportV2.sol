// SPDX-License-Identifier: MIT
// author: Hikuru Labs
pragma solidity ^0.8.20;

// Importing OpenZeppelin contracts for ERC1155, Ownable, and ERC1155Supply functionality
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";


enum YieldMode {
    AUTOMATIC,
    VOID,
    CLAIMABLE
}

enum GasMode {
    VOID,
    CLAIMABLE 
}

// interface for Blast Feature
interface IBlast{
    // configure
    function configureContract(address contractAddress, YieldMode _yield, GasMode gasMode, address governor) external;
    function configure(YieldMode _yield, GasMode gasMode, address governor) external;

    // base configuration options
    function configureClaimableYield() external;
    function configureClaimableYieldOnBehalf(address contractAddress) external;
    function configureAutomaticYield() external;
    function configureAutomaticYieldOnBehalf(address contractAddress) external;
    function configureVoidYield() external;
    function configureVoidYieldOnBehalf(address contractAddress) external;
    function configureClaimableGas() external;
    function configureClaimableGasOnBehalf(address contractAddress) external;
    function configureVoidGas() external;
    function configureVoidGasOnBehalf(address contractAddress) external;
    function configureGovernor(address _governor) external;
    function configureGovernorOnBehalf(address _newGovernor, address contractAddress) external;

    // claim yield
    function claimYield(address contractAddress, address recipientOfYield, uint256 amount) external returns (uint256);
    function claimAllYield(address contractAddress, address recipientOfYield) external returns (uint256);

    // claim gas
    function claimAllGas(address contractAddress, address recipientOfGas) external returns (uint256);
    function claimGasAtMinClaimRate(address contractAddress, address recipientOfGas, uint256 minClaimRateBips) external returns (uint256);
    function claimMaxGas(address contractAddress, address recipientOfGas) external returns (uint256);
    function claimGas(address contractAddress, address recipientOfGas, uint256 gasToClaim, uint256 gasSecondsToConsume) external returns (uint256);

    // read functions
    function readClaimableYield(address contractAddress) external view returns (uint256);
    function readYieldConfiguration(address contractAddress) external view returns (uint8);
    function readGasParams(address contractAddress) external view returns (uint256 etherSeconds, uint256 etherBalance, uint256 lastUpdated, GasMode);
}



// HikuruPassport contract definition, inheriting from ERC1155, Ownable, and ERC1155Supply
contract HikuruPassport is ERC1155, Ownable, ERC1155Supply {
     // State variables
    uint256 private currentId = 1; // Variable to track the current token ID for NFTs
    uint256 public MINTING_FEE = 0.0004 ether; // Fee for minting an NFT
    address public hikuruPiggyBank; // Address of the piggy bank for collecting fees
    mapping(uint256 => string) private _URIs; // Mapping of token IDs to their URIs
    mapping(uint256 => string) private _usernames; // Mapping of token IDs to usernames
    mapping(uint256 => uint256) private _uids; // Mapping of token IDs to user IDs
    mapping(address => uint256) private userScores; // Mapping of user addresses to scores
    mapping(address => bool) public isWhitelisted; // Mapping to track whitelisted addresses
    mapping(address => bool) public isOwner; // Mapping to track owner addresses
    mapping(address => bool) public isMinted; // Mapping to track user mint already
    mapping(address => uint256) public referralsInviteCount; // Mapping to track how many reff invited


    IBlast public constant BLAST = IBlast(0x4300000000000000000000000000000000000002);


    // Modifier that checks that the caller is one of the owners
    // Modifier that checks that the caller is one of the owners
    modifier onlyHikuruOwner() {
        require(isOwner[msg.sender], "Caller is not an owner");
        _; // Continue execution
    }

    // Constructor sets up the initial owner and the piggy bank address
    constructor(address initialOwner, address _hikuruPiggyBank) ERC1155("") Ownable(initialOwner) {
        isOwner[initialOwner] = true;
        hikuruPiggyBank = _hikuruPiggyBank;

        BLAST.configureClaimableYield();
        BLAST.configureClaimableGas(); 
    }

    // Function to mint new NFTs
    function mint(address to, string memory uri_, string memory username_, uint256 uid_) public payable {
        require(isWhitelisted[to], "Caller is not whitelisted"); // Ensure the caller is whitelisted
        require(!isMinted[to], "Cant mint passport again"); // Ensure the caller is whitelisted
        require(msg.value >= MINTING_FEE, "Incorrect payment"); // Ensure the correct payment is sent

        // Transfer the minting fee to the hikuru piggy bank
        (bool feeTransferSuccess, ) = hikuruPiggyBank.call{value: msg.value}("");
        require(feeTransferSuccess, "Fee transfer failed");

        uint256 newId = currentId++; // Increment the current ID for the new NFT

        _mint(to, newId, 1, ""); // Mint the new NFT
        _URIs[newId] = uri_; // Set the URI for the new NFT
        _usernames[newId] = username_; // Set the username for the new NFT
        _uids[newId] = uid_; // Set the user ID for the new NFT
    }

    function mint(address to, string memory uri_, string memory username_, uint256 uid_, address referralAddress) public payable {
        require(isWhitelisted[to], "Caller is not whitelisted"); // Ensure the caller is whitelisted
        require(!isMinted[to], "Cant mint passport again"); // Ensure the caller is whitelisted
        require(msg.value >= MINTING_FEE, "Incorrect payment"); // Ensure the correct payment is sent


        // Calculate the referral fee as half of the minting fee
        uint256 referralFee = msg.value / 2;

        // Transfer the referral fee to the referral address
        (bool referralFeeTransferSuccess, ) = referralAddress.call{value: referralFee}("");
        require(referralFeeTransferSuccess, "Referral fee transfer failed");

        // Transfer the remaining fee to the hikuru piggy bank
        (bool feeTransferSuccess, ) = hikuruPiggyBank.call{value: msg.value - referralFee}("");
        require(feeTransferSuccess, "Fee transfer failed");

        uint256 newId = currentId++; // Increment the current ID for the new NFT

        _mint(to, newId, 1, ""); // Mint the new NFT
        referralsInviteCount[to]+=1;
        _URIs[newId] = uri_; // Set the URI for the new NFT
        _usernames[newId] = username_; // Set the username for the new NFT
        _uids[newId] = uid_; // Set the user ID for the new NFT
    }


    // Function to determine the user type based on their score
    function userType(address user) public view returns (string memory) {
        uint256 score = userScores[user];
        if (score < 20) {
            return "sybil";
        } else if (score < 80) {
            return "human";
        } else {
            return "crypto enthusiast";
        }
    }


    // Function for the owner to set the URI of a specific token
    function setURI(uint256 tokenId, string memory newuri) public onlyHikuruOwner {
        _URIs[tokenId] = newuri;
    }

    // Function to get the URI of a specific token
    function uri(uint256 tokenId) override public view returns (string memory) {
        return _URIs[tokenId];
    }

    // Function to get the username associated with a specific token
    function username(uint256 tokenId) public view returns (string memory) {
        return _usernames[tokenId];
    }

    // Function for the owner to update the minting fee
    function updateMintingFee(uint256 newFee) public onlyHikuruOwner {
        MINTING_FEE = newFee;
    }

    // Function for the owner to add a user to the whitelist and set their score
    function addToWhitelist(address user, uint256 score) public onlyHikuruOwner {
        isWhitelisted[user] = true;
        setUserScore(user, score);
    }

    // Private function for the owner to set a user's score
    function setUserScore(address user, uint256 score) private onlyHikuruOwner {
        userScores[user] = score;
    }

    // Function for the owner to remove a user from the whitelist
    function removeFromWhitelist(address user) public onlyHikuruOwner {
        isWhitelisted[user] = false;
    }

    // Function for the owner to set a new piggy bank address
    function setHikuruPiggyBank(address payable newPiggyBank_) external onlyHikuruOwner {
        require(newPiggyBank_ != address(0), "New piggy bank is the zero address");
        hikuruPiggyBank = newPiggyBank_;
    }

    // Function for the owner to add a new owner
    function addOwner(address newOwner) public onlyHikuruOwner {
        require(newOwner != address(0), "New owner is the zero address");
        isOwner[newOwner] = true;
    }

    // Function for the owner to remove an existing owner
    function removeOwner(address owner) public onlyHikuruOwner {
        isOwner[owner] = false;
    }

    // Internal override function to update token balances, ensuring consistency with ERC1155Supply
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }


    function claimAllYield(address recipient) external onlyHikuruOwner {
        // allow only the owner to claim the yield
        BLAST.claimAllYield(address(this), hikuruPiggyBank);
    }

    function claimMyContractsGas() external onlyHikuruOwner {
        // allow only the owner to claim the gas
        BLAST.claimAllGas(address(this), hikuruPiggyBank);
    }
}
