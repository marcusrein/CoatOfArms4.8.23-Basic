// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/proxy/utils/Initializable.sol';
import './CoatOfArms.sol';

contract ImplementationContract is CoatOfArms, Initializable {
    function initialize(
        string memory name,
        string memory symbol,
        address admin
    ) external initializer {
        // Initialize ERC721
        ERC721.__ERC721_init(name, symbol);

        // Initialize AccessControl
        AccessControl.__AccessControl_init();

        // Set up roles
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(FAMILY_ROLE, admin);
    }
}
