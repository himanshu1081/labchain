// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LabBooking {

    IERC20 public token;
    address public departmentWallet;

    constructor(address _token, address _departmentWallet) {
        token = IERC20(_token);
        departmentWallet = _departmentWallet;
    }

    struct Booking {
        address student;
        string equipmentId;
        uint256 startTime;
        uint256 endTime;
        uint256 depositAmount;
        bool returnedEquipment;
    }

    uint256 public bookingCount;

    mapping(uint256 => Booking) public bookings;

    function bookEquipment(
        string memory _equipmentId,
        uint256 _durationHours,
        uint256 _depositAmount
    ) public {

        token.transferFrom(msg.sender, address(this), _depositAmount);

        bookings[bookingCount] = Booking(
            msg.sender,
            _equipmentId,
            block.timestamp,
            block.timestamp + (_durationHours * 1 hours),
            _depositAmount,
            false
        );

        bookingCount++;
    }

    function returnEquipment(uint256 _bookingId) public {

        Booking storage booking = bookings[_bookingId];

        require(msg.sender == booking.student, "Not booking owner");
        require(!booking.returnedEquipment, "Already returned");
        require(block.timestamp <= booking.endTime, "Too late");

        booking.returnedEquipment = true;

        token.transfer(booking.student, booking.depositAmount);
    }

    function forfeit(uint256 _bookingId) public {

        Booking storage booking = bookings[_bookingId];

        require(block.timestamp > booking.endTime, "Booking still active");
        require(!booking.returnedEquipment, "Already returned");

        booking.returnedEquipment = true;

        token.transfer(departmentWallet, booking.depositAmount);
    }
}