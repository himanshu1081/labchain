export const CONTRACT_ADDRESS =
  "0xdFAA7610e516a16817afE6975248Ddb887f66Cf8";

export const ABI = [
  "function bookEquipment(string memory _equipmentId,uint256 _durationHours,uint256 _depositAmount) public",

  "function returnEquipment(uint256 _bookingId) public",

  "function bookingCount() view returns (uint256)",

  "function bookings(uint256) view returns(address student,string equipmentId,uint256 startTime,uint256 endTime,uint256 depositAmount,bool returnedEquipment)"
];

export const TOKEN_ADDRESS =
  "0xddB02b3CFea4032fF00A26e688A916C25257d97a";

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

