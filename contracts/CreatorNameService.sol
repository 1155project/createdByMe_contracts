// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/AccessControl.sol"; 

import { Utils } from "./lib/Tools.sol";
import { Constants } from "./lib/Constants.sol";
import { ICreatorNameService } from "./ICreatorNameService.sol";

import "hardhat/console.sol";

// mumbai: 0x89Ab1da028A168Dc7a33b9C0b68Dd72d30DeE364
contract CreatorNameService is ICreatorNameService, AccessControl {
    //event CreatorNameSet(address creatorId, string displayName);
    mapping (string => address) _creatorByName;
    mapping (address => string) _displayNames;
    mapping (address => address) _creatorAssetRecords;

    constructor () {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(Constants.AUTH_ROLE, msg.sender);
    }

    function getCreatorId(string memory _displayName) public view returns(address creatorId) {
        string memory _lcName = Utils.toLower(_displayName);
        creatorId = _creatorByName[_lcName];
    }

    function getCreatorName(address _creatorId) public view returns(string memory displayName) {
        displayName = _displayNames[_creatorId];
    }

    function isCreatorNameAvailable(string memory _displayName) public view returns (bool) {
        string memory _lcName = Utils.toLower(_displayName);
        bool avail = _creatorByName[_lcName] == address(0);
        return avail;
    }

    function setCreatorName(address _creatorId, string memory _displayName) public {
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creatorId, "NOT AUTHORIZED");

        require(isCreatorNameAvailable(_displayName), "NAME NOT AVAILABLE");
        // Do not allow the display name to ever be changed once set - is this
        // the correct assumption? Should the creator ever be allowed to change
        // their own display name (such as mis-spelled at creation/
        require(Utils.isStringEmpty(_displayNames[_creatorId]), "CREATOR NAME ALREADY SET");

        // Normalize name for lookup
        string memory lcName = Utils.toLower(_displayName);

        _creatorByName[lcName] = _creatorId;
        _displayNames[_creatorId] = _displayName;

        emit CreatorNameSet(_creatorId, _displayName);
    }

    function setCreatorAssetProvenenaceAddress(address _creatorId, address _assetProvenanceAddress) public override {
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creatorId, "NOT AUTHORIZED");
        require(_creatorAssetRecords[_creatorId] == address(0), "CREATOR ASSET RECORD ALREADY SET");
        
        _creatorAssetRecords[_creatorId] = _assetProvenanceAddress;
    }

    function getCreatorAssetProvenanceAddress(address _creatorId) public view returns (address) {
        return _creatorAssetRecords[_creatorId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return interfaceId == type(IAccessControl).interfaceId || 
            super.supportsInterface(interfaceId);
    }
}