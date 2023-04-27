const btnSubmit = document.querySelector("#submit-btn");
const userZip = document.querySelector("#zipsubmit");
const WeatherAPIKey = "021e75b0e3380e236b4ff6031ae2dde4";

function init() {
  let tempVal = localStorage.getItem();
}

btnSubmit.addEventListener("click", function () {
  console.log("Hi");
  let tempUserVal;
  console.log(userZip.value);
  tempUserVal = parseInt(userZip.value);
  console.log(tempUserVal);
  if (isNaN(tempUserVal)) {
    renderInvalidMessage();
  } else {
    console.log("valid input");
  }
  let userInput = localStorage.setItem("input", userZip.value);
  fetchUserZipCode(tempUserVal);
});

/**
 * user input validation
 */
function renderInvalidMessage() {
  let warningMessage;
  warningMessage = document.createElement("p");
  warningMessage.style.color = "red";
  warningMessage.textContent = "invalid input, L + ratio + you suck";
  btnSubmit.parentElement.appendChild(warningMessage);
}

/**
 * fetch data using zip code
 * @param {*} userInput
 */
function fetchUserZipCode(tempUserVal) {
  let postalURL = `https://api.openweathermap.org/geo/1.0/zip?zip=${tempUserVal}&appid=${WeatherAPIKey}`;

  fetch(postalURL)
    .then((response) => response.json())
    .then(getCoordinates);
}

/**
 * getting coordinates as a reference point
 * @param {*} allData
 */
function getCoordinates(allData) {
  let y = allData;
  console.log(y);
  lat = y.lat;
  lon = y.lon;
  console.log(lat);
  console.log(lon);
  referenceLocation = {
    lat: lat,
    lon: lon,
  };
  console.log(referenceLocation);
}
