// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { AssetProvenance } from "./AssetProvenance.sol";
import { Constants } from "./lib/Constants.sol";
import { ICreatorNameService } from './ICreatorNameService.sol';

// Factory Contract
contract AssetCreatorFactory {

    event AssetProvenanceGenerated (address creator, address creatorContractAddress, string story, address sender);

    address[] public deployedCreators;
    address creatorNameSerivce;
    constructor(address _nameService) {
        creatorNameSerivce = _nameService;
    }

    function deployCreatorContract(address _id, string memory _story, string memory _uri) public {
        address assetProvenanceAddress = address(new AssetProvenance(_id, creatorNameSerivce, _story, _uri));
        deployedCreators.push(assetProvenanceAddress);

        ICreatorNameService service = ICreatorNameService(creatorNameSerivce);
        service.setCreatorAssetProvenenaceAddress(_id, assetProvenanceAddress);
        
        emit AssetProvenanceGenerated(_id, assetProvenanceAddress, _story, msg.sender);
    }

    function getRegisteredCreators(uint256 _idx, uint8 _pageSize) public view 
                returns(address [] memory creatorAddresses, uint8 count, uint256 totalCount) {
        require (_pageSize <= Constants.MAX_PAGE_SIZE, Constants.T_INV_PAGE_SIZE);
        creatorAddresses = new address [] (_pageSize);
        count = 0;
        totalCount = deployedCreators.length;

        for(uint i = 0; i < _pageSize; i++) {
            if (_idx + i >= deployedCreators.length) break;

            creatorAddresses[count] = deployedCreators[_idx + i];
            count += 1;
        }

        return (creatorAddresses, count, totalCount);
    }
}