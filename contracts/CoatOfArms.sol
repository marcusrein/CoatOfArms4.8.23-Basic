// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract CoatOfArms is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant FAMILY_ROLE = keccak256('FAMILY_ROLE');

    event NewMemberAdded(address indexed memberAddress);
    event FamilyNFTMinted(
        address indexed memberAddress,
        uint256 indexed tokenId,
        string tokenURI
    );

    struct membershipList {
        address memberAddress;
    }

    struct familyMomentNFT {
        address to;
        uint256 tokenId;
        string tokenURI;
    }

    membershipList[] public familyMembers;
    familyMomentNFT[] public familyNFTsList;

    uint256 public tokenIdCounter = 0;

    constructor() ERC721('CoatOfArms', 'COA') {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FAMILY_ROLE, msg.sender);
    }

    modifier onlyFamilyMember(address to) {
        require(
            hasRole(FAMILY_ROLE, to),
            'CoatOfArms: Address is not a family member'
        );
        _;
    }

    function getFamilyMembersCount() public view returns (uint256) {
        return familyMembers.length;
    }

    function getFamilyNFTsCount() public view returns (uint256) {
        return familyNFTsList.length;
    }

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri
    ) public onlyRole(FAMILY_ROLE) onlyFamilyMember(to) {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        familyNFTsList.push(familyMomentNFT(to, tokenId, uri));
        emit FamilyNFTMinted(to, tokenId, uri);
        tokenIdCounter++;
    }

    function addMember(address newMemberAddress) public onlyRole(FAMILY_ROLE) {
        _grantRole(FAMILY_ROLE, newMemberAddress);
        familyMembers.push(membershipList(newMemberAddress));
        emit NewMemberAdded(newMemberAddress);
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
