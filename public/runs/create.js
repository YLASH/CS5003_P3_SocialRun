// This function gets all the relevant html elements:
function getRunDetails(){
    const runDetails = {
      title: document.getElementById("title"),
      dateTime: document.getElementById("dateTime"),
      description: document.getElementById("description"),
      start: document.getElementById("startingPoint"),
      end: document.getElementById("endPoint"),
      route: document.getElementById("route"),
      meeting: document.getElementById("meetingPoints"),
      distance: document.getElementById("distance"),
      pace: document.getElementById("pace"),
      submit: document.getElementById("submit"),
      cancel: document.getElementById("cancel")
    };
    return runDetails;
  }
let runDetails = getRunDetails()

// This function formats the form information from their value in the form to be sent out as JSON to the server, then the database:
function formatValue(){
  let dateTime = runDetails.dateTime.value
  // Separate date and time into two for readability:
  dateTime = dateTime.split("T")
  let date = dateTime[0]
  let time = dateTime[1]
  
  // Splits each meeting points by ";" and adds as an array:
  let meetingPoints = []
  if(runDetails.meeting.value.indexOf(";") != -1){
    let newPoint = runDetails.meeting.value;
    newPoint = newPoint.split(";")
    for(let i = 0; i < newPoint.length -1; i++){
      meetingPoints.push(newPoint[i])
    }
  } else {
    meetingPoints.push(runDetails.meeting.value)
  }

  console.log(meetingPoints)
  
  // This format mirrors the format in which the runs will be stored in the database:
  let run = {
      title: runDetails.title.value,
      date: date,
      time: time,
      description: runDetails.description.value,
      start: runDetails.start.value,
      end: runDetails.end.value,
      route: runDetails.route.value,
      meeting: meetingPoints,
      distance: runDetails.distance.value,
      pace: runDetails.pace.value,
      creator: sessionStorage.getItem("userId")
  }
  return run
}

// This function formats a success message and allows user to go back to homepage
function submitMessage(){
  let successMsg = document.getElementById("submit-success")
  successMsg.style.display = "block"
  runDetails.submit.style.display = "none"
  runDetails.cancel.style.display = "none"
  let message = document.createElement("p")
  message.textContent = "Run successfully submitted!"
  let returnBtn = document.createElement("button")
  returnBtn.textContent = "Return to Homepage"
  successMsg.appendChild(message)
  successMsg.appendChild(returnBtn)

  returnBtn.addEventListener("click", function(e) { 
    successMsg.style.display = "none"
    runDetails.submit.style.display = "inline"
    runDetails.cancel.style.display = "inline"
    window.location.href = '/' })
}

// On click event format the form values and sends them to server, then it logs a success message and allows user to go back to homepage
runDetails.submit.addEventListener("click", function (e) {
    let run = formatValue();
    console.log("New run submitted:", run)

    fetch('/newRun', {
      method: "POST",
      headers: {"Content-type": "application/json"},
      body: JSON.stringify(run)
  })
  .catch(err => console.log("error", err))

  submitMessage()
});

// On click event voids the current form, so nothing is kept in browser cookies, and redirects to homepage
runDetails.cancel.addEventListener("click", function (e) {
    runDetails.title.value = "";
    runDetails.dateTime.value = "";
    runDetails.description.value = "";
    runDetails.start.value = "";
    runDetails.end.value = "";
    runDetails.route.value = "";
    runDetails.meeting.value = "";
    runDetails.distance.value = "";
    runDetails.pace.value = "";
    window.location.href = "/"
});