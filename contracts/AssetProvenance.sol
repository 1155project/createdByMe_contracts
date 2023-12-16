// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/utils/math/Math.sol";
import { IAssetProvenance } from "./IAssetProvenance.sol";
import { AssetStorage } from "./AssetProvenanceStorage.sol";
import { Utils } from "./lib/Tools.sol";
import { Constants } from "./lib/Constants.sol";
import { AssetProvenanceStructures } from "./lib/AssetProvenanceStructures.sol";

import "hardhat/console.sol";

contract AssetProvenance is IAssetProvenance, AssetStorage {
    uint constant MAX_ASSET_TAGS = 100;

    constructor (address _id, address _nameServiceAddress, string memory _story, string memory _uri) 
        AssetStorage(_id, _nameServiceAddress, _story, _uri) {
    }
   
    /// @notice Provide a way for a creator to define a series of assets.
    /// @dev _seriesId must be unique to this creator and not exist.
    /// @param _seriesId - unique name of a group of assets.
    function createSeries(bytes32 _seriesId, string memory _description) public override {
        require(_series[_seriesId].seriesId == 0, Constants.T_SERIES_EXISTS);
        require(Utils.stringLength(_description) < Constants.MAX_TEXT_LENGTH, Constants.T_DESC_TOO_LARGE);
        
        AssetProvenanceStructures.Series memory series = AssetProvenanceStructures.Series ({
            seriesId: _seriesId,
            description: _description
        });

        _series[_seriesId] = series;
        _seriesIdList.push(_seriesId);

        emit SeriesCreated(_creator.id, _seriesId, _description, msg.sender);
    }

    /// @notice Provides a way to retrieve all asset Ids associated with a series, paginated.
    /// @param _seriesId The series desired to show assets from.
    /// @param _idx Start index for the requested page.
    /// @param _pageSize Number of records to return at one time.
    function getAssetsBySeries(bytes32 _seriesId, uint256 _idx, uint8 _pageSize) public override view 
        returns(uint256 [] memory assetIds, uint8 count, uint256 totalCount) {
        require (_pageSize <= Constants.MAX_PAGE_SIZE, Constants.T_INV_PAGE_SIZE);
        uint256[] memory result = new uint256 [] (_pageSize);
        count = 0;
        totalCount = _seriesAssets[_seriesId].length;

        for(uint i = 0; i < _pageSize; i++) {
            if (_idx + i >= _seriesAssets[_seriesId].length) break;

            result[count] = _seriesAssets[_seriesId][_idx + i];
            count += 1;
        }

        return (result, count, totalCount);
    }

    /// @notice Provides a way to retieve the token's internal data.
    /// @param _assetId - main id of the target asset.
    function getAssetMetadata (uint256 _assetId) public override view
        returns(uint256 id, bytes32[] memory tags, string memory description, address creator, bytes32 seriesId, string memory url, uint256 documentHash) {
            AssetProvenanceStructures.Asset memory assetData = _assetMetaData[_assetId];
            id = _assetId;
            description = assetData.description;
            seriesId = assetData.seriesId;
            tags = _assetTags[_assetId];
            creator = _creator.id;
            url = uri(_assetId);
            documentHash = assetData.documentHash;
    }

    /// @notice Returns information about this creator.
    function getCreatorMetadata () public override view 
        returns(address creator, string memory displayName, string memory story, uint256 assetCount) {
            string memory name = getCreatorName(_creator.id);
            creator = _creator.id;
            displayName = name;
            story = _creator.story;
            assetCount = _assetCount;
    }

    /// @notice Enables a caller to retrieve the list of series created by the creator.
    /// @param _idx Start index for the requested page.
    /// @param _pageSize Number of records to return at one time.
    function getSeriesList(uint256 _idx, uint8 _pageSize) public override view 
        returns(bytes32 [] memory seriesIds, uint8 count, uint256 totalCount) {
        require (_pageSize <= Constants.MAX_PAGE_SIZE, Constants.T_INV_PAGE_SIZE);
        bytes32[] memory result = new bytes32 [] (_pageSize);
        count = 0;
        totalCount = _seriesIdList.length;
        
        for(uint i = 0; i < _pageSize; i++) {
            if (_idx + i >= _seriesIdList.length) break;

            result[count] = _seriesIdList[_idx + i];
            count += 1;
        }

        return (result, count, totalCount);
    }

    // @notice Retrieves information about the series
    // @param _seriesId Series Id
    function getSeriesMetadata(bytes32 _seriesId) public override view returns(string memory description) {
        description = _series[_seriesId].description;
    }

    /// @notice Registers a new asset NFT.
    /// @dev Asset cannot exist, 
    ///       msg.Sender must be asset owner or ApprovedForAll
    ///       _creator must exist, 
    ///       _creator must equal msg.sender, or msg.sender is admin.
    ///       _description must be less or equal to 1024 characters.
    /// @param _assetId id that corresponds to the RFID Tag associated to the physical asset.
    /// @param _seriesId Series asset belongs to, set to empty string to default to no series.
    /// @param _description Description of the asset
    /// @param _tags list of descriptive tags.
    function registerAsset(uint256 _assetId, bytes32 _seriesId, string memory _description, bytes32[] memory _tags) public override {
        require(_assetMetaData[_assetId].id == 0, Constants.T_ASSET_REG);
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);
        require(Utils.stringLength(_description) < Constants.MAX_TEXT_LENGTH, Constants.T_DESC_TOO_LARGE);

        AssetProvenanceStructures.Asset memory asset = AssetProvenanceStructures.Asset({
            id: _assetId,
            owner: _creator.id,
            seriesId: _seriesId,
            description: _description,
            documentHash: 0
        });

        _assetMetaData[_assetId] = asset;
        _seriesAssets[_seriesId].push(_assetId);
        _assetTags[_assetId] = _tags;

        emit AssetRegistered (_assetId, _description, _seriesId, _creator.id, msg.sender);
        emit AssetTagsAdded (_assetId, _tags);
    }

    /// @notice Sets a metadata file Uri for a specific asset.
    /// @dev Asset must exist
    /// @param _assetId id that corresponds to the RFID Tag associated to the physical asset.
    /// @param _uri uri to metadata files.
    /// @param _hash keccak-256 hash of the base Metadata document.
    function setAssetUri (uint256 _assetId, string memory _uri, uint256 _hash) public override {
        require(_assetMetaData[_assetId].id > 0, Constants.T_ASSET_NOT_FOUND);
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);

        _setURI(_uri);

        if(_hash > 0 && _hash != _assetMetaData[_assetId].documentHash) {
            _assetMetaData[_assetId].documentHash = _hash;
            emit HashUpdated (_assetId, _hash, msg.sender);
        }
    }

    /// @notice Update document hash value for asset. 
    /// @dev Sender must be asset owner or ApprovedForAll
    /// @param _assetId id that corresponds to the RFID Tag associated to the physical asset.
    /// @param _hash keccak-256 hash of the base Metadata document.
    function updateDocumentHash (uint256 _assetId, uint256 _hash) public override {
        require(_assetMetaData[_assetId].id > 0, Constants.T_ASSET_NOT_FOUND);
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);

        _assetMetaData[_assetId].documentHash = _hash;

        emit HashUpdated (_assetId, _hash, msg.sender);
    }

    /// @notice Updates the long description of the series.
    function updateSeriesDescription(bytes32 _seriesId, string memory _description) public override {
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);
        require(Utils.stringLength(_description) < Constants.MAX_TEXT_LENGTH, Constants.T_DESC_TOO_LARGE);

        _series[_seriesId].description = _description;

        emit SeriesDescriptionUpdated(_seriesId, _description);
    }

    function updateAssetDescription(uint256 _assetId, string memory _description) public override {
        require(_assetMetaData[_assetId].id > 0, Constants.T_ASSET_NOT_FOUND);
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);
        require(Utils.stringLength(_description) < Constants.MAX_TEXT_LENGTH, Constants.T_DESC_TOO_LARGE);

        _assetMetaData[_assetId].description = _description;

        emit AssetDescriptionUpdated(_assetId, _description);
    }

    function updateCreatorStory(string memory _story) public override {
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);
        require(Utils.stringLength(_story) < Constants.MAX_TEXT_LENGTH, Constants.T_DESC_TOO_LARGE);
        _creator.story = _story;

        emit CreatorStoryUpdated(_creator.id, _story);
    }

    function addTagToAsset(uint256 _assetId, bytes32 _tag) public override {
        require(_assetMetaData[_assetId].id > 0, Constants.T_ASSET_NOT_FOUND);
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);
        require(_assetTags[_assetId].length +1 < MAX_ASSET_TAGS, Constants.T_MAX_TAGS);
        console.log('addTagToAsset');
        uint idx = tagIndex(_assetId, _tag);
        require(idx > MAX_ASSET_TAGS, Constants.T_HAS_TAG);
         
        _assetTags[_assetId].push(_tag);
        bytes32[] memory tags = new bytes32[](1);
        tags[0] = _tag;
        emit AssetTagsAdded (_assetId, tags);
    }

    function removeTagFromAsset(uint256 _assetId, bytes32 _tag) public override {
        require(_assetMetaData[_assetId].id > 0, Constants.T_ASSET_NOT_FOUND);
        require(hasRole(Constants.AUTH_ROLE, msg.sender) || msg.sender == _creator.id, Constants.T_NOT_AUTHORIZED);
        console.log('removeTagFromAsset');
        uint idx = tagIndex(_assetId, _tag);
        require(idx < MAX_ASSET_TAGS, Constants.T_TAG_NOT_FOUND);
        
        bytes32[MAX_ASSET_TAGS] memory temp;
        uint tempIdx = 0;

        for(uint8 i = 0; i < _assetTags[_assetId].length; i++) {
            if (_assetTags[_assetId][i] != _tag) {
                temp[tempIdx] = _assetTags[_assetId][i];
                tempIdx++;
            }
        }

        _assetTags[_assetId] = temp;

        emit AssetTagsRemoved (_assetId, _tag);
    }

    function tagIndex(uint256 _assetId, bytes32 tag) internal view returns (uint) {
        for(uint8 i = 0; i < MAX_ASSET_TAGS; i++) {
            if (i  >= _assetTags[_assetId].length || _assetTags[_assetId][i] == 0) {
                break;
            }
            else if (_assetTags[_assetId][i] == tag) {
                return i;
            }
        }
        
        return MAX_ASSET_TAGS + 1;
    }
}