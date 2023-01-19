const { ethers } = require("hardhat");
const {verify} = require("../utils/verify")

module.exports = async ({getNamedAccounts, deployments})=>{
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts(); 

    const LotteryTicket = await ethers.getContract("LotteryTickets", deployer)
    const RandomNumberGenerator = await ethers.getContract("RandomNumberGenerator", deployer)

    const Lottery = await deploy("waglotteryySwapLottery", {
        from : deployer,
        log : true,
        args : [LotteryTicket.address, RandomNumberGenerator.address],
        waitConfirmations : 3
    })

    await RandomNumberGenerator.setLotteryAddress(Lottery.address)

    await verify(Lottery.address, [LotteryTicket.address, RandomNumberGenerator.address])
    await verify(LotteryTicket.address, [])
}