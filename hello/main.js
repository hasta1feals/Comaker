

function login() {
  // Fetch data from html
  data = {
    password: getValue("password1"),
    username: getValue("email1"),
  };
  // Submit data to API

  api("login", "POST", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie
      setCookie("token", res.token, 365);
      console.log("het is gelukt")
      console.log(res.token)
      getUsers();
      // showPage("dashboardPage");
    } else {
      alert("Credentials are incorrect");
    }
  });
}


async function createPost() {
 const data = {
    password: getValue("password"),
    username: getValue("title1"),
    name: getValue("name")

  };

  api("register", "POST", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie
     
      console.log("het is gelukt")
    
  
    } else {
      alert("Credentials are incorrect");
    }
  });
}


function register(e) {
  // Fetch data from html
  data = {
    password: getValue("password"),
    username: getValue("title1"),
    name: getValue("name")

  };
  // Submit data to API

  api("register", "POST", data).then((res) => {
    if (res.message == "success") {
    
      // Save the received JWT in a cookie
      console.log("het is gelukt")
      getUsers();
      return false
    } else {
      alert("you left something empty");
      return falseS
    }
  });
  return false;
}


//after login you can load in the users stuff
function getUsers() {

}





function Userinfo() {

  api("secure").then((res) => {
    if (res.message == "success") {
      console.log(res.decoded.user)
    }

  });

}
//you can add all the buttons you want to connect to the api or button functions
document.addEventListener("DOMContentLoaded", function () {
  connectButton("my-button1", Userinfo);
  connectButton("my-button", login);
  connectButton("loginButton", login);


});

const submitHandler = async(event) => {
  event.preventDefault()
  console.log("submit")
}



//api function to get infro from the server to frontend
function api(endpoint, method = "GET", data = {}) {
  const API = "http://localhost:3000/";
  return fetch(API + endpoint, {
    method: method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getCookie("token"),
    },
    body: method == "GET" ? null : JSON.stringify(data),
  }).then((res) => res.json());
}



// Cookie functions stolen from w3schools (https://www.w3schools.com/js/js_cookies.asp)
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}



function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


function connectButton(id, event) {
  let element = document.getElementById(id);
  if (element) {
    element.addEventListener("click", event);
  }
}

function getValue(id) {
  let element = document.getElementById(id);
  if (element) {
    return element.value;
  }
  return "";
}



