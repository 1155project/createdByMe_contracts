# Created By Me: EVM / Solidity Contracts
Open source EVM/Solidity contract set that supports the Created By Me application.

## Getting Started
**Install Dependnacies**
run `npm install`

**Install Hardhat**
run `npm install --save-dev hardhat`

**Setup Environment Variables**
- Create a file named `.env` in the project root.
- Find the `sample.env` file and copy the contents from it to your `.env` file.
- Replace the example values with your own.

**Generate TypeScript Types**
run `npx hardhat typechain`

**Compile contracts**
run `npx hardhat compile`

**Run Tests**
run `npx hardhat test`

## Local Deployment
Hardhat comes with a local node that you can test your contracts on. See the [Hardhat documentation](https://hardhat.org/hardhat-runner/docs/guides/deploying) for more information about sdeployment.

### Start local node
`npx hardhat node`

### Deploy to local node
`npx hardhat run --network localhost scripts/deploy.ts`

## Deploy to a network
Make sure that *<network>* is defined in your local `hardhat.config.ts` file.
`npx hardhat run --network <your-network> scripts/deploy.js`

## Latest Deployments
### Test
**mumbai:** `not deployed`

### Prod
**polygon:** `not deployed`

## Other deployments
### Test
**mumbai:** `not deployed`

### Prod
**polygon:** `not deployed`