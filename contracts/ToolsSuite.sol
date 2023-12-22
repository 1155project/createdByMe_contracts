// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Utils } from "./lib/Tools.sol";

contract ToolsSuite {
    function isStringEmpty(string memory _val) public pure returns(bool) {
        return Utils.isStringEmpty(_val);
    }

    function stringLength(string memory s) public pure returns ( uint256) {
        return Utils.stringLength(s);
    }

    function toLower(string memory _str) public pure returns (string memory) {
		return Utils.toLower(_str);
	}

}