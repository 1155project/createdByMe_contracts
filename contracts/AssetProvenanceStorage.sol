// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import { AssetProvenanceStructures } from "./lib/AssetProvenanceStructures.sol";
import { Constants } from "./lib/Constants.sol";
import { Utils } from "./lib/Tools.sol";
import { ICreatorNameService } from "./ICreatorNameService.sol";

import "hardhat/console.sol";

contract AssetStorage is ERC1155, AccessControl {
    using Math for uint256;

    event CreatorDefined (address creatorId, string displayName, string story);

    /**
    * Creator metadata.
    */
    AssetProvenanceStructures.Creator _creator;
    uint256 _assetCount;
    address _displayNameServiceAddress;

    /**
    * @dev Asset discriptive data by Id.
    */
    mapping (uint256 => AssetProvenanceStructures.Asset) _assetMetaData;

    /**
    * @dev Netadata URIs for assets
    */
    mapping (uint256 => string) _assetUri;

    /**
    * @dev Collection of defined series.
    */
    mapping (bytes32 => AssetProvenanceStructures.Series) _series;

    /**
    * @dev Assets by series.
    */
    mapping (bytes32 => uint256[]) _seriesAssets;

    /**
    * @dev Asset descriptive tags
    */
    mapping (uint256 => bytes32[]) _assetTags;

    /**
    * @dev inventory url by RFID Tag - optional used to allow an owner /
    * lender to associated a urls with each RFID tag associated with an asset. This
    * URL could trigger an RFID read, return last read information, link to a live
    * stream, etc.
    */
    mapping (uint256 => mapping(uint32 => string)) _inventoryUrls;

    bytes32[] _seriesIdList;

    constructor (address _id, address _nameServiceAddress, string memory _story, string memory _uri) ERC1155(_uri) {
        require(_id != address(0), Constants.T_CREATOR_RQ);
        require(_nameServiceAddress != address(0), Constants.T_NAME_SVR_RQ);

        _displayNameServiceAddress = _nameServiceAddress;

        string memory displayName = getCreatorName(_id);
        require(!Utils.isStringEmpty(displayName), Constants.T_DISP_NAME_RQ);

        _creator = AssetProvenanceStructures.Creator ({
            id: _id,
            story: _story
        });

        _assetCount = 0;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(Constants.AUTH_ROLE, msg.sender);

        // If the contract is not made by the creator, grant creator access.
        if(msg.sender != _id) {
            grantRole(DEFAULT_ADMIN_ROLE, _id);
            grantRole(Constants.AUTH_ROLE, _id);
        }

        emit CreatorDefined (_id, displayName, _story);
    }

    /**
    * @dev See {ERC1155-safeTransferFrom}.
    */
    function safeTransferFrom (
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
    public
    virtual
    override
    {
        // Perform transfer
        super.safeTransferFrom(from, to, id, amount, data);

        // Transfer complete - if this is an asset token (do not want to assume)
        // adjust metadata. Check asset id - if this is not an asset the ids will
        // not match.
        if (_assetMetaData[id].id == id) {
            _assetMetaData[id].owner = to;
        }
    }

    /**
    * @dev See {ERC1155-safeBatchTransferFrom}.
    */
    function safeBatchTransferFrom (
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
    public
    virtual
    override
    {
        // Perform batch transfer
        super.safeBatchTransferFrom(from, to, ids, amounts, data);

        // Update asset meta data.
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            // Transfer complete - if this is an asset token (do not want to assume)
            // adjust metadata. Check asset id - if this is not an asset the ids will
            // not match.
            if (_assetMetaData[id].id == id) {
                _assetMetaData[id].owner = to;
            }
        }
    }

    /**
    * @dev See {IERC165-supportsInterface}.
    */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return interfaceId == type(ERC1155).interfaceId ||
            interfaceId == type(IAccessControl).interfaceId || 
            super.supportsInterface(interfaceId);
    }

    /**
    * @dev Returns the URI for the asset. If the asset does not have a specified 
    *      URI the default is returned.
    */
    function uri(uint256 _aId) public view override returns (string memory) {
        if (bytes(_assetUri[_aId]).length > 0) {
            return _assetUri[_aId];
        }

        return super.uri(_aId);
    }

    function getCreatorName(address creatorId) internal view returns (string memory) {
        ICreatorNameService service = ICreatorNameService(_displayNameServiceAddress);
        return service.getCreatorName(creatorId);
    }

    // function setCreatorDisplayName(address _creatorId, string memory _displayName) internal {
    //     ICreatorNameService service = ICreatorNameService(_displayNameServiceAddress);

    //     service.setCreatorName(_creatorId, _displayName, {from: msg.sender});
    // }
}