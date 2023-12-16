// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { Utils } from "./lib/Tools.sol";

contract ToolsSuite {
    uint constant MAX_PAGE_SIZE = 100;
    mapping(string => address) _stuff;

    function isStringEmpty(string memory _val) public pure returns(bool) {
        return Utils.isStringEmpty(_val);
    }

    function stringLength(string memory s) public pure returns ( uint256) {
        return Utils.stringLength(s);
    }

    function toLower(string memory _str) public pure returns (string memory) {
		return Utils.toLower(_str);
	}

    function sliceMax(uint start, uint end, uint len) public pure returns (uint) {
        return Utils.sliceMax(start,end,len);
    }

    function tryThis(uint[] memory it, uint start, uint end) public pure returns (uint[] memory) {
        //uint e = sliceMax(start, end, it.length);

        uint[] memory x = new uint[] (MAX_PAGE_SIZE);
        uint idx = 0;
        for(uint i = start; i < end; i++) {
            x[idx] = it[i];
            idx++;
        }

        return x;
    }

    function zeroAddressTest() public view returns (bool) {
        return address(0) == _stuff["bob"];
        //0x0000000000000000000000000000000000000000;
    }
}