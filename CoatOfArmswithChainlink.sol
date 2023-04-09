// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CoatOfArms is ERC721, ERC721URIStorage, AccessControl, VRFConsumerBase {
    bytes32 public constant FAMILY_ROLE = keccak256("FAMILY_ROLE");
    bytes32 private vrfKeyHash;
    uint256 private vrfFee;
    uint256 public randomResult;

    mapping(bytes32 => address) private requestIdToAddress;

    event NewMemberAdded(address indexed memberAddress);
    event FamilyNFTMinted(
        address indexed memberAddress,
        uint256 indexed tokenId,
        string tokenURI,
        string[3] powerWords,
        string[3] emotions
    );

    struct membershipList {
        address memberAddress;
    }

    struct familyMomentNFT {
        uint256 tokenId;
        string tokenURI;
        string[3] powerWords;
        string[3] emotions;
    }

    membershipList[] public familyMembers;
    familyMomentNFT[] public familyNFTsList;

    constructor(address vrfCoordinator, address linkToken, bytes32 _vrfKeyHash, uint256 _vrfFee)
        ERC721("CoatOfArms", "COA")
        VRFConsumerBase(vrfCoordinator, linkToken)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FAMILY_ROLE, msg.sender);
        vrfKeyHash = _vrfKeyHash;
        vrfFee = _vrfFee;
    }

    modifier onlyFamilyMember(address to) {
        require(
            hasRole(FAMILY_ROLE, to),
            "CoatOfArms: Address is not a family member"
        );
        _;
    }

    function getFamilyMembersCount() public view returns (uint256) {
        return familyMembers.length;
    }

    function getFamilyNFTsCount() public view returns (uint256) {
        return familyNFTsList.length;
    }

    function requestRandomTokenId(address to, string[3] memory powerWords, string[3] memory emotions, string memory uri) public onlyRole(FAMILY_ROLE) onlyFamilyMember(to) returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= vrfFee, "Not enough LINK tokens");
        requestId = requestRandomness(vrfKeyHash, vrfFee);
        requestIdToAddress[requestId] = to;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        address to = requestIdToAddress[requestId];
        uint256 tokenId = randomness;
        safeMint(to, tokenId, "", powerWords, emotions);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri,
        string[3] memory powerWords,
        string[3] memory emotions
    ) internal {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        familyNFTsList.push(
            familyMomentNFT(tokenId, uri, powerWords, emotions)
        );
        emit FamilyN
