const { verify } = require("../utils/verify");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const vrfCoordinator = "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f";

  const vrfWrapper = "0x721DFbc5Cfe53d32ab00A9bdFa605d3b8E1f3f42";
  const linkTest = "0x404460C6A5EdE2D891e8297795264fDe62ADBB75";

  const rg = await deploy("RandomNumberGenerator", {
    from: deployer,
    log: true,
    args: [vrfWrapper, linkTest],
    waitConfirmations: 3,
  });

  await verify(rg.address, [vrfWrapper, linkTest]);
};
