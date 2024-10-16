import { getElement} from "./domUtils.js";
const element = getElement();
import { updateAuthUI } from "./auth.js";

// This function checks if a user if logged in everytime the user is on the homepage, allowing user to reload and move between pages and stay logged in
function logInBlock(){
    let userId = sessionStorage.getItem("userId")
    if(userId === null  || userId === "null"){ 
        element.loggedIn.style.display = "none";
        element.loggedOut.style.display = "inline";
        element.authContainer.style.display = "inline";
    } else {
        let username = sessionStorage.getItem("username")
        updateAuthUI(username)
    }   
}

window.onload = () => { 
    getRuns();
    logInBlock();
}

//Get all Routes from database to present
export function getRuns() {
    fetch('/allRuns')
    .then(res => res.json())
    .then(data => {
        if(data.length === 0){
            console.log("No runs yet")
        } else {
            updateRunUI(data)
            updateUserDashboard(data)
        } 
    })
    .catch(err => console.log("error ", err))
}

// This click event makes sure that user can only submit a run if they have registered and/or logged-in:
element.createRun.addEventListener("click", function(e) {
        if(sessionStorage.getItem("userId") === "null" || sessionStorage.getItem("userId") === null){
            alert("Please log-in or register")
            // Can be changed to a pop-up, nicer looking
    } else {
        window.location.href = '/routes'
    }
})

// This function handles formatting the div content:
function formatRun(data, user){
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

    if (!user){
        let pace = document.createElement("p")
        pace.textContent = `Pace: ${data.pace}`
        newRun.appendChild(pace)

        let start = document.createElement("p")
        start.textContent = `Run starts at: ${data.start}`
        newRun.appendChild(start)

        if(data.meetingpts.length != 0){
            let meetingpts = document.createElement("p")
            meetingpts.innerHTML = `Meeting Point${((data.meetingpts.length === 1)? '': 's')}:`
            let meetingList = document.createElement("ul")
                for(let j = 0; j < data.meetingpts.length; j++){   
                    meetingList.innerHTML += `<li>[${j+1}] : ${data.meetingpts[j]} </li>`
                }
            meetingpts.appendChild(meetingList)
            newRun.appendChild(meetingpts)
        }

        let end = document.createElement("p")
        end.textContent = `Run ends at: ${data.end}`
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
    }
    return newRun;
}

// This function sends the run id and username of the user who wants to join to the database:
function updateRun(run){
    let selectedRun = run._id;
    let userId = sessionStorage.getItem("userId");
    let username = sessionStorage.getItem("username")
    fetch('/newInterest', {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({run: selectedRun, username: username, userId: userId})
    })
    .then(getRuns())
    .catch(err => console.log("error ", err))
}

// This function formats the run to display on the all-runs container on the left hand side of the screen:
function updateRunUI(data){
    element.allRuns.innerHTML = ""; 
    for (let i = 0; i < data.length; i++){
            let joined = false;
            let created = false;
            let newRun = formatRun(data[i], false)

            for (let j = 0; j < data[i].interested.length; j++){
                if (data[i].interested[j].userId === sessionStorage.getItem("userId")){
                    joined = true;
                }
            }

            if (data[i].creator === sessionStorage.getItem("userId")){
                created = true;
            }
            
            if(!joined && !created){
                let joinBtn = document.createElement("button")
                joinBtn.textContent = "Join this run"
                joinBtn.addEventListener("click", function (e) { updateRun(data[i])} )
                newRun.appendChild(joinBtn)
            } else {
                let joinBtn = document.createElement("p")
                newRun.appendChild(joinBtn)
                if (joined){
                    joinBtn.textContent = "You have joined this run"
                } else if (created) {
                    joinBtn.textContent = "You created this run"
                }
            }
            element.allRuns.appendChild(newRun)
        }
}

// This function checks if the user is interested in any of the runs and displays them on their dashboard. It then checks if the user is the creator and displays the run on the dashboard:
function updateUserDashboard(data){
    element.userJoinedRun.innerHTML = "";
    element.userCreatedRun.innerHTML = "";

    for (let i = 0; i < data.length; i++){
        if(data[i].interested.length != 0){
            for (let j = 0; j < data[i].interested.length; j++){
                if (data[i].interested[j].userId === sessionStorage.getItem("userId")){
                    let newRun = formatRun(data[i], true)
                    let profileBtn = document.createElement("button")
                    profileBtn.textContent = "See more on your profile"
                    profileBtn.addEventListener("click", function (e) { window.location.href = '/userpofile' } )
                    newRun.appendChild(profileBtn)
                    element.userJoinedRun.appendChild(newRun)
                }
            }
        }

        if(data[i].creator === sessionStorage.getItem("userId")){
            let newRun = formatRun(data[i], true)
            let profileBtn = document.createElement("button")
            profileBtn.textContent = "See more on your profile"
            profileBtn.addEventListener("click", function (e) { window.location.href = '/userpofile' } )
            newRun.appendChild(profileBtn)
            element.userCreatedRun.appendChild(newRun)
        }
    }
}