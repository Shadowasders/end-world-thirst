const btnSubmit = document.querySelector("#submit-btn");
const userZip = document.querySelector("#zipsubmit");

function init(){
    let tempVal = localStorage.getItem();
};

btnSubmit.addEventListener("click", function(){
    console.log("Hi");
    let tempUserVal;
    console.log(userZip.value);
    tempUserVal = parseInt(userZip.value);
    console.log(tempUserVal);
    if (isNaN(tempUserVal)) {
        renderInvalidMessage();
    }
    else {
        console.log("valid input");
    }
    let userInput = localStorage.setItem("input", userZip.value);

})

function renderInvalidMessage(){
    let warningMessage;
    warningMessage = document.createElement("p");
    warningMessage.style.color = "red";
    warningMessage.textContent = "invalid input, L + ratio + you suck"
    btnSubmit.parentElement.appendChild(warningMessage);
}