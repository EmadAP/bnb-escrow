// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Script} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract Deploy is Script {
    function run() external returns (MockUSDT mockUSDT, Escrow escrow) {
        vm.startBroadcast();

        mockUSDT = new MockUSDT();
        escrow = new Escrow();

        vm.stopBroadcast();
    }
}
