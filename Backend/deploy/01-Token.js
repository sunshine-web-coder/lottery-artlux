module.exports = async ({getNamedAccounts, deployments})=>{
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts(); 
    
    await deploy("LotteryTickets", {
        from : deployer,
        log : true,
        args : [],
        waitConfirmations : 3
    })
}