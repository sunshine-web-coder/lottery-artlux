  function fixedPoint(number, decimals){
    number = number.toString()
    let reachedDecimals = 0
    let newNumber = "";
    let startCounting = false;
    for(let i = 0; i < number.length; i++){
      if(startCounting){
       reachedDecimals += 1
      if(reachedDecimals > decimals){
          return newNumber;
        }

      }
      if(number.charAt(i) == '.'){
        startCounting = true;
      }

     newNumber += number.charAt(i)
    }
    return newNumber;
}

function secondsToDate(time) {
    let t = parseInt(time);
    let days = Math.floor(t / 86400);
    t = t - days * 86400;
    let hours = Math.floor(t / 3600);
    t = t - hours * 3600;
    let minutes = Math.floor(t / 60);
    t = t - minutes * 60;
    let seconds = t;
    let times = [days, hours, minutes, seconds];
    let times_name = ['d', 'h', 'm', 's'];
    let finalStr = '';
    for (let i = 0; i < times.length; i++) {
      if (times[i] != 0) {
        finalStr +=
          "<b>" + times[i] + '</b>' + times_name[i] + ' ';
      }
    }
    return finalStr;
}

var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
function getDateFromTimeStamp(time) {
    const dayTime = "AM"
    const dates = {
        month: "",
        day : "",
        year : "",
        hour : "",
        minute : "",
        dayTime
    }
    dates.year = new Date(time).getUTCFullYear();
    dates.month = new Date(time).getUTCMonth();
    dates.day = new Date(time).getUTCDate();
    dates.hour = new Date(time).getUTCHours();
    dates.minute = new Date(time).getUTCMinutes();
    if(dates.hour > 12){
        dates.dayTime = "PM"
        dates.hour -= 12
    }
    return dates
}