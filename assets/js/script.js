
window.addEventListener('load', async ()=>{
let hasWallet;
let canSign = true;

if(window.ethereum){
    hasWallet = true;
}else{
    alert("Please install metamask");
    return;
}

//elements 
let PotSize = document.getElementById("PotSize")
let prizePot2 = document.getElementById("PrizePot2")
let cakePot = document.getElementById("PrizeCake")
let TillDraw = document.getElementById("tillDraw")
let nextDraw = document.getElementById("next_draw")
let approveBTN = document.getElementById("approveBTN")
let buyBTN = document.getElementById("buyBTN")
let closeWarningMessage = document.getElementById("closeWarning")
let ticketNumberInput = document.getElementById("ticketNumber")
let ticketCounter = document.getElementById("ticketcounter")
let ticketMaxWarning = document.getElementById("ticketmaxWarning")
let currentRound = document.getElementById("currentRound")
let roundDetails = document.getElementById("roundDetails")
let checkWin = document.getElementById("checkWin")
let winMessage = document.getElementById("winMessage")
let rows_all = document.getElementById("rows_all")
let rows_acc = document.getElementById("rows_account")

//Disabling UI when interactin with a contract
const disableUiTx = ()=>{
    approveBTN.style.pointerEvents = "none"
    buyBTN.style.pointerEvents = "none"
    approveBTN.style.opacity = "0.8"
    buyBTN.style.opacity = "0.8"
}

const enableUiTx = ()=>{
    approveBTN.style.pointerEvents = "all"
    buyBTN.style.pointerEvents = "all"
    approveBTN.style.opacity = "1"
    buyBTN.style.opacity = "1"
}

disableUiTx()

// All the below code runs only if we have a provider
//Provider and signers
let provider = new ethers.providers.Web3Provider(window.ethereum); 
let signer;

//Requesting account from metamask
const requestAcc = async ()=>{
    let accounts;
    try{
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    }catch(err){
        alert("user rejected metamask")
    }
    return accounts[0]
}

//Connecting walletj
const connectWallet = async ()=>{
    await requestAcc();
}

//if there is not account (user rejected) then return
let account = await requestAcc()
if(!account) {
    canSign = false
    return;
}

//If account changed 
window.ethereum.on('accountsChanged', async function (accounts) {
    account = accounts[0]
    await updateUserInfoForLottery()
    await updateApproval()
});

//Contracts
let pancakeContract; 
let LotteryContract;
let LotteryToken;
let LT = addresses.TicketToken //LT = lottery token
let wbnb = addresses.wbnb
let busd = addresses.busd
let cake = addresses.cake

//Prices
let LT_Decimals = 18;
let BNB_PER_LT;
let BNB_PER_CAKE;
let BNB_PER_BUSD;
let LT_PER_BUSD;
let BUSD_PER_LT;
let CAKE_PER_LT;
let CAKE_PER_BUSD;
let LT_PER_CAKE;
let currentId;
let intervalhandler;

//Formatting
const parseDec = (value, decimals)=>{
    return ethers.utils.parseUnits(value, decimals) 
}
const formatDec = (value, decimals)=>{
    return ethers.utils.formatUnits(value, decimals) 
}

//Updating configurations
const updateConfigurations = async ()=>{
    console.log("getting data")
    signer = await provider.getSigner(account)
    pancakeContract = new ethers.Contract(addresses.pancakeswap, abis.Pancake, signer)
    LotteryContract = new ethers.Contract(addresses.Lottery, abis.Lottery, signer)
    LotteryToken = new ethers.Contract(addresses.TicketToken, abis.TicketToken, signer)
    currentId = await LotteryContract.currentLotteryId();
    currentRound.innerHTML = currentId
    await updateUI()
}


const updateUI = async ()=>{
    if(account){
        winMessage.innerHTML = "Click to check if you have won this round!"
        checkWin.innerText = "Did i win?"
    }else{
        winMessage.innerHTML = "Connect your wallet <br>to check if you've won!"
        checkWin.innerText = "Connect Wallet"
    }
    await updateUserInfoForLottery()
    await updateLotteryStatus();
    await updateApproval()
    await updateTimers()
    await updateRates();
    await updatePotSizeUI();
}

const updateRates = async ()=>{
    BNB_PER_LT = (await pancakeContract.getAmountsOut(ethers.utils.parseEther("1"), [LT, wbnb]))[1]
    BNB_PER_CAKE = (await pancakeContract.getAmountsOut(ethers.utils.parseEther("1"), [cake, wbnb]))[1]
    BNB_PER_BUSD = (await pancakeContract.getAmountsOut(ethers.utils.parseEther("1"), [busd, wbnb]))[1]
    LT_PER_BUSD = (await pancakeContract.getAmountsOut(BNB_PER_LT, [wbnb, busd]))[1]
    BUSD_PER_LT = (await pancakeContract.getAmountsOut(BNB_PER_BUSD, [wbnb, LT]))[1]
    CAKE_PER_LT = (await pancakeContract.getAmountsOut(BNB_PER_CAKE, [wbnb, LT]))[1]
    CAKE_PER_BUSD = (await pancakeContract.getAmountsOut(BNB_PER_CAKE, [wbnb, busd]))[1]
    LT_PER_CAKE = (await pancakeContract.getAmountsOut(BNB_PER_LT, [wbnb, cake]))[1]
}

const updateTimers = async ()=>{
    let lotteryInfo = await LotteryContract.viewLottery(currentId);
    let currentBlockNumber = await provider.getBlockNumber();
    let currentTimeStamp = (await provider.getBlock(currentBlockNumber)).timestamp;
    const roundStartTime = parseInt(lotteryInfo.startTime.toString())
    const roundEndTime = parseInt(lotteryInfo.endTime.toString())
    const elapsed = currentTimeStamp - roundStartTime;
    let remaining = roundEndTime - currentTimeStamp;
    const elapsed_timeString = secondsToDate(elapsed)
    console.log(roundEndTime.toString())
    if(remaining < 0 ){
        if(lotteryInfo.status == 2 || lotteryInfo.status == 3){
            TillDraw.innerHTML = `<span style="color: orange;">Round Ended!</span>`
        }else if(lotteryInfo.status == 0){
            TillDraw.innerHTML = `<span style="color: orange;">Round is not started yet!</span>`
        }
    }else{
        if(intervalhandler){
            clearInterval(intervalhandler)
        }
        intervalhandler = setInterval(()=>{
            console.log(remaining )
            remaining -= 1
            const remaining_timeString = secondsToDate(remaining - 1)
            TillDraw.innerHTML = `<span>${remaining_timeString}</span><span style="color: #a02fc8;">untill the draw</span>`
        }, 1000)

    }
    const dates = getDateFromTimeStamp(roundEndTime * 1000)
    console.log(dates)
    nextDraw.innerHTML = "<p><span>Next Draw</span> #"+currentId+" | Draw: "+month[dates.month]+" "+dates.day+","+dates.year+", "+(dates.hour < 10 ? "0" + dates.hour : dates.hour)+":"+
    (dates.minute < 10 ? "0" + dates.minute : dates.minute)+" "+dates.dayTime+"</p>"
    roundDetails.innerHTML = "<small>Drawn "+ month[dates.month]+" "+dates.day+","+dates.year+", 0"+(dates.hour < 10 ? "0" + dates.hour : dates.hour)+":"+
    (dates.minute < 10 ? "0" + dates.minute : dates.minute)+" "+dates.dayTime+"</p>" +"</small>"
}

const updateUserInfoForLottery = async ()=>{
    const userInfo = await LotteryContract.viewUserInfoForLotteryId(account, currentId, 0, ethers.constants.MaxUint256)
    ticketCounter.innerHTML = "you currently have " + userInfo[3].toString() + " tickets"
    console.log(userInfo)
    if(userInfo[3] == 100){
        disableUiTx()
        ticketMaxWarning.style.display = "flex"
        return;
    }else{
        console.log("is not ten")
        enableUiTx()
        ticketMaxWarning.style.display = "none"
    }
    console.log(userInfo[3])
}

const updatePotSizeUI = async()=>{
    let lotteryInfo = await LotteryContract.viewLottery(currentId);
    //Settings amounts and volumes in CAKE and BUSD
    const collectedLT = lotteryInfo.amountCollectedInlotteryy
    const collectedLT_BUSD = ethers.utils.formatEther(collectedLT.mul(BUSD_PER_LT).div(ethers.utils.parseUnits("1", LT_Decimals))) 
    const collectedLT_Cake = ethers.utils.formatEther(collectedLT.mul(CAKE_PER_LT).div(ethers.utils.parseUnits("1", LT_Decimals))) 
    PotSize.innerHTML = fixedPoint(collectedLT_BUSD.toString(), 3) + " $"
    prizePot2.innerHTML = fixedPoint(collectedLT_BUSD.toString(), 3) + " $"
    cakePot.innerHTML = "<small>" + fixedPoint(collectedLT_Cake.toString(), 3) + " CAKE </small>"
}

const updateLotteryStatus = async()=>{
    //Lottery status
    let lotteryInfo = await LotteryContract.viewLottery(currentId);
    console.log(lotteryInfo)

    if(lotteryInfo.status != 1){
        approveBTN.style.pointerEvents = "none"
        buyBTN.style.pointerEvents = "none"
        approveBTN.style.opacity = "0.8"
        buyBTN.style.opacity = "0.8"
        closeWarningMessage.style.display = 'flex'
    }else{
        approveBTN.style.pointerEvents = "all"
        buyBTN.style.pointerEvents = "all"
        approveBTN.style.opacity = "1"
        buyBTN.style.opacity = "1"
        closeWarningMessage.style.display = 'none'
    }

    if(lotteryInfo.status == 0){
        closeWarningMessage.innerHTML = "Round is not started yet!"
    }else if(lotteryInfo.status == 2){
        closeWarningMessage.innerHTML = "Round is finished (Lottery closed)"
    }
}

const updateIsWinner = async ()=>{
    let lotteryInfo = await LotteryContract.viewLottery(currentId);
    console.log(lotteryInfo)
    if(lotteryInfo.status != 1){
        
    } 
}


const updateApproval = async ()=>{
    if((await LotteryToken.allowance(account, LotteryContract.address)).toString() != "0"){
        approveBTN.style.display = "none"
    }else{
        approveBTN.style.display = "block"
    }
}

//Contract interactions
const approveTickets = async ()=>{
    console.log("clicked")
    disableUiTx()
    const approveTx = await LotteryToken.approve(addresses.Lottery, ethers.constants.MaxUint256)
    await approveTx.wait(1)
    await updateApproval()
    enableUiTx()
}

const buyTickets = async ()=>{
    disableUiTx()
    const numberToBuy = parseInt(ticketNumberInput.value)
    console.log(numberToBuy)
    let tickets = []
    for(let i = 0; i < numberToBuy; i++){
        tickets.push(1000000)
    }
    const buyTicketTx = await LotteryContract.buyTickets(currentId, tickets)
    await buyTicketTx.wait(1)
    await updateUserInfoForLottery()
    await updatePotSizeUI()
    enableUiTx()
}

const handleCheckWinWallet = async ()=>{
    if(await connect()){
        let lotteryInfo = await LotteryContract.viewLottery(currentId);
        console.log(lotteryInfo)
        if(lotteryInfo.status == 0){
           return alert("Round is not started yet!") 
        }else if(lotteryInfo.status == 1){
            return alert("Round is not finished yet!")
        }
    }
}

let accountHistory = []

const showAllHistory = async()=>{
    let currentId = await LotteryContract.currentLotteryId()
    console.log("current id is " + currentId)
    let roundInfo;
    let userInfo;
    for(let i = 1; i < parseInt(currentId.toString()) + 1; i++){
        let addForUser = false
        let rowElement = document.createElement("tr")

        roundInfo = await LotteryContract.viewLottery(currentId);
        userInfo = await LotteryContract.viewUserInfoForLotteryId(account, currentId, 0, ethers.constants.MaxUint256);

        if(userInfo[3].toString() != "0"){
            addForUser = true;
        }

        let thElement = document.createElement("th")
        thElement.scope = "row"
        thElement.innerText = i
        let PotSize = document.createElement("td")
        let WinnerNumber = document.createElement("td")
        let EndTime = document.createElement("td")
        let Status = document.createElement("td")
        //Pot size
        const collectedLT = roundInfo.amountCollectedInlotteryy
        const collectedLT_BUSD = ethers.utils.formatEther(collectedLT.mul(BUSD_PER_LT).div(ethers.utils.parseUnits("1", LT_Decimals))) 
        const collectedLT_Cake = ethers.utils.formatEther(collectedLT.mul(CAKE_PER_LT).div(ethers.utils.parseUnits("1", LT_Decimals))) 
        PotSize.style.color = "orange"
        PotSize.innerHTML = fixedPoint(collectedLT_BUSD.toString(), 3) + " $"

        //Winner
        WinnerNumber.innerHTML = roundInfo.finalNumber

        //EndTime
        const roundEndTime = parseInt(roundInfo.endTime.toString())
        const dates = getDateFromTimeStamp(roundEndTime * 1000)
        EndTime.innerHTML = month[dates.month]+" "+dates.day+","+dates.year+", "+(dates.hour < 10 ? "0" + dates.hour : dates.hour)+":"+
        (dates.minute < 10 ? "0" + dates.minute : dates.minute)+" "+dates.dayTime+"</p>"

        //Status
        let statuses = ["Pending", "Open", "Closed", "Claimable"]
        let colors = ["Orange", "blue", "red", "green"]
        Status.style.color = colors[roundInfo.status]
        Status.innerHTML = statuses[roundInfo.status]

        //Appending the row to table
        rowElement.appendChild(thElement)
        rowElement.appendChild(PotSize)
        rowElement.appendChild(WinnerNumber)
        rowElement.appendChild(EndTime)
        rowElement.appendChild(Status)
        rows_all.appendChild(rowElement)
        if(addForUser){
            rows_acc.appendChild(rowElement.cloneNode(true))
        }
    }
}

const showYourHistory = ()=>{

}

await updateConfigurations()

//Adding event listeners
approveBTN.addEventListener('click', approveTickets)
checkWin.addEventListener('click', handleCheckWinWallet)
buyBTN.addEventListener('click', buyTickets)
enableUiTx()
showAllHistory()
})



