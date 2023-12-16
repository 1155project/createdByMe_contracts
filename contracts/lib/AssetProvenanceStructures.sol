// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

library AssetProvenanceStructures {
    struct Creator {
        address id;
        string story;
    }
    
    struct Series {
        bytes32 seriesId;
        string description;
    }

    /**
    * @dev Define structure of Asset
    */
    struct Asset {
        // NFC Id for ease of cross reference.
        uint256 id;
        // Current owner of the asset.
        address owner;
        // Series
        bytes32 seriesId;
        // Asset description
        string description;
        // Hash of metadata document
        uint256 documentHash;
    }
}