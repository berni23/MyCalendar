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
var inputEvent = document.getElementById("event-type");

var btnCreateEvent = document.getElementById("create-event");
var btnCancelEvent = document.getElementById("cancel-event");
btnCreateEvent.addEventListener("click", submitEvent);


var today = new Date();
var currentMonth = monthYear(today.getMonth(), today.getFullYear());
buildMonth(currentMonth, today.getDate())
setDate();

function monthYear(numMonth, year) {

    //var monthObject = new Date(year, numMonth);
    var monthName = months[numMonth];
    return {
        //    monthObject,
        monthName,
        numMonth,
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

function setDate() {
    let d = new Date();
    todaySpan.textContent = daysWeekShort[d.getDay()] + ", " + d.getDate() + " " + monthsShort[d.getMonth()];
    todayTooltiptext.textContent = daysWeek[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}
// populate calendar days
function buildMonth(month, dayInMonth) {

    // dayInMonth only provided if we want to build the current month
    var currentMonth = document.querySelector(".current-month");
    var numCells = month.daysInMonth();

    //Empty cells if month starts at different day than sunday

    for (let i = 0; i < month.firstDayMonthWeekDay(); i++)
        appendBlankCell();

    for (let i = 1; i <= month.daysInMonth(); i++) {

        let day = document.createElement("div");
        day.innerHTML = "<br><span class = 'cell'>" + i + "</span>";
        if (i === dayInMonth) {
            day.classList.add("today-cell");
        }
        currentMonth.appendChild(day);
    }
    var cellsLeft = totalCells - numCells - month.firstDayMonthWeekDay();

    for (let i = 0; i < cellsLeft; i++)
        appendBlankCell();

    function appendBlankCell() {
        let blankCell = document.createElement("div");
        blankCell.innerHTML = "<span><br></span>";
        currentMonth.appendChild(blankCell);
    }

}
/*--------------------------------------
useful functions
------------------------------------*/

function getDaysInMonth(numMonth, year) {
    //Day 0 is the last day in the previous month
    return new Date(year, numMonth, 0).getDate()

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
hasEndDate.addEventListener("click", toggleEndDate);
remindExpire.addEventListener("click", toggleExpire);

function submitEvent() {

    if (validate()) {
        console.log("validate true");
        let newEvent = createEvent();
        let name = monthName(newEvent);
        let monthObject = getMonthObject(name, newEvent);
    }
}

function createEvent() {
    currentEventType = inputEvent.value ? inputEvent.value : "event-other";
    return {
        dateIni: new Date(inputDateIni.value),
        dateEnd: inputDateEnd.value ? new Date(inputDateEnd.value) : null,
        timeReminder: timerRemind.value,
        description: inputEventDescription.value,
        eventType: currentEventType
    }
}

function monthName(event) {
    let monthNum = event.dateIni.getMonth();
    return months[monthNum] + event.dateIni.getFullYear();
}

function getMonthObject(name, event) {
    let year = event.dateIni.getFullYear();
    let monthNum = event.dateIni.getMonth();
    let month = JSON.parse(localStorage.getItem(name));

    if (!month) {
        let lengthMonth = getDaysInMonth(monthNum, year);
        month = populateMonth(lengthMonth);
    }
    console.log("array month", month);
    console.log(name);
    return month;
}


function validate() {
    let validation = true;
    let dateIni = new Date(inputDateIni.value);
    let dateEnd;
    const TitleRegEx = /\b.{1,60}\b/ // literally whatever between 1 and 60 chars
    clearErrors()
    if (!TitleRegEx.test(inputTitle.value)) {
        inputTitle.parentElement.insertAdjacentHTML(
            "beforeend",
            "<div class='error-msg'><p>Title must be between 1 and 60 characters</p></div>"
        );
        inputTitle.classList.add("error-input")
        validation = false;
    }

    if (inputDateIni.value == "" || today.getTime() > dateIni.getTime()) {
        inputDateIni.parentElement.insertAdjacentHTML(
            "beforeend",
            "<div class='error-msg'><p>Date event can't lay in the past or be blank</p></div>"
        );
        inputDateIni.classList.add("error-input")
        validation = false;
    }

    if (hasEndDate.checked) {
        dateEnd = new Date(inputDateEnd.value);

        if (inputDateEnd.value == "") {
            hasEndDate.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg' style ='margin-top:20px'><p>Please provide an end date or uncheck the box</p></div>"
            );
            inputDateEnd.classList.add("error-input")
            validation = false;
        } else if (dateIni.getTime() > dateEnd.getTime()) {
            inputDateEnd.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg'><p>Please provide a date later than starting date</p></div>"
            );
            inputDateEnd.classList.add("error-input")
            validation = false

        }
    }
    if (remindExpire.checked) {
        if (timerRemind.value == "") {
            remindExpire.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg' style ='margin-top:20px'><p>Please provide a time or uncheck the box</p></div>"
            );
            remindExpire.classList.add("error-input")
            validation = false;
        }
    }
    return validation;
}

// UTILS


function toggleEndDate() {
    inputDateEnd.parentElement.classList.toggle("hidden");
}

function toggleExpire() {
    timerRemind.parentElement.classList.toggle("hidden");
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

function populateMonth(len) {
    var array = [];
    for (let i = 0; i < len; i++) {
        array.push([]);
    }
    return array;
}