const hre = require("hardhat");

async function main() {

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying from:", deployer.address);

  const Token = await hre.ethers.getContractFactory("LabToken");
  const token = await Token.deploy();

  await token.waitForDeployment();

  console.log("Token deployed:", await token.getAddress());

  const Booking = await hre.ethers.getContractFactory("LabBooking");

  const booking = await Booking.deploy(
    await token.getAddress(),
    process.env.PUBLIC_ADDRESS
  );

  await booking.waitForDeployment();

  console.log("Booking deployed:", await booking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});