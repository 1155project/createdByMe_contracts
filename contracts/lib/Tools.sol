// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

library Utils {
    function isStringEmpty(string memory _val) internal pure returns(bool) {
        bytes memory tempEmptyStringTest = bytes(_val);
        bool result = false;
        if (tempEmptyStringTest.length == 0) {
            result = true;
        }

        return result;
    }

    function stringLength(string memory s) internal pure returns ( uint256) {
        return bytes(s).length;
    }

    function toLower(string memory _str) internal pure returns (string memory) {
		bytes memory bStr = bytes(_str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                // So we add 32 to make it lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }

		return string(bLower);
	}

    function sliceMax(uint start, uint end, uint len) internal pure returns (uint) {
        uint result = end;

        if (start + end  >= len) {
            result = len - 1;
        }

        return result;
    }
}