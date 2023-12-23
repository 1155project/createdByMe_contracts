// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ICreatorNameService {
    event CreatorNameSet(address creatorId, string displayName);

    function getCreatorId(string memory _displayName) external view returns(address creatorId);

    function getCreatorName(address _creatorId) external view returns(string memory displayName);

    function isCreatorNameAvailable(string memory _displayName) external view returns (bool);

    function setCreatorName(address _creatorId, string memory _displayName) external;

    function setCreatorAssetProvenenaceAddress(address _creatorId, address _assetProvenanceAddress) external;

    function getCreatorAssetProvenanceAddress(address _creatorId) external view returns (address);
}