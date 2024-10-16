// 1. Get the DOM elements
import { getElement } from "./domUtils.js";
const element = getElement();
import { getRuns } from "./client.js";

// This click event gets the value of the username and password fields, and passes them on userReg() function for registration
element.btnReg.addEventListener("click", function (e) {
  e.preventDefault();
  const username = element.username.value;
  const password = element.password.value;
  userReg(username, password);
});

// This click event gets the value of the username and password fields, and pases them on userLogIn() function for log in
element.btnLogIn.addEventListener("click", function (e) {
  e.preventDefault();
  const username = element.username.value;
  const password = element.password.value;
  userLogIn(username, password);
});

// Function takes username and password and sends them to the server to check for registration
// It displays relevant error messages as alert to ther user
// Once the user is successfully registered, it updated sessionStorage items for userId and username 
function userReg(username, password) {
  fetch("/api/user/reg", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  .then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        alert(data.authInfo || "API response Error");
        throw new Error(data.authInfo || "API response Error");
      });
    } else {
      return res.json();
    }
  })
  .then((data) => {
    console.log("User registered:", data);
    if (data.authInfo === "registered successfully") {
      sessionStorage.setItem("userId", data.userId) // can change to localStorage if needed
      sessionStorage.setItem("username", data.username) 
      updateAuthUI(data.username);
    }
  })
  .catch((err) => {
    console.error("Error:", err.message);
  });
}

// Function takes username and password and sends them to the server to check for login
// It displays relevant error messages as alert to ther user
// Once the user is successfully logged in, it updated sessionStorage items for userId and username 
function userLogIn(username, password) {
  fetch("/api/user/login", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  .then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        alert(data.authInfo || "API response Error");
        throw new Error(data.authInfo || "Api response Error");
      });
    } else {
      return res.json();
    }
  })
  .then((data) => {
    console.log("User logged in:", data);
    if (data.authInfo === "login successfully") {
      sessionStorage.setItem("userId", data.userId) // can change to localStorage if needed
      sessionStorage.setItem("username", data.username) 
      updateAuthUI(data.username);
    }
  })
  .catch((err) => {
    console.error("Error:", err.message);
  });
}

// Function updates the front end hides the login and register buttons and shows the log out button, and updates teh name display to be the username
// When the user logs out, the display is reversed and resets sessionStorage for username and userId to be null
export function updateAuthUI(username) {
  element.userUpdate.classList.remove("display");

  element.userGreeting.textContent = `Hello ${username}`;
  element.loggedIn.classList.remove("hidden");
  // element.loggedIn.style.display = "inline";
  // element.loggedOut.style.display = "none";
  element.authContainer.style.display = "none";
  getRuns();

  element.btnLogOut.addEventListener("click", function (e) {
    sessionStorage.setItem("userId", null);
    sessionStorage.setItem("username", null);
    element.userGreeting.textContent = ``;
    element.loggedIn.classList.add("hidden");
    // element.loggedIn.style.display = "none";
    // element.loggedOut.style.display = "inline";
    element.authContainer.style.display = "inline";
    element.userUpdate.classList.add("display");
    getRuns();
    console.log("User logged out");
  })
};
