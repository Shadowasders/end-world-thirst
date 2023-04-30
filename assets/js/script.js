// ====================================================== //
//                -------- VARIABLES --------             //
// ====================================================== //
const btnSubmit = document.querySelector("#submit-btn");
const userZip = document.querySelector("#zipsubmit");
const searchRadiusEL = document.querySelector("#search-radius");
const WeatherAPIKey = "021e75b0e3380e236b4ff6031ae2dde4";
const fiveMileDistance = 8.04672;
const tenMileDistance = 16.0934;
const fifteenMileDistance = 24.1402;
let favesListEL = document.querySelector("#faves-list");
let favoritesList = [];
let breweryList = [];
let withinFiveMiles = [];
let withinTenMiles = [];
let withinFifteenMiles = [];
let breweryName, breweryAddress, breweryLat, breweryLon;
let tempObject;
let map;
let marker, circle, lat, lon;
let distanceOfTempLocation, referenceLocation, tempLocation;

// ====================================================== //
//                   -------- CODE --------               //
// ====================================================== //

/**
 * favorites list loads upon refresh
 */
function init() {
  let tempVal = localStorage.getItem("input");
  if (tempVal) {
    // if exists
    favoritesList = JSON.parse(tempVal);
  }
  renderFavorites();
}

init();

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
  // let userInput = localStorage.setItem("input", userZip.value);
  fetchUserZipCode(tempUserVal);
  favoritesList.push(tempUserVal);
  localStorage.setItem("input", JSON.stringify(favoritesList));
  renderFavorites();
});

console.log(favesListEL);
function renderFavorites() {
  favesListEL.innerHTML = "";
  for (let i = 0; i < favoritesList.length; i++) {
    let favoritesButton = document.createElement("button");
    favoritesButton.textContent = favoritesList[i];
    favoritesButton.value = favoritesList[i];
    favoritesButton.setAttribute("class", "faves-btn");
    favesListEL.appendChild(favoritesButton);

    favoritesButton.addEventListener("click", function () {
      fetchUserZipCode(favoritesButton.value);
    });
  }
}

/**
 * user input validation
 */
function renderInvalidMessage() {
  let warningMessage;
  warningMessage = document.createElement("p");
  warningMessage.style.color = "red";
  warningMessage.textContent = "Please enter a valid zipcode.";
  searchRadiusEL.appendChild(warningMessage);
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
 *  fetch data from brewery API
 * @param {*} lat
 * @param {*} lon
 */
function fetchBreweryLocation(lat, lon) {
  let breweryURL = `https://api.openbrewerydb.org/v1/breweries?by_dist=${lat},${lon}&per_page=50`;
  fetch(breweryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      filteredBreweries(data);
    });
}

/**
 * filtering out necessary data for distance calculation
 * @param {*} data
 */
function filteredBreweries(data) {
  // console.log(data);
  for (let i = 0; i < data.length; i++) {
    breweryName = data[i].name;
    breweryAddress = data[i].address_1;
    breweryLat = data[i].latitude;
    breweryLon = data[i].longitude;
    tempObject = {
      name: breweryName,
      address: breweryAddress,
      lat: breweryLat,
      lon: breweryLon,
    };
    breweryList.push(tempObject);
  }
  // console.log(breweryList);
  calculateDistBtwCoordPairs();
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

  clearPreviousMap(10);
  fetchBreweryLocation(lat, lon);
}

/**
 * distance between 2 points calculated
 */
function calculateDistBtwCoordPairs() {
  let tempArray;

  for (let i = 0; i < breweryList.length; i++) {
    // in this case, distanceOfTempLocation is they hypotenuse (h)
    // in Pythagoras' theorem, with h^2 = x^2 + y^2
    kmY = 40000 / 360;
    kmX = Math.cos((Math.PI * referenceLocation.lat) / 180) * kmY;
    distX = Math.abs(referenceLocation.lon - breweryList[i].lon) * kmX;
    distY = Math.abs(referenceLocation.lat - breweryList[i].lat) * kmY;
    distanceOfTempLocation = Math.sqrt(distX ** 2 + distY ** 2);
    tempArray = {
      name: breweryList[i].name,
      address: breweryList[i].address,
      lat: breweryList[i].lat,
      lon: breweryList[i].lon,
      distanceFromOrigin: distanceOfTempLocation,
    };

    if (
      0 <= distanceOfTempLocation &&
      distanceOfTempLocation <= fifteenMileDistance
    ) {
      if (distanceOfTempLocation <= tenMileDistance) {
        if (distanceOfTempLocation <= fiveMileDistance) {
          withinFiveMiles.push(tempArray);
        }
        withinTenMiles.push(tempArray);
      }
      withinFifteenMiles.push(tempArray);
    }
    // distanceAndBoolean.push(tempArray);
  }
  console.log(withinFiveMiles);
  console.log(withinTenMiles);
  console.log(withinFifteenMiles);
}

/**
 * clears previous map before initializing new one
 * @param {*} zoomValue
 */
function clearPreviousMap(zoomValue) {
  if (map == undefined) {
    renderMap(zoomValue);
  } else {
    distanceAndBoolean = [];
    nameAndCoordinates = [];
    withinFiveMiles = [];
    withinTenMiles = [];
    withinFifteenMiles = [];
    map.remove();
    renderMap(zoomValue);
  }
}

/**
 * renders the map of user's zip code
 */
function renderMap(zoomValue) {
  map = L.map("map").setView([lat, lon], zoomValue);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

/**
 * renders search circle based on search parameters
 * @param {*} radiusInMeters
 */
function renderSearchCircle(radiusInMeters) {
  circle = L.circle([lat, lon], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: radiusInMeters,
  }).addTo(map);
}
