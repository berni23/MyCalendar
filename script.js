var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var daysWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var daysWeekShort = daysWeek.map(el => el.slice(0, 3));
var monthsShort = months.map(el => el.slice(0, 3));
var stringDays = document.querySelector(".string-days");
var todaySpan = document.querySelector(".today-caption");
var todayTooltiptext = document.querySelector(".tooltiptext");
var btnModal = document.getElementById("add-event");

const totalCells = 42;


// event form

var inputTitle = document.getElementById("input-title");
var inputDateIni = document.getElementById("input-date-ini");
var hasEndDate = document.getElementById("has-end-date");
var inputDateEnd = document.getElementById("input-date-end");
var remindExpire = document.getElementById("remind-expire");
var timerRemind = document.getElementById("timer-remind");
var inputEventDescription = document.getElementById("event-description");
var eventType = document.getElementById("event-type");

var btnCreateEvent = document.getElementById("create-event");
var btnCancelEvent = document.getElementById("cancel-event");

btnCreateEvent.addEventListener("click", validate);

function currentDate() {

    var d = new Date();
    var dayOfMonth = d.getDate(); // day in the month
    var numMonth = d.getMonth();
    var month = months[numMonth];
    var year = d.getFullYear();
    var day = d.getDay() // day in the week
    var dayWeek = daysWeek[day];
    var dayWeekShort = daysWeekShort[day];
    var monthShort = monthsShort[numMonth];
    var millis = d.getTime;
    return {

        d,
        millis,
        dayWeek,
        dayOfMonth,
        setDate() {
            todaySpan.textContent = dayWeekShort + ", " + dayOfMonth + " " + monthShort;
            todayTooltiptext.textContent = dayWeek + ", " + dayOfMonth + " " + month + " " + year;
        },
        daysInMonth() {
            return getDaysInMonth(numMonth, year);
        },
        firstDayMonthWeekDay() {
            return firstDayMonth(numMonth, year);
        },

        toIso() {
            return d.toISOString();

        }
    }
}

var today = currentDate();
today.setDate();

// populate calendar days

var currentMonth = document.querySelector(".current-month");
var numCells = today.daysInMonth();

//Empty cells if month starts at different day than sunday

for (let i = 0; i < today.firstDayMonthWeekDay(); i++)
    appendBlankCell();

for (let i = 1; i <= today.daysInMonth(); i++) {

    let day = document.createElement("div");
    day.innerHTML = "<br><span class = 'cell'>" + i + "</span>";
    if (i === today.dayOfMonth) {
        day.classList.add("today-cell");
    }
    currentMonth.appendChild(day);
}

var cellsLeft = totalCells - today.daysInMonth() - today.firstDayMonthWeekDay();
console.log(today.firstDayMonthWeekDay());

for (let i = 0; i < cellsLeft; i++)
    appendBlankCell();

function appendBlankCell() {
    let blankCell = document.createElement("div");
    blankCell.innerHTML = "<span><br></span>";
    currentMonth.appendChild(blankCell);
}

/*--------------------------------------
useful functions
------------------------------------*/

function getDaysInMonth(month, year) {
    // Here January is 1 based
    //Day 0 is the last day in the previous month
    return new Date(year, month, 0).getDate()

}

function firstDayMonth(month, year) {
    return new Date(year, month, 1).getDay();
}

/* modal  logic */

var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        modal.classList.toggle("show-modal");
    }
}

btnModal.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
document.addEventListener('keydown', handleKeyDown);

function handleKeyDown(event) {
    if (event.keyCode === 27) { // hide modal on esc key pressed
        modal.classList.remove("show-modal");
    }
}

/*
-------------------------
Form, validation function
--------------------------
*/

/*var inputTitle = document.getElementById("input-title");
var inputDateIni = document.getElementById("input-date-ini");
var hasEndDate = document.getElementById("has-end-date");
var inputDateEnd = document.getElementById("input-date-end");
var remindExpire = document.getElementById("remind-expire");
var timerRemind = document.getElementById("timer-remind");
var inputEventDescription = document.getElementById("event-description");
var eventType = document.getElementById("event-type");

var btnCreateEvent = document.getElementById("create-event");
var btnCancelEvent = document.getElementById("cancel-event");
*/

hasEndDate.addEventListener("click", toggleEndDate);

function toggleEndDate() {
    inputDateEnd.parentElement.classList.toggle("hidden");
}

function validate() {

    console.log(inputDateIni.value);
    let dateIni = new Date(inputDateIni.value);
    let dateEnd;

    let todayObj = today.d;
    clearErrors()
    const TitleRegEx = /\b.{1,60}\b/ // literally whatever between 1 and 60 chars

    if (!TitleRegEx.test(inputTitle.value)) {

        inputTitle.parentElement.insertAdjacentHTML(
            "beforeend",
            "<div class='error-msg'><p>Title must be between 1 and 60 characters</p></div>"
        );
        inputTitle.classList.add("error-input")
        //  throw "error";
    }

    if (inputDateIni.value == "" || todayObj.getTime() > dateIni.getTime()) {
        inputDateIni.parentElement.insertAdjacentHTML(
            "beforeend",
            "<div class='error-msg'><p>Date event can't lay in the past or be blank</p></div>"
        );
        inputDateIni.classList.add("error-input")
        //  throw "error";
    }

    if (hasEndDate.checked) {
        dateEnd = new Date(inputDateEnd.value);

        if (inputDateEnd.value == "") {

            hasEndDate.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg' style ='margin-top:20px'><p>Please provide an end date or uncheck the box</p></div>"
            );
            inputDateEnd.classList.add("error-input")
            //  throw "error";

        } else if (dateIni.getTime() > dateEnd.getTime()) {
            inputDateEnd.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg'><p>Please provide a date later than starting date</p></div>"
            );
            inputDateEnd.classList.add("error-input")
            //  throw "error";

        }
    }
}

function clearErrors() {

    var errorMsg = document.querySelectorAll(".error-msg");
    var errorInput = document.querySelectorAll(".error-input");
    for (div of errorMsg) {
        div.remove();
    }
    for (div of errorInput) {
        div.classList.remove("error-input")

    }
}

function parseIsoString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}