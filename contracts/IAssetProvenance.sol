// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @title Interface defining public, callable functions of an Asset Provenance
/// @author Advodyne Inc.
interface IAssetProvenance {
    event AssetRegistered (uint256 assetId, string description, bytes32 seriesId, address creator, address sender);

    event SeriesCreated(address creator, bytes32 seriesId, string description, address sender);

    event HashUpdated (uint256 assetId, uint256 documentHash, address from);

    event AssetTagsAdded (uint256 assetId, bytes32[] tags);

    event AssetTagsRemoved (uint256 assetId, bytes32 tag);

    event CreatorStoryUpdated(address creatorId, string story);

    event AssetDescriptionUpdated(uint256 assetId, string description);
 
    event SeriesDescriptionUpdated(bytes32 seriesId, string description);
    
    /// @notice Provide a way for a creator to define a series of assets.
    /// @dev _seriesId must be unique to this creator and not exist.
    /// @param _seriesId - unique name of a group of assets.
    function createSeries(bytes32 _seriesId, string memory _description) external;

    function getAssetsBySeries(bytes32 _seriesId, uint256 _idx, uint8 _pageSize) external view 
        returns(uint256 [] memory assetIds, uint8 count, uint256 totalCount);

    /// @notice Provides a way to retieve the token's internal data.
    /// @param _assetId - main id of the target asset.
    function getAssetMetadata (uint256 _assetId) external view
        returns(uint256 id, bytes32[] memory tags, string memory description, address creator, bytes32 seriesId, string memory _url, uint256 _documentHash);

    /// @notice Returns information about this creator.
    function getCreatorMetadata () external view 
        returns(address creator, string memory creatorName, string memory story, uint256 assetCount);

    /// @notice Enables a caller to retrieve the lst of series created by the creator.
    /// @param _idx starting index
    /// @param _pageSize number of records to return at one time.
    function getSeriesList(uint256 _idx, uint8 _pageSize) external view 
        returns(bytes32 [] memory seriesIds, uint8 count, uint256 totalCount);

    // @notice Retrieves information about the series
    // @param _seriesId Series Id
    function getSeriesMetadata(bytes32 _seriesId) external view returns(string memory description);

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
    function registerAsset(uint256 _assetId, bytes32 _seriesId, string memory _description, bytes32[] memory _tags) external;

    /// @notice Sets a metadata file Uri for a specific asset.
    /// @dev Asset must exist
    /// @param _assetId id that corresponds to the RFID Tag associated to the physical asset.
    /// @param _uri uri to metadata files.
    /// @param _hash keccak-256 hash of the base Metadata document.
    function setAssetUri (uint256 _assetId, string memory _uri, uint256 _hash) external;

    /// @notice Update document hash value for asset. 
    /// @dev Sender must be asset owner or ApprovedForAll
    /// @param _assetId id that corresponds to the RFID Tag associated to the physical asset.
    /// @param _hash keccak-256 hash of the base Metadata document.
    function updateDocumentHash (uint256 _assetId, uint256 _hash) external;

    function updateSeriesDescription(bytes32 _seriesId, string memory _description) external;

    function updateAssetDescription(uint256 _assetId, string memory _description) external;

    function updateCreatorStory(string memory _story) external;

    function addTagToAsset(uint256 _assetId, bytes32 _tag) external;

    function removeTagFromAsset(uint256 _assetId, bytes32 _tag) external;
}