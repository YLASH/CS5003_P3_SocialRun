// 1. Get the DOM elements:
import { getProfile } from "./domUtils.js";
const profile = getProfile();
const createRunBut = document.getElementById("create-run")

// 2. Constant to match the weathercode to weatherDescriptions
const weatherDescriptions = { 0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Depositing rime fog",
                             51: "Drizzle - Light", 53: "Drizzle - Moderate", 55: "Drizzle - Dense", 56: "Freezing Drizzle - Light", 57: "Freezing Drizzle - Dense", 
                             61: "Slight Rain", 63: "Moderate", 65: "Heavy Rain", 66: "Light Freezing Rain", 67: "Heavy Freezing Rain", 
                             71: "Slight Snowfall", 73: "Moderate Snowfall", 75: "Heavy Snowfall", 77: "Snow grains", 
                             80: "Slight Rain showers", 81: "Moderate Rain showers", 82: "Violent Rain showers", 85: "Snow showers - Slight", 86: "Snow showers - Heavy" }; 

// 3. Create empty, local array:
let creat_rout =[]
let interested_rout = []
let usertotalevent = []

// A. User location 
// We are assuming we have the user's location when they register in future development - currently sets the default location to London
var l_lat = 51.5
var l_lng = -0.118092

// B. User greeting
// Display all runs on load of the page and greets the user using their username:
window.onload = () => { 
    let username = sessionStorage.getItem("username")
    profile.username.textContent = `Hello ${username}`;
    getRuns()
}

// C. Buttons - directs to homepage and create a run page:
profile.backHome.addEventListener("click", function (e) { window.location.href = "/"})
profile.createRun.addEventListener("click", function (e) { window.location.href = '/routes' })

// Function fetches all runs everytime the page loads, and uses the data for all interactive content:
function getRuns() {
    fetch('/allRuns')
    .then(res => res.json())
    .then(data => {
        if(data.length === 0){
            console.log("No runs yet")
        } else {
            data.sort((a,b)=>{
                const dateA = new Date(a.date); 
                const dateB = new Date(b.date); 
                if (dateA < dateB) return -1; 
                if (dateA > dateB) return 1; 
                return 0; 

            })
            console.log(data),
            todayWeather(data),
            interested_rout = getInteresedruns(data),
            creat_rout = getCreatedruns(data),
            usertotalevent = gettotalevent(creat_rout,interested_rout)
            displayUserCreated(creat_rout),
            displayUserInterested(interested_rout),
            displayeventWeather(usertotalevent),
            computeStatisticsAndDrawChart(interested_rout, creat_rout),
            prepareDataForChart(interested_rout, creat_rout),
            computeMonthRuns(interested_rout, creat_rout),
            predictFutureRuns(creat_rout,interested_rout)
        } 
    })
    .catch(err => console.log("error ", err))
}


// Function formats all runs to be displayed:
 function formatRun(data){
    let newRun = document.createElement("div")
    newRun.classList.add("run-container")

    let title = document.createElement("p")
    title.textContent = `${data.title}`
    newRun.appendChild(title)

    let date = document.createElement("p")
    date.textContent = `Date: ${data.date}`
    newRun.appendChild(date)

    let time = document.createElement("p")
    time.textContent = `Time: ${data.time}`
    newRun.appendChild(time)

    let distance = document.createElement("p")
    distance.textContent = `Distance: ${data.distance}`
    newRun.appendChild(distance)

    let pace = document.createElement("p")
    pace.textContent = `Pace: ${data.pace}`
    newRun.appendChild(pace)

    let start = document.createElement("p")
    
    if(data.start.includes("Lat")&&data.start.includes("Lng")){
        var latitude = parseFloat(data.start.split(' ')[1]).toFixed(2)
        var longituge = parseFloat(data.start.split(' ')[3]).toFixed(2)
        start.textContent =`Run starts at: ( lat:${latitude}, lng:${longituge})`
    }else{start.textContent =`Run starts at: ${data.start}`}
    
    newRun.appendChild(start)

    if(data.meetingpts.length != 0){
        let meetingpts = document.createElement("p")
        meetingpts.innerHTML = `Meeting Point${((data.meetingpts.length === 1)? '': 's')}:`
        let meetingList = document.createElement("ul")
        for(let j = 0; j < data.meetingpts.length; j++){
            if(data.meetingpts[j].includes("Meeting Point")){
                meetingList.innerHTML += `<li>${data.meetingpts[j]} </li>`
            }else{
                meetingList.innerHTML += `<li>[${j+1}] : ${data.meetingpts[j]} </li>`
            }         
           
        }
        meetingpts.appendChild(meetingList)
        newRun.appendChild(meetingpts)
    }

    let end = document.createElement("p")
    if(data.end.includes("Lat")&&data.end.includes("Lng")){
        var latitude = parseFloat(data.end.split(' ')[1]).toFixed(2)
        var longituge = parseFloat(data.end.split(' ')[3]).toFixed(2)
        end.textContent =`Run sends at: ( lat:${latitude}, lng:${longituge})`
    }else{end.textContent =`Run ends at: ${data.end}`}
    newRun.appendChild(end)

    let description = document.createElement("p")
    description.textContent = `Description: ${data.description}`
    newRun.appendChild(description)

    let runnerList = document.createElement("p")
    if(data.interested.length != 0){
        runnerList.textContent = "Runners interested in this run: "
        for (let j = 0; j < data.interested.length; j++){
            if (data.interested[j].userId === sessionStorage.getItem("userId")){
                runnerList.textContent += `You${((data.interested.length === j+1)? '.': ', ')} `;          
            } else {
                runnerList.textContent += `${data.interested[j].username}${((data.interested.length === j+1)? '.': ', ')} `;
            }
        }
    } else {
        runnerList.textContent = "No one is interested in this run yet.";
    }    
    newRun.appendChild(runnerList)

    return newRun;
 }

// D. Personalisation and data visualisation:
const daily_data = document.getElementById("date_data_display")
let  currentDate = new Date()
const options = { weekday: 'short', 
                   month: 'short', // Abbreviated month name (e.g., "Apr") 
                   day: '2-digit' // Day of the month with leading zeros (e.g., "03") 
                }; const formattedDate = currentDate.toLocaleDateString('en-US', options)
const formatDate = currentDate.toLocaleDateString('en-US',options) 
const today =`${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}`
daily_data.innerHTML = `<h4>Your location (London) </h4> <p> ${formatDate}</p>  `


// This functions filters the run the user has joined and adds them to array interested_rout
function getInteresedruns(data){
    data.forEach((i)=>{
        i.interested.forEach((j)=>{
            if(j.userId===sessionStorage.getItem("userId")) {
                  if(!interested_rout.includes(i)){
                        interested_rout.push(i)
                    }
            }
            //interested_rout.push(i._id)
        })
    })
    return interested_rout
}

// This functions filters the run the user has created and adds them to array creat_rout
function getCreatedruns(data){
    data.forEach((i)=>{
        if(i.creator === sessionStorage.getItem("userId")){
            creat_rout.push(i)
        }  
    })

    return creat_rout
}

// This function combines data of the user created and interested routes:
function gettotalevent(creat_rout,interested_rout){

    for(let i =0;i<creat_rout.length;i++){
        usertotalevent.push(creat_rout[i])
    }
    for(let i =0;i<interested_rout.length;i++){
        usertotalevent.push(interested_rout[i])
    }
    usertotalevent.sort((a,b)=>{
            const dateA = new Date(a.date); 
            const dateB = new Date(b.date); 
            if (dateA < dateB) return -1; 
            if (dateA > dateB) return 1; 
            return 0; 
        })
    //console.log(usertotalevent)
    return usertotalevent
    
}

// This function displays all route the user has created; if no run has been created, it feedbacks to the user who can click Create a Run:
function displayUserCreated(creat_rout){
    const created_display = document.getElementById("user-created-container")


    if(creat_rout.length == 0){
        created_display.innerHTML +=`<p>You have not created a run yet.</p>`
        profile.createRun.addEventListener("click", function (e) { window.location.href = '/routes' })
    }else{
        creat_rout.forEach((i)=>{
                    let newRun = formatRun(i)
                    profile.userCreatedRun.appendChild(newRun)
                })
    }
}

// This function displays all route the user is interested in; if no run has been joined a message is shows
function displayUserInterested(interested_rout){
    const interested_display = document.getElementById("user-joined-container")
    while (interested_display.firstChild) {    
        interested_display.removeChild(interested_display.firstChild); }

    if(interested_rout.length == 0){
        let noInterestMsg = document.createElement("p")
        noInterestMsg.textContent = "Not joined a run yet? You can join run on the homepage."
        profile.userInterDiv.appendChild(noInterestMsg)
        // interested_display.innerHTML +=`<p> Don't you join any runs?? ==> Let's get you some recommend </p>`
    }else{
        console.log(interested_rout)
        interested_rout.forEach((i)=>{
                    let newRun = formatRun(i)
                    interested_display.appendChild(newRun)
                })
    }
}


// This function displays the weather forecast for this week 
async function todayWeather(data) {
    try{
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${l_lat}&longitude=${l_lng}&hourly=cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`);
        const weatherData = await response.json();
    
            //console.log(l_lat,l_lng)
            ///display in table ,create the table 
            let table = `<table style="border: 1px solid black;"> <tr>`
            weatherData.daily.time.forEach((i)=>{
                table += `<td>${i}</td>`
            })
            table += `</tr><tr>`
            weatherData.daily.weather_code.forEach((i)=>{
               //match icon
                if(i<5){
                    var img_cod = `0${i+1}d`
                }else if(i>40 && i<50){
                    var img_cod = `50d`
                }else if(i>50 && i<60 ){
                    var img_cod = `09d`
                }else if(i> 60&& i<=65){
                    var img_cod = `10d`
                } else if(i>65 && i<80){
                        var img_cod = `13d`
                }else {
                    var img_cod = `09d`
                }
                var predicted= weatherDescriptions[parseInt(i)];
                table += `<td><img src='https://openweathermap.org/img/wn/${img_cod}@2x.png'>${predicted}</td>`
            })
            table += `</tr><tr>`
            for(let i =0;i<7;i++){
                let temp_sum = `${weatherData.daily.temperature_2m_max[i]} /${weatherData.daily.temperature_2m_min[i]} ${weatherData.daily_units.temperature_2m_max}`
                table += `<td>${temp_sum}</td>`
            }
            table += `</tr><tr>`

            //console.log(table)
            daily_data.innerHTML += table

    if (!response.ok) {
        alert('Failed to fetch weather data: ' + weatherData.message);
    }
    
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }

}
    
// This function displays weather information: get coming event and show its predicte weather (only get predicte in a week). Other show the weather (current at that location ) 
async function displayeventWeather(data) {
    var temp_sum,predicted
    const coming_display= document.getElementById("comingevent")
    const history_display= document.getElementById("history")   


    data.forEach((d)=>{ 
        const eventdate = new Date(d.date)
        const timediff = eventdate.getTime()-currentDate.getTime()
        const daydiff = Math.ceil(timediff/(1000*3600*24))
        //console.log(daydiff)
        
        //check the event in a week 
        if(daydiff>=0 && daydiff <= 7){

            // console.log("In the next 7 days")
            if(d.start.includes("Lat")&&d.start.includes("Lng")){
                let splitstart = d.start.split(/[:,]/)
                let latIndex =splitstart.indexOf("Lat")
                let lngIndex =splitstart.indexOf(" Lng")
                var lat = latIndex !==-1 ?parseFloat(splitstart[latIndex+1]).toFixed(3):null;
                var lng = lngIndex !==-1 ?parseFloat(splitstart[lngIndex+1]).toFixed(3):null;
                var localweatherData = getWeather(lat,lng)
                    localweatherData.then((data)=>{
                        
                    temp_sum = `${data.daily.temperature_2m_max[daydiff]} /${data.daily.temperature_2m_min[daydiff]} ${data.daily_units.temperature_2m_max}`
                        //console.log(temp_sum )
                    let i = data.daily.weather_code
                        if(i<5){
                            var img_cod = `0${i+1}d`
                        }else if(i>40 && i<50){
                            var img_cod = `50d`
                        }else if(i>50 && i<60 ){
                            var img_cod = `09d`
                        }else if(i> 60&& i<=65){
                            var img_cod = `10d`
                        } else if(i>65 && i<80){
                                var img_cod = `13d`
                        }else {
                            var img_cod = `09d`
                        }
                        var code = parseInt(data.daily.weather_code[daydiff])
                        predicted= weatherDescriptions[code];
                        const furture_display = document.getElementById("furture")
                       // furture_display.innerHTML +=` ${d.date} ${d.title}_ local weather of the day: ${temp_sum} ${predicted}   <img wdith ="40" height="40" src='https://openweathermap.org/img/wn/${img_cod}@2x.png'>`
                        coming_display.innerHTML +=`<p class="event-item">${d.date} ${d.title}  weather of the day: ${temp_sum} ${predicted}<img wdith ="50" height="50" src='https://openweathermap.org/img/wn/${img_cod}@2x.png'> </p>`
                    })
                }else{
                    //UNSolve "String" to convert to Lan/Lng issue  (or sreach by ciytname (beed ctiryname))
                    temp_sum  = `Max/Min °C`
                    predicted = `loading... looking for forecast`
                    coming_display.innerHTML +=`<ul> <li> ${d.date} ${d.title}  <br>
                                    local weather(now) : ${temp_sum} ${predicted}`
                }
                

        }else if(daydiff<0){
        //the event was past event 
            history_display.innerHTML+=`<p>${d.date} ${d.title} </p>`
            // console.log("past/history")

        }else{
            //check the event far from a week 
            //other show the weather (current at that location ) 
            //only able to show the localtion with coordinate
            console.log("Furture")     
            if(d.start.includes("Lat")&&d.start.includes("Lng")){
                let splitstart = d.start.split(/[:,]/)
                let latIndex =splitstart.indexOf("Lat")
                let lngIndex =splitstart.indexOf(" Lng")
                var lat = latIndex !==-1 ?parseFloat(splitstart[latIndex+1]).toFixed(3):null;
                var lng = lngIndex !==-1 ?parseFloat(splitstart[lngIndex+1]).toFixed(3):null;
                

                // var lat = parseFloat(d.start.split(' ')[1]).toFixed(3)
                // var lng = parseFloat(d.start.split(' ')[3]).toFixed(3)
                //console.log(lat, lng)
                var localweatherData = getWeather(lat,lng)
            
                localweatherData.then((data)=>{
                    //console.log(data) 
                    temp_sum = `${data.daily.temperature_2m_max[0]} /${data.daily.temperature_2m_min[0]} ${data.daily_units.temperature_2m_max}`
                    //console.log(temp_sum )
                    var code = parseInt(data.daily.weather_code[0])
                    predicted= weatherDescriptions[code];
                   // coming_display.innerHTML +=`>> ${d.date} ${d.title}_current Weahter : ${temp_sum} ${predicted} <br> `
                })
            }else{
                        temp_sum  = `Max/Min °C`
                        predicted = `loading... looking for forecast`
                  //      coming_display.innerHTML +=`>> ${d.date} ${d.title}_current Weahter : ${temp_sum} ${predicted} <br> `
                }
                
        }

        })

}



// This function fetches the weather from external API open-meteo:
async function getWeather(lat,lng){
    try { 
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`);
        const locweatherData = await response.json();
       // console.log(locweatherData)
        return locweatherData; 
        if (!response.ok) {
                alert('Failed to fetch weather data: ' + weatherData.message);
            }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

//-----------------------------------
// E. Recommendation algorithm: /gives summary statistics of the user's joined/interested runs. This is also used when recommending a run to the user
function summaryStatistics (runsArray) {
    let currentUserId = sessionStorage.getItem("userId");
    let totalRuns = 0;
    let totalDistance = 0;
    let minDistance = Infinity;
    let maxDistance = 0;
    let avgDistance = 0;

    let summaryData = { "totalRuns" : totalRuns,
                    "totalDistance" : totalDistance,
                    "minDistance" : minDistance,
                    "maxDistance" : maxDistance,
                    "avgDistance" : avgDistance}

    for (let run of runsArray) {          
        let thisRunDistance = run.distance;
        if (typeof thisRunDistance === 'string') {
            thisRunDistance = Number(thisRunDistance.replace(/[^0-9\.]+/g,""));
        }         
        for (let signedUpUser of run.interested) {
        if (signedUpUser) {
            if ((currentUserId) && (signedUpUser.userId.includes(currentUserId))) {
                    totalRuns++;
                    totalDistance+= thisRunDistance;
                    console.log('thisRunDistance: ', thisRunDistance);
                    if (thisRunDistance < minDistance) {minDistance = thisRunDistance;}
                    if (thisRunDistance > maxDistance) {maxDistance = thisRunDistance;}
                }
            }
        }            
    } 
    if (totalRuns==0) {avgDistance=0;}
    if (minDistance==Infinity) {minDistance=0;}
    else {avgDistance = totalDistance / totalRuns;}
    summaryData.totalRuns = Number(totalRuns.toFixed(2));
    summaryData.totalDistance = Number(totalDistance.toFixed(2));
    summaryData.minDistance = Number(minDistance.toFixed(2));
    summaryData.maxDistance = Number(maxDistance.toFixed(2));
    summaryData.avgDistance = Number(avgDistance.toFixed(2));
   
    return summaryData;
} 

// Recommends a run based on the user's existing runs (by average distance):
function recommendRunByAverageDistance (runsArray) {
    let currentUserId = sessionStorage.getItem("userId");
    let targetDistance = summaryStatistics(runsArray).avgDistance;
    let smallestDiffOfDistance = Infinity;
    let signedUpRuns = 0;
    let recommendedRun = undefined;
    // For each run, compute for the difference in the target distance and the current smallest difference of distance
    // Also check if the user has already signed up for the run
    for (let run of runsArray) {
        let thisRunDistance = run.distance;
            if (typeof thisRunDistance === 'string') {
                thisRunDistance = Number(thisRunDistance.replace(/[^0-9\.]+/g,""));
            }
        let thisDiffOfDistance = Math.abs(thisRunDistance - targetDistance);
        let joinedRunBool = [];
        for (let signedUpUser of run.interested) {
            let alreadySignedUp = signedUpUser.userId.includes(currentUserId);
            joinedRunBool.push(alreadySignedUp);
            // If the difference to the target distance is the smallest and the run is not yet in the user's profile,
            // Then it becomes the recommended run.
        }
            if (joinedRunBool.includes(true)) {
                signedUpRuns++;
            }
            else if (!(joinedRunBool.includes(true)) && (thisDiffOfDistance < smallestDiffOfDistance)) {
                    recommendedRun = run;
                    smallestDiffOfDistance = thisDiffOfDistance;
                    }
                }
    // if the user has not signed up to any runs, return error code -1
    if (signedUpRuns == 0) { return -1;}
    // if the user has already signed up to all runs, return error code -2
    if (signedUpRuns == runsArray.length) {return -2;}
    // else, return the recommended run
    else {return recommendedRun};
    }

// This gives the recommended run on button click
async function updateRecommendedRun(){
    //profile.recommendedRun.textContent = '';
    let data = await fetch('/allRuns');
    data = await data.json();
    //console.log(data)
    let recommendation = recommendRunByAverageDistance(data);
    if (recommendation == -1) {
        let recommendationText = document.createElement("p");
        recommendationText.textContent = "You haven't signed-up to any runs yet! Sign up to a few runs so we can recommend something for you.";
        profile.recommendedRun.appendChild(recommendationText);
    }

    else if (recommendation == -2) {
        let recommendationText = document.createElement("p");
        recommendationText.textContent = "You've signed up to all the runs! There are no more runs to recommend.";
        profile.recommendedRun.appendChild(recommendationText);
    }
    else {
    let myRecommendedRun = formatRun(recommendation);
    profile.recommendedRun.appendChild(myRecommendedRun);
    let joinBtn = document.createElement("button")
    joinBtn.setAttribute("id", "recommend-join-btn");
    joinBtn.textContent = "Join this run"
    joinBtn.addEventListener("click", function (e) { updateRun(recommendation)} )
    profile.recommendedRun.appendChild(joinBtn)
    }
}

// Add event listener to the button. For some reason, adding this directly to index.html does not work    
let recommendRunButton = document.getElementById("recommend-run-button");
recommendRunButton.addEventListener("click", updateRecommendedRun);
   


// This function sends the run id and username of the user who wants to join to the database. This is same function as in client.js.
function updateRun(run){
    let joinBtn = document.getElementById("recommend-join-btn");
    joinBtn.innerText = "You have joined this run!"
    joinBtn.disabled = true;
    let selectedRun = run._id;
    let userId = sessionStorage.getItem("userId");
    let username = sessionStorage.getItem("username")

  
    fetch('/newInterest', {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({run: selectedRun, username: username, userId: userId})
    })
    fetch('/allRuns')
    .then(res => res.json())
    .then(data => {
        if(data.length === 0){
            console.log("No runs yet")
        } else {
            data.sort((a,b)=>{
                const dateA = new Date(a.date); 
                const dateB = new Date(b.date); 
                if (dateA < dateB) return -1; 
                if (dateA > dateB) return 1; 
                return 0; 

            })
        }
            
            interested_rout = getInteresedruns(data),
            displayUserInterested(interested_rout)
    })
    .catch(err => console.log("error ", err))
    }



//------------------------------------------------------------------------------------------------
// This function provides the Analysis and Visualisation Chart
function computeStatisticsAndDrawChart(interested_rout, creat_rout) {
    const totalJoinedRuns = interested_rout.length;
    const totalCreatedRuns = creat_rout.length;
 
    // Draw pie chart:
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Joined Runs', 'Created Runs'],
            datasets: [{
                label: 'Number of Runs',
                data: [totalJoinedRuns, totalCreatedRuns],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1
            }]
        },
    });
}



function computeMonthRuns(interested_rout, creat_rout) {
    // Prepare data for chart:
    const data = prepareDataForChart(interested_rout, creat_rout);

    // Draw chart:
    drawChart(data);
}


// Data Clearing for Line chart: 
function prepareDataForChart(interested_rout, creat_rout) {
    // Prepare data for chart
    const joinedRunsData = processData(interested_rout,'joined');
    const createdRunsData = processData(creat_rout, 'created');

    // Combine data:
    const combinedData = combineData(joinedRunsData, createdRunsData);
    function combineData(joinedRunsData, createdRunsData) {
        // Combine joined and created runs data:
        const combinedData = [];
        for (let i = 0; i < 12; i++) {
            const monthData = {
                month: i,
                joinedRuns: joinedRunsData[i] || 0,
                createdRuns: createdRunsData[i] || 0
            };
            combinedData.push(monthData);
        }
        return combinedData;
    }

    return combinedData;
}

function processData(runs, type) {
    // Process runs data to get count for each month:
    const processedData = {};
    if (type === 'created') {
        runs.forEach(run => {
           //creadeddate
            const month = new Date(run.date).getMonth();
           // console.log(month)
            if (!processedData[month]) {
                processedData[month] = 1;
            } else {
                processedData[month]++;
            }
        });
    } else if (type === 'joined') {
        runs.forEach(run => {
            //creadeddate
            const month = new Date(run.date).getMonth();
            //console.log(month)
            if (!processedData[month]) {
                processedData[month] = 1;
            } else {
                processedData[month]++;
            }
        });
    }
    return processedData;
    
}


// This function draws the Line Chart:
function drawChart(data) {
    const ctx = document.getElementById('monthChart').getContext('2d');
    const monthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
                label: 'Joined Runs',
                data: data.map(entry => entry.joinedRuns),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false
            }, {
                label: 'Created Runs',
                data: data.map(entry => entry.createdRuns),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


// Predict Bar Chart (Algorithm)  
function predictFutureRuns(createdRuns, joinedRuns) {
    // Get current date
    const currentDate = new Date();

    // Calculate start date for prediction (3 months ago)
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 3);

    // Filter runs created and joined in the last 3 months
    const filteredCreatedRuns = createdRuns.filter(run => new Date(run.date) >= startDate);
    const filteredJoinedRuns = joinedRuns.filter(run => new Date(run.date) >= startDate);

    // Calculate average created runs per month
    const averageCreatedRunsPerMonth = filteredCreatedRuns.length / 3;

    // Calculate average joined runs per month
    const averageJoinedRunsPerMonth = filteredJoinedRuns.length / 3;

    // Predict future runs for the next 12 months
    const predictedCreatedRuns = [];
    const predictedJoinedRuns = [];
    for (let i = 1; i <= 12; i++) {
        const predictedCreated = Math.round(averageCreatedRunsPerMonth * i);
        const predictedJoined = Math.round(averageJoinedRunsPerMonth * i);
        predictedCreatedRuns.push(predictedCreated);
        predictedJoinedRuns.push(predictedJoined);
    }
    
    // Draw chart for predicted runs
    drawPredictedRunsChart(predictedCreatedRuns, predictedJoinedRuns);
}


//Draw Predict Bar Chart 
function drawPredictedRunsChart(predictedCreatedRuns, predictedJoinedRuns) {
    const ctx = document.getElementById('predictedRunsChart').getContext('2d');
    const predictedRunsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Predicted Created Runs',
                    data: predictedCreatedRuns,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Predicted Joined Runs',
                    data: predictedJoinedRuns,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
