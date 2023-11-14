userData = [];

function exportTableToExcel(tableID, filename = "") {
  console.log("exportTableToExcel");
  var downloadLink;
  var dataType = "application/vnd.ms-excel";
  var tableSelect = document.getElementById(tableID);
  var tableHTML = tableSelect.outerHTML.replace(/ /g, "%20");

  // Specify file name
  filename = filename ? filename + ".xls" : "excel_data.xls";

  //create dowanliad link element
  downloadLink = document.createElement("a");

  document.body.appendChild(downloadLink);
  if (navigator.msSaveOrOpenBlob) {
    var blob = new Blob(["\ufeff", tableHTML], {
      type: dataType,
    });
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    // Create a link to the file
    downloadLink.href = "data:" + dataType + ", " + tableHTML;

    // Setting the file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();
  }
}

function getCity() {
  api("city", "GET").then((res) => {
    if (res.message === "success") {
      const select = document.getElementById("citySelect");

      for (let i = 0; i < res.rows.length; i++) {
        const data = res.rows[i];
        var option = document.createElement("option");
        option.text = data.city;
        select.add(option);
      }
    }
  });
}

function getAllLinks() {
  api("links", "GET").then((res) => {
    if (res.message === "success") {
      const ul = document.getElementById("testx");

      for (let i = 0; i < res.rows.length; i++) {
        const data = res.rows[i];
        var li = document.createElement("li");
        li.textContent = data.links;

        // Create a delete button
        var deleteButton = document.createElement("span");
        deleteButton.className = "delete";
        var deleteIcon = document.createElement("i");
        deleteIcon.id = "testvuilnis";
        deleteIcon.className = "bx bx-trash";
        deleteButton.appendChild(deleteIcon);

        // Attach a click event listener to the li element

        // Attach a click event listener to the delete button
        deleteButton.addEventListener("click", function (event) {
          // Prevent li click event when delete button is clicked
          event.stopPropagation();

          // Call your delete API or remove the li element as needed
          deleteLink(data.id);
        });

        li.appendChild(deleteButton);
        ul.appendChild(li);
      }
    } else {
      console.log("failed");
    }
  });
}

function deleteLink(linkId) {
  api("links_specific", "DELETE", { id: linkId }).then((res) => {
    if (res.message === "success") {
      // Remove the li element from the DOM
      document.getElementById(linkId).remove();
    } else {
      console.log("failed");
    }
  });
}

function deleteItemAll() {
  api("items", "DELETE").then((res) => {
    if (res.message === "success") {
      console.log("het is gelukt");
    } else {
      console.log("failed");
    }
  });
}

function deleteLinksAll() {
  api("links", "DELETE").then((res) => {
    if (res.message === "success") {
      console.log("het is gelukt");
    } else {
      console.log("failed");
    }
  });
}

const TableRowsPerPage = 9;
let currentTablePage = 1;

function itemsLoad() {
  api("items", "GET")
    .then((res) => {
      console.log(res.rows); // Log the entire response to the console
      
      totalPages= (res.rows.length / TableRowsPerPage)
      totalPageNumber = Math.ceil(totalPages)
      console.log(totalPageNumber);
      console.log(currentTablePage +" table numbr")

      const pageCounter = document.querySelector("#pageAmount");
      pageCounter.innerHTML = currentTablePage + "/"+ totalPageNumber;
      
      if (res.message === "success") {
        const tableBody = document.querySelector("#myTable tbody");
        tableBody.innerHTML = "";

        const startIndex = (currentTablePage - 1) * TableRowsPerPage;
        const endIndex = startIndex + TableRowsPerPage;


        for (let i = startIndex; i < endIndex && i < res.rows.length; i++) {
          const row = document.createElement("tr");
          for (const key in res.rows[i]) {
            //exlcude the id field
            if (key !== "id") {
              const cell = document.createElement("td");

              //translate in stock
              if (key === "lv_stock") {
                cell.textContent = res.rows[i][key] === "Sin existencias" ? "Out of stock" : "In Stock";
                cell.className = res.rows[i][key] === "Sin existencias" ? "out-of-stock" : "in-stock";

              } else {
                cell.textContent = res.rows[i][key];
              }
              row.appendChild(cell);
            }
          }
          tableBody.appendChild(row);
        }
        rowCount = res.rows.length
        updatePaginationButtons(rowCount, endIndex);
      }
    })
    .catch((error) => {
      console.error("Error fetching items:", error);
    });
}
function nextTablePage() {

  currentTablePage++;
  itemsLoad();
  updatePaginationButtons();
}

function previousTablePage() {
  if (currentTablePage > 1) {
    currentTablePage--;
    itemsLoad();
    updatePaginationButtons();
  }
}

function updatePaginationButtons(rowCount, endIndex) {
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");

  prevButton.disabled = currentTablePage === 1;
  nextButton.disabled = rowCount < endIndex;
}

function createLinks() {
  console.log("createLinks");
  const data = {
    link: getValue("links-links"),
  };
  console.log(data);

  api("link", "POST", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie

      console.log("het is gelukt");
    } else {
      alert("mislukt");
    }
  });
}

function createCity() {
  const data = {
    city: getValue("city-city"),
  };
  console.log(data);

  api("city", "PATCH", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie

      console.log("het is gelukt");
    } else {
      alert("mislukt");
    }
  });
}

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
      console.log("het is gelukt");
      console.log(res.token);
      // getUsers();
      Userinfo();
      x = getCookie("token");
      console.log(x);
      window.location.href = "overzicht.html";
    } else {
      alert("Credentials are incorrect");
    }
  });
}

// here is where we add all the function we want to run when the log in successful
document.addEventListener("DOMContentLoaded", function () {
  const dataContainer = document.getElementById("klaas");
  const token = getCookie("token"); // Retrieve the token from the cookie
  if (!token) {
    // Handle the case where the token is missing or invalid
    dataContainer.textContent = "Unauthorized: Token is missing or invalid";
  } else {
    api("secure", "GET", {}, { Authorization: `Bearer ${token}` }).then(
      (res) => {
        if (res.message === "success") {
          x = this.getElementById("testvuilnis");
          dataContainer.textContent = res.decoded.user.name;
          itemsLoad();
          getCity();
          getAllLinks();
        } else {
          // Handle any errors or unauthorized access
          dataContainer.textContent =
            "Unauthorized: Token is invalid or expired";
        }
      }
    );
  }
});

async function createPost() {
  const data = {
    password: getValue("password"),
    username: getValue("title1"),
    name: getValue("name"),
  };

  api("register", "POST", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie

      console.log("het is gelukt");
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
    name: getValue("name"),
  };
  // Submit data to API

  api("register", "POST", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie
      console.log("het is gelukt");
      getUsers();
      return false;
    } else {
      alert("you left something empty");
      return falseS;
    }
  });
  return false;
}

//after login you can load in the users stuff
function getUsers() {}

function Userinfo() {
  api("secure").then((res) => {
    if (res.message == "success") {
      console.log(res.decoded.user.username);
      console.log(res.decoded.user.name);
      userData.push(res.decoded.user.username, res.decoded.user.name);
    }
  });
}
//you can add all the buttons you want to connect to the api or button functions
document.addEventListener("DOMContentLoaded", function () {
  connectButton("loginButton", login);
  connectButton("my-buttonRegisteren", createPost);
  // connectButton("start-scan", emailVal);
  connectButton("add-Links", createLinks);
  connectButton("add-city", createCity);
  connectButton("myBtn4", deleteItemAll);
  connectButton("deletbutton123", deleteLinksAll);
  connectButton("prevButton", previousTablePage);
  connectButton("nextButton", nextTablePage);
  // connectButton("export-table", exportTableToExcel("tabel-items", "table"));
});

const submitHandler = async (event) => {
  event.preventDefault();
  console.log("submit");
};

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

function showPage(id) {
  let pages = document.getElementsByClassName("container");
  for (let i = 0; i < pages.length; i++) {
    pages[i].style.display = "none";
  }
  document.getElementById(id).style.display = "block";
}
