// Exports all DOM elements for manipulation in auth.js and client.js:
export function getElement() {
  const elements = {
    headerContainer: document.querySelector(".header-container"),
    authContainer: document.getElementById("auth-container"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    btnLogIn: document.getElementById("log-in-main"),
    btnReg: document.getElementById("reg-main"),
    
    userDashboard: document.getElementById("user-dashboard"),
    btnLogOut: document.getElementById("btn-log-out"),
    authContainer: document.getElementById("auth-container"),
    loggedIn: document.getElementById("logged-in"),
    loggedOut: document.getElementById("logged-out"),
    userGreeting: document.getElementById("user-greeting"),
    userCreatedRun: document.getElementById("user-created-container"),
    userJoinedRun: document.getElementById("user-joined-container"),

    createRun: document.getElementById("create-run"),
    allRuns: document.getElementById("all-runs-container"),
    userUpdate: document.querySelector(".user-update")
  };
  return elements;
}

// Export for all relevant profile.html elements for manipulation in profile.js:
export function getProfile() {
  const profile = {
    headerContainer: document.querySelector(".header-container"),
    username: document.getElementById("username"),
    userCreatedRun: document.getElementById("user-created-container"),
    userJoinedRun: document.getElementById("user-joined-container"),
    recommendedRun:document.getElementById("recommendedRun"),
    backHome: document.getElementById("backButton"),
    createRun: document.getElementById("create-run"),
    userCreatedDiv: document.getElementById("usercreatedruns"),
    userInterDiv: document.getElementById("userinterestedruns")
  };
  return profile;
}

