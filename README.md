# LabBooking Blockchain Project

## Features
- Book lab equipment
- Lock deposit using ERC20 token
- Return equipment before deadline for refund
- Late return forfeits deposit

## Stack
- Solidity
- Hardhat
- React
- ethers.js
- Sepolia Testnet

## Setup

### Install dependencies
```bash
npm install
```

### Run local node
```bash
npx hardhat node
```

### Deploy
```bash
npx hardhat run scripts/deploy.js --network sepolia
```