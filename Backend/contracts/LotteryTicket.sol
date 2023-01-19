//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

pragma solidity 0.8.9;

contract LotteryTickets is ERC20 {
    constructor() ERC20("Lottery Ticket", "LT"){
        _mint(msg.sender, 1e8 * 1e18);
    }
}