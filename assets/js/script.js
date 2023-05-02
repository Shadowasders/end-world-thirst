// ====================================================== //
//                -------- VARIABLES --------             //
// ====================================================== //
const btnSubmit = document.querySelector("#submit-btn");
const userZip = document.querySelector("#zipsubmit");
const clearButton = document.querySelector("#clearbtn");
const parentSection = document.querySelector(".parent-section");
const radiusCheck = document.querySelector("#radius-check");
const btnParentEl = document.querySelector(".btn-parent");
const WeatherAPIKey = "021e75b0e3380e236b4ff6031ae2dde4";
const fiveMileDistance = 8.04672;
const tenMileDistance = 16.0934;
const fifteenMileDistance = 24.1402;
const listItem = document.querySelectorAll("li");
let favesListEL = document.querySelector("#faves-list");
let favoritesList = [];
let favoritesListNamesOnly = [];
let breweryList = [];
let withinFiveMiles = [];
let withinTenMiles = [];
let withinFifteenMiles = [];
let errorMessage = document.querySelector(".errormsg");
let breweryName, breweryAddress, breweryLat, breweryLon, breweryURL;
let tempObject;
let map;
let marker, circle, lat, lon;
let distanceOfTempLocation, referenceLocation, tempLocation;
let warningMessage;
let createList,
  createListItemFive,
  createListTen,
  createListFifteen,
  createListItemTen,
  createListItemFifteen,
  anchorTag,
  anchorTagText,
  inspect,
  breweryTitle;

// ====================================================== //
//                   -------- CODE --------               //
// ====================================================== //

/**
 * favorites list loads upon refresh
 */
function init() {
  // let tempVal = localStorage.getItem("input");
  if (localStorage.length !== 0) {
    // if exists
    favoritesList = JSON.parse(localStorage.getItem("userInput"));
    renderFavorites();
  }
}

init();

btnSubmit.addEventListener("click", function () {
  clearWarning();
  eraseOtherLists();
  withinFiveMiles = [];
  withinTenMiles = [];
  withinFifteenMiles = [];
  breweryList = [];
  radiusCheck.addEventListener("change", displayLists);
  let tempUserVal;
  // console.log(userZip.value);
  tempUserVal = parseInt(userZip.value);
  // console.log(tempUserVal);
  if (isNaN(tempUserVal)) {
    renderInvalidMessage();
  } else {
    fetchUserZipCode(tempUserVal);
    // if (favoritesList.includes(tempUserVal) === false) {
    //   favoritesList.push(tempUserVal);
    // }
    // localStorage.setItem("input", JSON.stringify(favoritesList));
    // renderFavorites();
  }
});

// console.log(favesListEL);
function renderFavorites() {
  // favesListEL.innerHTML = "";
  let favoritesItem, favoritesItemTag, favoritesItemTagText;
  // tempUserVal = parseInt(userZip.value);
  for (let i = 0; i < favoritesList.length; i++) {
    // let favoritesItem = document.createElement("a");
    // let favoritesItemText = document.createTextNode('href');
    // favoritesItem.textContent = favoritesList[i].name;
    // // favoritesButton.value = favoritesList[i];
    // favoritesButton.setAttribute("class", "faves-btn");
    // favesListEL.appendChild(favoritesButton);

    if (favoritesList[i].url !== "") {
      favoritesItemTag = document.createElement("a");
      favoritesItemTag.setAttribute("href", favoritesList[i].url);
      favoritesItemTagText = document.createTextNode(favoritesList[i].name);
      favoritesItemTag.appendChild(favoritesItemTagText);
      favesListEL.appendChild(favoritesItemTag);
    } else {
      favoritesItem = document.createElement("p");
      favoritesItem.textContent = favoritesList[i].name;
      favesListEL.appendChild(favoritesItem);
    }

    // favoritesButton.addEventListener("click", function () {
    //   clearWarning();
    //   eraseOtherLists();
    //   withinFiveMiles = [];
    //   withinTenMiles = [];
    //   withinFifteenMiles = [];
    //   breweryList = [];
    //   fetchUserZipCode(favoritesButton.value);
    //   radiusCheck.addEventListener("change", displayLists);
    // });
  }
}

/**
 * user input validation
 */
function renderInvalidMessage() {
  errorMessage.style.color = "red";
}

function clearWarning() {
  errorMessage.style.color = "transparent";
}

clearButton.addEventListener("click", function () {
  favesListEL.innerHTML = "";
  favoritesList = [];
  localStorage.clear();
});

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
    breweryURL = data[i].website_url;
    tempObject = {
      name: breweryName,
      address: breweryAddress,
      lat: breweryLat,
      lon: breweryLon,
      url: breweryURL,
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
      url: breweryList[i].url,
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
}

/**
 * creates list within 5 mile radius
 */
function createFiveList() {
  let tempChoice;
  createList = document.createElement("ul");
  createList.setAttribute("id", "fiveMileList");
  createList.setAttribute("class", "has-text-weight-bold p-3");
  parentSection.appendChild(createList);
  // createList.style.listStyleImage = "url('./assets/images/heart-icon.png')";

  for (let i = 0; i < withinFiveMiles.length; i++) {
    createListItemFive = document.createElement("li");
    createListItemFive.setAttribute("class", "title");
    createList.appendChild(createListItemFive);
    if (withinFiveMiles[i].url !== null) {
      anchorTag = document.createElement("a");
      anchorTag.setAttribute("href", withinFiveMiles[i].url);
      anchorTagText = document.createTextNode(withinFiveMiles[i].name);
      anchorTag.appendChild(anchorTagText);
      createListItemFive.appendChild(anchorTag);
    } else {
      breweryTitle = document.createElement("p");
      breweryTitle.textContent = withinFiveMiles[i].name;
      breweryTitle.setAttribute("class", "brewery-name");
      createListItemFive.appendChild(breweryTitle);
    }
    let createListItemFiveAddy = document.createElement("p");
    createListItemFiveAddy.setAttribute("class", "is-italic subtitle");
    createListItemFiveAddy.textContent = withinFiveMiles[i].address;
    createListItemFive.appendChild(createListItemFiveAddy);
    createListItemFive.style.fontWeight = "400";
    createListItemFive.addEventListener("click", function (e) {
      if (withinFiveMiles[i].url !== null) {
        tempChoice = {
          name: e.currentTarget.querySelector("a").textContent,
          url: `${e.currentTarget.querySelector("a").href}`,
        };
        if (favoritesListNamesOnly.includes(tempChoice.name) === false) {
          favoritesList.push(tempChoice);
          favoritesListNamesOnly.push(tempChoice.name);
          favoritesItemTag = document.createElement("a");
          favoritesItemTag.setAttribute("href", tempChoice.url);
          favoritesItemTagText = document.createTextNode(tempChoice.name);
          favoritesItemTag.appendChild(favoritesItemTagText);
          favesListEL.appendChild(favoritesItemTag);
        }
      } else {
        tempChoice = {
          name: e.currentTarget.querySelector(".brewery-name").textContent,
          url: "",
        };
        if (favoritesListNamesOnly.includes(tempChoice.name) === false) {
          favoritesList.push(tempChoice);
          favoritesListNamesOnly.push(tempChoice.name);
          favoritesItem = document.createElement("p");
          favoritesItem.textContent = tempChoice.name;
          favesListEL.appendChild(favoritesItem);
        }
      }
      localStorage.setItem("userInput", JSON.stringify(favoritesList));
    });

    marker = new L.marker([withinFiveMiles[i].lat, withinFiveMiles[i].lon])
      .bindPopup(withinFiveMiles[i].name)
      .addTo(map);
  }
}

/**
 * creates list within 10 mile radius
 */
function createTenList() {
  createListTen = document.createElement("ul");
  createListTen.setAttribute("id", "tenMileList");
  createListTen.setAttribute("class", "has-text-weight-bold p-3");
  parentSection.appendChild(createListTen);
  for (let i = 0; i < withinTenMiles.length; i++) {
    createListItemTen = document.createElement("li");
    createListItemTen.setAttribute("class", "title");
    createListTen.appendChild(createListItemTen);
    if (withinTenMiles[i].url !== null) {
      anchorTag = document.createElement("a");
      anchorTag.setAttribute("href", withinTenMiles[i].url);
      anchorTagText = document.createTextNode(withinTenMiles[i].name);
      anchorTag.appendChild(anchorTagText);
      createListItemTen.appendChild(anchorTag);
    } else {
      breweryTitle = document.createElement("p");
      breweryTitle.textContent = withinTenMiles[i].name;
      breweryTitle.setAttribute("class", "brewery-name");
      createListItemTen.appendChild(breweryTitle);
    }

    createListItemTenAddy = document.createElement("p");
    createListItemTenAddy.setAttribute("class", "is-italic subtitle");
    createListItemTenAddy.textContent = withinTenMiles[i].address;
    createListItemTen.appendChild(createListItemTenAddy);
    createListItemTen.style.fontWeight = "400";

    createListItemTen.addEventListener("click", function (e) {
      if (withinTenMiles[i].url !== null) {
        tempChoice = {
          name: e.currentTarget.querySelector("a").textContent,
          url: `${e.currentTarget.querySelector("a").href}`,
        };
        if (favoritesListNamesOnly.includes(tempChoice.name) === false) {
          favoritesList.push(tempChoice);
          favoritesListNamesOnly.push(tempChoice.name);
          favoritesItemTag = document.createElement("a");
          favoritesItemTag.setAttribute("href", tempChoice.url);
          favoritesItemTagText = document.createTextNode(tempChoice.name);
          favoritesItemTag.appendChild(favoritesItemTagText);
          favesListEL.appendChild(favoritesItemTag);
        }
      } else {
        tempChoice = {
          name: e.currentTarget.querySelector(".brewery-name").textContent,
          url: "",
        };
        if (favoritesListNamesOnly.includes(tempChoice.name) === false) {
          favoritesList.push(tempChoice);
          favoritesListNamesOnly.push(tempChoice.name);
          favoritesItem = document.createElement("p");
          favoritesItem.textContent = tempChoice.name;
          favesListEL.appendChild(favoritesItem);
        }
      }
      localStorage.setItem("userInput", JSON.stringify(favoritesList));
    });

    marker = new L.marker([withinTenMiles[i].lat, withinTenMiles[i].lon])
      .bindPopup(withinTenMiles[i].name)
      .addTo(map);
  }
}

/**
 * creates list within 15 mile radius
 */
function createFifteenList() {
  createListFifteen = document.createElement("ul");
  createListFifteen.setAttribute("id", "fifteenMileList");
  createListFifteen.setAttribute("class", "has-text-weight-bold p-3");
  parentSection.appendChild(createListFifteen);
  for (let i = 0; i < withinFifteenMiles.length; i++) {
    createListItemFifteen = document.createElement("li");
    createListItemFifteen.setAttribute("class", "title");
    createListFifteen.appendChild(createListItemFifteen);
    if (withinFifteenMiles[i].url !== null) {
      anchorTag = document.createElement("a");
      anchorTag.setAttribute("href", withinFifteenMiles[i].url);
      anchorTagText = document.createTextNode(withinFifteenMiles[i].name);
      anchorTag.appendChild(anchorTagText);
      createListItemFifteen.appendChild(anchorTag);
    } else {
      breweryTitle = document.createElement("p");
      breweryTitle.textContent = withinFifteenMiles[i].name;
      breweryTitle.setAttribute("class", "brewery-name");
      createListItemFifteen.appendChild(breweryTitle);
    }

    createListItemFifteenAddy = document.createElement("p");
    createListItemFifteenAddy.setAttribute("class", "is-italic subtitle");
    createListItemFifteenAddy.textContent = withinFifteenMiles[i].address;
    createListItemFifteen.appendChild(createListItemFifteenAddy);
    createListItemFifteen.style.fontWeight = "400";

    createListItemFifteen.addEventListener("click", function (e) {
      if (withinFifteenMiles[i].url !== null) {
        tempChoice = {
          name: e.currentTarget.querySelector("a").textContent,
          url: `${e.currentTarget.querySelector("a").href}`,
        };
        if (favoritesListNamesOnly.includes(tempChoice.name) === false) {
          favoritesList.push(tempChoice);
          favoritesListNamesOnly.push(tempChoice.name);
          favoritesItemTag = document.createElement("a");
          favoritesItemTag.setAttribute("href", tempChoice.url);
          favoritesItemTagText = document.createTextNode(tempChoice.name);
          favoritesItemTag.appendChild(favoritesItemTagText);
          favesListEL.appendChild(favoritesItemTag);
        }
      } else {
        tempChoice = {
          name: e.currentTarget.querySelector(".brewery-name").textContent,
          url: "",
        };
        if (favoritesListNamesOnly.includes(tempChoice.name) === false) {
          favoritesList.push(tempChoice);
          favoritesListNamesOnly.push(tempChoice.name);
          favoritesItem = document.createElement("p");
          favoritesItem.textContent = tempChoice.name;
          favesListEL.appendChild(favoritesItem);
        }
      }
      localStorage.setItem("userInput", JSON.stringify(favoritesList));
    });

    marker = new L.marker([
      withinFifteenMiles[i].lat,
      withinFifteenMiles[i].lon,
    ])
      .bindPopup(withinFifteenMiles[i].name)
      .addTo(map);
  }
}

/**
 * map and marker display depends on user dropdown choice
 */
function displayLists() {
  console.log("we changed options!!!!");
  map.eachLayer(function (layer) {
    map.removeLayer(layer);
  });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  eraseOtherLists();
  if (radiusCheck.value === "5 miles") {
    createFiveList();
    map.setZoom(10);
    renderSearchCircle(8500);
    document.querySelector("#fiveMileList").style.display = "block";
  } else if (radiusCheck.value === "10 miles") {
    createTenList();
    map.setZoom(9);
    renderSearchCircle(16500);
  } else {
    createFifteenList();
    map.setZoom(8);
    renderSearchCircle(25000);
    document.querySelector("#fifteenMileList").style.display = "block";
  }
}

/**
 *  clear each search list while navigating through options
 */
function eraseOtherLists() {
  let findLists = parentSection.querySelectorAll("ul");
  for (let i = 0; i < findLists.length; i++) {
    findLists[i].remove();
  }
}

/**
 * clears previous map before initializing new one
 * @param {*} zoomValue
 */
function clearPreviousMap(zoomValue) {
  if (map == undefined) {
    renderMap(zoomValue);
  } else {
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
