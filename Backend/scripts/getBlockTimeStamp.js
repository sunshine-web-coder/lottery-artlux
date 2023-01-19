const {ethers} = require("hardhat")

const main = async ()=>{
    console.log((await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp)
}

main()