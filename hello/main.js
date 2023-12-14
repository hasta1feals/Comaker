userData = [];
selectedIds = [];
empId = [];

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

function startMonitor() {
  console.log("startMonitor");
  apiPy("run-selenium-script", "POST").then((res) => {
    if (res.message === "Selenium script executed successfully") {
      console.log("Het is gelukt!"); // Assuming "Het is gelukt" means "It is successful" in Dutch
    }
  });
}

function deleteUser() {
  console.log(selectedIds);
  let id = selectedIds[0];
  for (let i = 0; i < selectedIds.length; i++) {
    id = selectedIds[i];
    console.log(id);
    api("users/" + id, "DELETE").then((res) => {
      if (res.message === "success") {
        console.log("het is gelukt");
      }
    });
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

function getRegion() {
  api("region", "GET").then((res) => {
    if (res.message === "success") {
  let result =res.rows[0].region.slice(8, 10);
  console.log(res.rows[0]);
  if (result === "en") {
    const countryIndex = res.rows[0].region.indexOf("Country=");
    if (countryIndex !== -1) {
      const countryCode = res.rows[0].region.slice(countryIndex + 8);
      console.log(countryCode);

      const region = document.querySelector("#regiontext");
      region.innerHTML = countryCode;
    } 
  }else {
      console.log(result);
      const region = document.querySelector("#regiontext");
      region.innerHTML = result;
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
    // toperer
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

function itemsLoad(currentTablePage) {
  // console.log(currentTablePage);
  api("items", "GET")
    .then((res) => {
      // console.log(res.rows); // Log the entire response to the console
      // innerhtmls
      totalPages = res.rows.length / TableRowsPerPage;
      totalPageNumber = Math.ceil(totalPages);

      const productAmount = document.querySelector("#product-amount");
      productAmount.innerHTML = res.rows.length;

      // console.log(res.rows);

      const mostRecentItem = res.rows.reduce((acc, current) => {
        const currentDate = new Date(current.date_recent);
        const accDate = acc ? new Date(acc.date_recent) : null;

        if (!accDate || currentDate > accDate) {
          return current;
        } else {
          return acc;
        }
      }, null);
      console.log(mostRecentItem);

      const currentDate = new Date();
      const recentDate = new Date(mostRecentItem.date_recent);
      const timeDifferenceInMilliseconds = Math.abs(currentDate - recentDate);
      const timeDifferenceInSeconds = timeDifferenceInMilliseconds / 1000;
      const timeDifferenceInMinutes = timeDifferenceInSeconds / 60;
      const timeDifferenceInHours = timeDifferenceInMinutes / 60;

      let formattedTimeDifference;

      if (timeDifferenceInHours < 24) {
        formattedTimeDifference = `${Math.round(
          timeDifferenceInHours
        )} hours ago`;
      } else if (timeDifferenceInHours < 720) {
        // 30 dagen * 24 uren
        formattedTimeDifference = `${Math.round(
          timeDifferenceInHours / 24
        )} days ago`;
      } else if (timeDifferenceInHours < 17520) {
        // 730 dagen * 24 uren
        formattedTimeDifference = `${Math.round(
          timeDifferenceInHours / 720
        )} months ago`;
      } else {
        formattedTimeDifference = `${Math.round(
          timeDifferenceInHours / 17520
        )} years ago`;
      }

      // console.log(formattedTimeDifference);

      const lastScanned = document.querySelector("#date");
      lastScanned.innerHTML = formattedTimeDifference;

      const items = res.rows;
      const outOfStockCount = items.filter(
        (item) => item.lv_stock === "Sin existencias"
      ).length;
      const outOfStock = document.querySelector("#out-of-stock");
      outOfStock.innerHTML = outOfStockCount;
      const inStock = document.querySelector("#in-stock");
      inStock.innerHTML = items.length - outOfStockCount;

      const pageCounter = document.querySelector("#pageAmount");
      pageCounter.innerHTML = currentTablePage + "/" + totalPageNumber;
      // on succes do this
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
                cell.textContent =
                  res.rows[i][key] === "Sin existencias"
                    ? "Out of stock"
                    : "In Stock";
                cell.className =
                  res.rows[i][key] === "Sin existencias"
                    ? "out-of-stock"
                    : "in-stock";
              } else {
                cell.textContent = res.rows[i][key];
              }
              row.appendChild(cell);
            }
          }
          tableBody.appendChild(row);
        }
        rowCount = res.rows.length;
        updatePaginationButtons(rowCount, endIndex);
      }
    })
    .catch((error) => {
      console.error("Error fetching items:", error);
    });
}
function nextTablePage() {
  currentTablePage++;
  // console.log(currentTablePage);
  itemsLoad(currentTablePage);
  updatePaginationButtons(currentTablePage);
}

function previousTablePage() {
  if (currentTablePage > 1) {
    currentTablePage--;
    console.log(currentTablePage);
    itemsLoad(currentTablePage);
    updatePaginationButtons(currentTablePage);
  }
}

function updatePaginationButtons(rowCount, endIndex, currentTablePage) {
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

function createRegion() {
  const data = {
    region: getValue("region-region"),
  };
  console.log(data);

  api("region", "PATCH", data).then((res) => {
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
    email: getValue("email1"),
  };
  // Submit data to API

  api("login", "POST", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie
      setCookie("token", res.token, 365);
      console.log("het is gelukt");
      console.log(res.token);
      // getUsers();
      // Userinfo();
      x = getCookie("token");
      console.log(x);
      window.location.href = "overzicht.html";
    } else {
      alert("Credentials are incorrect");
    }
  });
}

function editUser() {
  if (window.location.pathname.includes("employee-edit.html")) {
    const employeeId = localStorage.getItem("selectedEmployeeId");
    empId.push(employeeId);
    console.log(employeeId);

    if (employeeId) {
      data = {
        id: employeeId,
        firstname: getValue("firstname4"),
        infix: getValue("infix4"),
        lastname: getValue("lastname4"),
        email: getValue("email4"),
        password: getValue("password4"),
        admin: getValue("Usertype"),  
      };
      for (const key in data) {
        if (data.hasOwnProperty(key) && !data[key]) {
          delete data[key];
        }
      }
      console.log(data);
      // Submit data to API

      api("users", "PATCH", data).then((res) => {
        if (res.message == "success") {
          console.log(employeeId);
          console.log("het is gelukt");
          // getUsers();

          window.location.href = "employee-edit-select.html";
        } else {
          alert("iets gaat fout");
        }
      });
    } else {
    }
  }
  // Fetch data from html
}

function register() {
  // Fetch data from html
  data = {
    firstname: getValue("firstname2"),
    infix: getValue("prefix2"),
    lastname: getValue("lastname2"),
    email: getValue("email2"),
    gender: getValue("gender2"),
    password: getValue("password2"),
  };
  // Submit data to API

  api("register", "POST", data).then((res) => {
    if (res.message == "success") {
      // Save the received JWT in a cookie

      console.log("het is gelukt");
      // getUsers();

      window.location.href = "overzicht.html";
    } else {
      alert("iets gaat fout");
    }
  });
}
// here is where we add all the function we want to run when the log in successful
document.addEventListener("DOMContentLoaded", function () {
  const dataContainer = document.getElementById("userName");
  const token = getCookie("token"); // Retrieve the token from the cookie
  if (!token) {
    // Handle the case where the token is missing or invalid
    dataContainer.textContent = "Unauthorized: Token is missing or invalid";
  } else {
    api("secure", "GET", {}, { Authorization: `Bearer ${token}` }).then(
      (res) => {
        if (res.message === "success") {
          x = this.getElementById("testvuilnis");
          itemsLoad(currentTablePage);
          getCity();
          getRegion();
          getAllLinks();
          Userinfo();
          getUsersList(currentTablePageEMP);
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

let currentTablePageEMP = 1;

// function handleEditButtonClick() {
//   // console.log("Button clicked"); // Log to check if the button click is registered
//   editempbutton = true;
//   getUsersList(editempbutton);
//   // console.log(selectedIds);
// }

// After login, you can load in the users' stuff
function getUsersList(currentTablePageEMP) {
  api("users", "GET")
    .then((res) => {
      totalPagesEMP = res.length / TableRowsPerPage;
      totalPageNumberEMP = Math.ceil(totalPagesEMP);
      const employeeTable = document.querySelector("#employeeTable tbody");
      employeeTable.innerHTML = "";

      const startIndexEMP = (currentTablePageEMP - 1) * TableRowsPerPage;
      const endIndexEMP = startIndexEMP + TableRowsPerPage;
      for (let i = startIndexEMP; i < endIndexEMP && i < res.length; i++) {
        const row = document.createElement("tr");

        // Add a hidden checkbox with the user ID
        const checkboxCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "hiddenCheckbox";
        checkbox.value = res[i].id;
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        // Combine "firstname," "infix," and "lastname" into a single <td>
        const nameCell = document.createElement("td");
        const fullName = [res[i].firstname, res[i].infix, res[i].lastname]
          .filter(Boolean)
          .join(" ");
        nameCell.textContent = fullName;
        row.appendChild(nameCell);

        // Exclude the "id" field from being displayed
        for (const key in res[i]) {
          if (
            key !== "id" &&
            key !== "firstname" &&
            key !== "infix" &&
            key !== "lastname" &&
            key !== "password"
          ) {
            const cell = document.createElement("td");
            row.appendChild(cell);
            if (key === "admin") {
              cell.textContent = res[i][key] === 1 ? "Admin" : "Employee";
            } else {
              cell.textContent = res[i][key];
            }
          }
        }

        employeeTable.appendChild(row);
      }

      // Attach event listener to each checkbox
      const checkboxes = document.querySelectorAll(".hiddenCheckbox");
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedIds.push(checkbox.value);
          } else {
            selectedIds = selectedIds.filter((id) => id !== checkbox.value);
          }
          console.log(selectedIds);
        });
      });
      const pageCounterEMP = document.querySelector("#pageAmount");
      pageCounterEMP.innerHTML = currentTablePageEMP + "/" + totalPageNumberEMP;
      rowCount = res.length;
      updatePaginationButtonsEMP(rowCount, endIndexEMP);
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
    });
}

function nextTablePageEMP() {
  currentTablePageEMP++;
  getUsersList(currentTablePageEMP);
  updatePaginationButtonsEMP(currentTablePageEMP);
}

function previousTablePageEMP() {
  // console.log("prevButtonEMP click   " + currentTablePageEMP)
  if (currentTablePageEMP > 1) {
    currentTablePageEMP--;
    console.log(currentTablePageEMP);
    getUsersList(currentTablePageEMP);
    updatePaginationButtonsEMP(currentTablePageEMP);
  }
}

function updatePaginationButtonsEMP(
  rowCount,
  endIndexEMP,
  currentTablePageEMP
) {
  const prevButton = document.getElementById("prevButtonEMP");
  const nextButton = document.getElementById("nextButtonEMP");

  prevButton.disabled = currentTablePageEMP === 1;
  nextButton.disabled = rowCount <= endIndexEMP;
}

function getEmployeeID() {
  console.log(selectedIds);

  if (selectedIds.length === 0) {
    alert("Choose a employee to edit");
  } else {
    localStorage.setItem("selectedEmployeeId", selectedIds[0]);

    window.location.href = "employee-edit.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is on the employee-edit.html page
  if (window.location.pathname.includes("employee-edit.html")) {
    employeeId = localStorage.getItem("selectedEmployeeId");
    empId.push(employeeId);
    console.log(employeeId);
    if (employeeId) {
      api("employee", "POST", { id: employeeId })
        .then((res) => {
          console.log(res.rows[0]);

          const empFirstname = document.getElementById("firstname4");
          const empInfix = document.getElementById("infix4");
          const empLastname = document.getElementById("lastname4");
          const empEmail = document.getElementById("email4");
          const empGender = res.rows[0].gender;
          const empUsertype = res.rows[0].admin;
          const empUserSelect = document.getElementById("Usertype");

          empFirstname.placeholder = res.rows[0].firstname;
          if (res.rows[0].infix === null) {
            empInfix.placeholder = "";
          } else {
            empInfix.placeholder = res.rows[0].infix;
          }
          empLastname.placeholder = res.rows[0].lastname;
          empEmail.placeholder = res.rows[0].email;
          if (empGender === "Male") {
            document.getElementById("Male").checked = true;
          } else if (empGender === "Female") {
            document.getElementById("Female").checked = true;
          }
          for (let i = 0; i < empUserSelect.options.length; i++) {
            if (parseInt(empUserSelect.options[i].value) === empUsertype) {
              empUserSelect.options[i].selected = true;
              break;
            }
          }
        })
        .catch((error) => {
          console.error("Error during API request:", error);
        });
    } else {
      // Handle the case where there's no selected ID
      console.error("No employee ID found in localStorage");
    }
  }
});

globalUserData = {};

async function Userinfo() {
  try {
    const res = await api("secure");
    if (res.message === "success") {
      const { password, admin, ...userDataWithoutPassword } = res.decoded.user;
      Object.assign(globalUserData, userDataWithoutPassword);

      // Check if the user is an admin
      if (admin === 1) {
        // Show the admin-only elements in the sidebar
        showAdminNavbarElements();
      } else {
        // Hide the admin-only elements in the sidebar
        hideAdminNavbarElements();
      }

      const userName = document.querySelector("#userName");
      let fullName = globalUserData.firstname;
      if (globalUserData.infix !== null) {
        fullName += " " + globalUserData.infix;
      }

      fullName += " " + globalUserData.lastname;

      userName.innerHTML = fullName;
      // console.log(globalUserData);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

function showAdminNavbarElements() {
  // Logic to show admin-only elements in the sidebar
  $(".nav-link[href='register.html']").parent("li").show();
  $(".nav-link[href='employee-edit-select.html']").parent("li").show();
}

function hideAdminNavbarElements() {
  // Logic to hide admin-only elements in the sidebar
  $(".nav-link[href='register.html']").parent("li").hide();
  $(".nav-link[href='employee-edit-select.html']").parent("li").hide();
}

//you can add all the buttons you want to connect to the api or button functions
document.addEventListener("DOMContentLoaded", function () {
  connectButton("loginButton", login);
  connectButton("my-buttonRegisteren", createPost);
  // connectButton("start-scan", emailVal);
  connectButton("add-Links", createLinks);
  connectButton("add-city", createCity);
  connectButton("change-region", createRegion);
  connectButton("myBtn4", deleteItemAll);
  connectButton("deletbutton123", deleteLinksAll);
  connectButton("prevButton", previousTablePage);
  connectButton("nextButton", nextTablePage);
  connectButton("prevButtonEMP", previousTablePageEMP);
  connectButton("nextButtonEMP", nextTablePageEMP);
  // connectButton("editEmployee", handleEditButtonClick);
  connectButton("registerButton", register);
  connectButton("deleteButtonUser", deleteUser);
  connectButton("editEmployee", getEmployeeID);
  connectButton("loginButton4", editUser);
  connectButton("my-buttonLinksStart", startMonitor);
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

function apiPy(endpoint, method) {
  // Define your API endpoint and method
  const url = `http://127.0.0.1:5000/${endpoint}`;
  const requestOptions = {
    method: method,
  };

  // Make the asynchronous request
  return fetch(url, requestOptions)
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
}

// Cookie functions stolen from w3schools (https://www.w3schools.com/js/js_cookies.asp)
function setCookie(cname, cvalue, exdays = 1) {
  let d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000); // Expiration time in milliseconds
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"; // Set the cookie
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

function deleteCookie(cookieName) {
  document.cookie =
    cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
const logoutLink = document.getElementById("logoutLink");
logoutLink.addEventListener("click", function (event) {
  event.preventDefault();

  x = getCookie("token");
  console.log(x);
  deleteCookie("token");
  console.log("Token cookie deleted " + x);
  window.location.href = "login.html";
});
