// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

library Constants {
  bytes32 public constant AUTH_ROLE = keccak256("AUTH_ROLE");
  bytes32 public constant CATEGORY_ADMIN = keccak256("CATEGORY_ADMIN");
  
  string public constant T_PAUSED = "PAUSED";
  string public constant T_ADD_AMOUNT = "ADD_AMOUNT";
  string public constant T_MIN_PUB_DOM = "MIN_PUBLIC_DOMAIN";
  string public constant T_PAYEE = "PAYEE";
  string public constant T_NOT_AUTHORIZED = "NOT AUTHORIZED";
  string public constant T_ASSET_NOT_FOUND = "ASSET NOT FOUND";
  string public constant T_DESC_TOO_LARGE = "DESCRIPTION TOO LARGE";
  string public constant T_ASSET_REG = "ASSET ALREADY REGISTERED";
  string public constant T_SERIES_NOT_FOUND = "SERIES NOT FOUND";
  string public constant T_SERIES_EXISTS = "SERIES EXISTS";
  string public constant T_HAS_TAG = "ASSET HAS TAG";
  string public constant T_TAG_NOT_FOUND = "TAG NOT FOUND";
  string public constant T_MAX_TAGS = "MAX TAGS DEFINED FOR ASSET";
  string public constant T_INV_PAGE_SIZE = "INVALID PAGESIZE";
  string public constant T_CREATOR_RQ = "Creator Address is required.";
  string public constant T_NAME_SVR_RQ = "Creator Address is required.";
  string public constant T_DISP_NAME_RQ = "Creator display name is required.";
  string public constant T_DISP_NAME_NA = "Name Service Address is required.";


  uint8 public constant CAT_DOMAIN_SHIFT = 224;
  uint8 public constant CAT_AREA_SHIFT = 192;
  uint8 public constant CAT_CATEGORY_SHIFT = 160;
  uint8 public constant CAT_SUB_CAT_SHIFT = 128;
  uint8 public constant CAT_LV1_SHIFT = 96;
  uint8 public constant CAT_LV2_SHIFT = 64;
  uint8 public constant CAT_LV3_SHIFT = 32;
  uint8 public constant CAT_LV4_SHIFT = 0;
  uint256 public constant CAT_MASK = 0xffffffff;

  uint public constant MAX_PAGE_SIZE = 100;
  uint public constant MAX_TEXT_LENGTH = 1024;
}