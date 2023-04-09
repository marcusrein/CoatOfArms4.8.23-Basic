// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract CoatOfArms is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant FAMILY_ROLE = keccak256('FAMILY_ROLE');

    event NewMemberAdded(
        address indexed from,
        address indexed newMemberAddress
    );
    event FamilyNFTMinted(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI
    );

    struct familyList {
        address memberAddress;
    }

    struct familyMomentNFT {
        address from;
        address to;
        uint256 tokenId;
        string tokenURI;
    }

    familyList[] private familyMembers;
    familyMomentNFT[] private familyNFTsList;

    uint256 public tokenIdCounter;
    string[] internal tokenURIs;

    constructor() ERC721('CoatOfArms', 'COA') {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FAMILY_ROLE, msg.sender);
        familyMembers.push(familyList(msg.sender));
        tokenIdCounter = 0;
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
        address from,
        address to,
        uint256 tokenId,
        string memory uri
    ) public onlyRole(FAMILY_ROLE) onlyFamilyMember(to) {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        familyNFTsList.push(familyMomentNFT(from, to, tokenId, uri));
        emit FamilyNFTMinted(from, to, tokenId, uri);
        tokenIdCounter++;
    }

    function getTokenIdCounter() public view returns (uint256) {
        return tokenIdCounter;
    }

    function addMember(
        address currentMemberAddress,
        address newMemberAddress
    ) public onlyRole(FAMILY_ROLE) {
        _grantRole(FAMILY_ROLE, newMemberAddress);
        familyMembers.push(familyList(newMemberAddress));
        emit NewMemberAdded(currentMemberAddress, newMemberAddress);
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
