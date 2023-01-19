so, using this files you can stimulate a launch on bsc mainnet, there is not any difference between this stimulation and bsc mainnet
what is forking?
" the ability to copy the state of the mainnet blockchain into your local environment, including all balances and deployed contracts. This is known as "forking mainnet."

# Important
make sure to change the path in utils/updateui.js file to your front-end path
currently its synced with our working directory
const path = "/home/roholah/Desktop/8Bit/src-ssr/contract/"

# to start you just have to:
1- use yarn install to isntall node modules
2- use yarn hardhat node, to start a forked bsc mainnet, this command forks bsc mainnet and also adds liquidity (BNB) to your token, after doing this you can use "npm start" to start your website, what you must know is to add this test blockchain to your metamask, to do this, add a new network to your metamask with this configurations:
rpc url : http://127.0.0.1:8545
chain id: 31337
symbol: BNB
name : hardhat
3- after using "yarn hardhat node" command you will see a bunch of addresses and private keys printed in the console, grab first account's Private key (Account #0) and add it to metamask, you will now have a wallet with 1000 BNB in it
4- use "npm start" in your front-end files, select "hardhat" network from metamask and connect the account that we added recently, use "yarn hardhat admin" to transfer 8bit tokens to this address

# Commands
open another terminal in same folder and then use one of this commands
- use "yarn hardhat admin" to transfer 8bit tokens to the account that we just added to metamask (since this account doesnt have any 8bit tokens) (admin.js)
- use "yarn hardhat startStaking" to start staking (startStaking.js)
- use "yarn hardhat timetravel" to increase time by a costume value in seconds, you can change this value in scripts/increaseTime.js (secs)
- use "yarn hardhat fundFacility" to fund facility contract with 10,000 BUSD tokens (fundFacility.js)


# Mass Buying and selling 8bit
after "yarn hardhat node" command, your token is already launched and liquidity with BNB is added, this is done in deploy/00-8bitToken.js (100 ETH with 50% of supply is added to liquidity pool)
use "yarn mb" to perform 10 buys on 8bit
use "yarn sl" to perform 10 sells on 8bit
you can handle buy and sell operations in launch.config.js
variables:
buyAmount => the amount of BNB to be swapped to 8bit in every buy
sellDenominator => the amount of 8bit to be sold in each sell => total supply / sellDenominator
monitoring => the wallets that you want to check their balance for a specifiec token after each trade, for example we are checking development and marketing wallet BNB balance afer each trade, this is useful if you want to know whether taxes are going into right place or not


# Writing a costume test and interacting with contracts
go to scripts/costumeTest.js file to know how to write a costume test and how to interact with contracts
use "yarn ctest" to perform the costume tests


# Contracts
contracts folder contains all the contracts, after editing a contract, shut down the blockchain and use "yarn hardhat node" again