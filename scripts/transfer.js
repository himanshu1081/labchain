const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const tokenAddress = "0xddB02b3CFea4032fF00A26e688A916C25257d97a";
  const recipient = "0xBd3CCCc3cE004436C0B44C23E6A4e2aAD380135d";
  const amount = hre.ethers.parseUnits("100000", 18);

  const token = await hre.ethers.getContractAt("LabToken", tokenAddress);

  console.log("Deployer:", deployer.address);
  console.log("Sending 100,000 LAB tokens to:", recipient);

  const tx = await token.transfer(recipient, amount);
  await tx.wait();

  console.log("Transfer successful! Tx hash:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
