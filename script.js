//global vars

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var daysWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var daysWeekShort = daysWeek.map(el => el.slice(0, 3));
var monthsShort = months.map(el => el.slice(0, 3));

var mainHeader = document.querySelector(".main-header");
var mainContainer = document.querySelector("main");
var summerIcon = document.getElementById("summer-icon");
var springIcon = document.getElementById("spring-icon");
var autumIcon = document.getElementById("autum-icon");
var winterIcon = document.getElementById("winter-icon");
var calendarContainer = document.querySelector(".calendar-container");
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
var monthLabel = document.querySelector(".month-year");
var infoWindow = document.querySelector(".info-window");
var btnPrevious = document.querySelector(".previous");
var btnNext = document.querySelector(".next");
var modal = document.querySelector(".modal-create-form");
var btnCloseModal = document.getElementById("close-modal");
var btnCloseCheckEvent = document.getElementById("close-check-event");
var eventExpired = document.querySelector(".event-expired");
var listExpired = document.getElementById("list-expired");
var btnExpired = document.getElementById("button-expired");
var reminderWrapper = document.querySelector(".container-reminder");
var modalCheckEvent = document.querySelector(".modal-check-event");
var checkTitle = document.getElementById("check-title");
var checkEventType = document.getElementById("check-event-type");
var checkDate = document.getElementById("check-date");
var checkEndDate = document.getElementById("check-end-date");
var checkDescription = document.getElementById("check-description");
var btnRemoveEvent = document.getElementById("remove-event");
var btnSaveCheckEvent = document.getElementById("save-check-event");

btnRemoveEvent.addEventListener("click", removeEvent);
//btnSaveCheckEvent.addEventListener("click", saveCheckEvent);
btnCloseCheckEvent.addEventListener("click", hideEventInfo);
btnCreateEvent.addEventListener("click", submitEvent);
btnCancelEvent.addEventListener("click", toggleModal);
btnPrevious.addEventListener("click", previousMonth);
btnNext.addEventListener("click", nextMonth);
btnModal.addEventListener("click", toggleModal);
btnCloseModal.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);
document.addEventListener('keydown', handleKeyDown);
todaySpan.addEventListener("click", backToCurrentMonth);
remindExpire.addEventListener("click", toggleExpire);
hasEndDate.addEventListener("click", toggleEndDate);
btnExpired.addEventListener("click", hideWarning);


var today = new Date();
var todayStored; // today's array of events retrieved from local storage
var currentMonth = monthYear(today.getMonth(), today.getFullYear());
var displayedMonth = monthYear(today.getMonth(), today.getFullYear());
var timerCheckEvents;
var season = "summer";

localStorage.clear();
initializeCalendar();

function initializeCalendar() {
    setDate(today);
    buildMonth(displayedMonth);
    checkEventsMonth(getMonthStored(currentMonth));
    timerCheckEvents = setInterval(updateToday, 10000); // to be set at 30 seconds
    // check current events and update "today"

}

function updateToday() {
    newToday = new Date();
    checkEvents(newToday);
    if (newToday.getDate() != today.getDate()) {
        setDate(newToday);
        if (newToday.getMonth() != today.getMonth()) {
            currentMonth = monthYear(newToday.getMonth(), newToday.getFullYear());
            updateCurrentMonth(newToday);
        }
        today = newToday;
    }
}
/*localStorage.setItem(currentMonth.getMonthYear(), JSON.stringify(currentMonthStored))*/
function getMonthStored(month) {
    var monthStored = JSON.parse(localStorage.getItem(month.getMonthYear()));
    if (!monthStored) {
        monthStored = populateMonth(month.daysInMonth());
    }
    return monthStored;

}

function saveMonth(month, name) {
    localStorage.setItem(name, JSON.stringify(month));
}

function checkEventsMonth(monthStored) {
    var windoWarning = false;
    for (let i = 0; i < today.getDate(); i++) {
        var numDay = i + 1;
        var todayEvents = document.querySelectorAll(".day-" + numDay + ">span");
        for (let j = 0; j < monthStored[i].length; j++) {
            var date = new Date(monthStored[i][j].dateIni);
            if (date.getTime() < today.getTime() && !monthStored[i][j].completed) {
                monthStored[i][j].warning = true;
                addWarning(monthStored[i][j], date); // only adding the warning to the html
                todayEvents[j].classList.add("event-warning");
                windoWarning = true;
            }
        }
    }
    if (windoWarning) {
        showWarning()
        saveMonth(monthStored);
    }
}

function checkEvents(currentDay) {
    var windoWarning = false;
    var windowReminder = false;
    var dayNum = currentDay.getDate();
    var todayEvents = document.querySelectorAll(".day-" + dayNum + ">span");
    var monthUpdated = getMonthStored(currentMonth);
    todayStored = monthUpdated[today.getDate() - 1];

    for (let i = 0; i < todayStored.length; i++) {
        let date = new Date(todayStored[i].dateIni);

        let remindMillis = timerRemindMillis(todayStored[i].reminder);
        let reminder = todayStored[i].reminder ? new Date(date.getTime() - remindMillis) : null;
        if (!todayStored[i].completed && currentDay > date && !todayStored[i].warning) {
            todayEvents[i].classList.add("event-warning"); // if we are on another month, this line of code will simply do nothing
            windoWarning = true;
            todayStored[i].warning = true;
            addWarning(todayStored[i], date);
            // display warning, display event in red
        } else if (reminder && !todayStored[i].completed && currentDay > reminder) {
            addReminder(todayStored[i], date);
            todayStored[i].reminder = null;
            windowReminder = true;
        }
    }
    if (windoWarning) {
        showWarning();
    }
    if (windowReminder || windoWarning) {
        monthUpdated[dayNum - 1] = todayStored;
        //console.log(monthUpdated);
        saveMonth(monthUpdated, currentMonth.getMonthYear());
    }
}


function addReminder(event, date) {
    var monthYear = months[date.getMonth()] + date.getFullYear();
    var day = date.getDate();
    reminderWrapper.insertAdjacentHTML("afterbegin", `<div class = "info-reminder show-info"
    style = "position:relative"> <div> <span class = "iconify icon-clock" data-icon = "flat-color-icons:alarm-clock" data-inline = "false"> </span>
    <p> You have an upcoming event in <span class = "minutes-left"> ${event.reminder}</p></div>
    <p> ${event.title}</p> <button id = btn-reminderComplete-${event.id} data-id = ${event.id}
    data-monthyear = ${monthYear} data-day=${day}>Completed </button>
    <button id=btn-reminderClose-${event.id}> Close </button></div>`);
    document.getElementById(`btn-reminderComplete-${event.id}`).addEventListener("click", reminderComplete);
    document.getElementById(`btn-reminderClose-${event.id}`).addEventListener("click", reminderRemoved)
    setTimeout(() => {
        var windowReminder = document.getElementById(`btn-reminderComplete-${event.id}`).parentElement
        if (windowReminder) windowReminder.remove()
    }, 120000);
}

function reminderComplete(event) {
    // on 'event completed' clicked
    eventCompleted(event);
    reminderRemoved(event);
}

function reminderRemoved(event) {
    var windowReminder = document.getElementById(event.target.id).parentElement;
    windowReminder.remove();
}

function addWarning(event, date) {
    //console.log(date.getMonth())
    var monthYear = months[date.getMonth()] + date.getFullYear();
    var day = date.getDate();
    listExpired.insertAdjacentHTML("afterbegin", `<li ><span>${event.title}</span> <input id = warning-${event.id} data-id =${event.id}
    data-monthyear=${monthYear} data-day=${day} type = "checkbox" class ="checkbox-warning"><br></li> `);
    document.getElementById(`warning-${event.id}`).addEventListener("click", removeWarning);
}

function removeWarning(event) {
    if (event.target.checked) {
        var id = event.target.dataset.id;
        document.getElementById(id).classList.remove("event-warning");
        eventCompleted(event);
        document.getElementById(event.target.id).parentElement.remove();
    }
}

function eventCompleted(event) {
    var id = event.target.dataset.id;
    var nameMonth = event.target.dataset.monthyear;
    var day = event.target.dataset.day;
    var arrayMonth = JSON.parse(localStorage.getItem(nameMonth));
    var eventList = arrayMonth[day - 1];
    for (let i = 0; i < eventList.length; i++) {
        if (eventList[i].id == id) {
            eventList[i].completed = true;
            eventList[i].warning = false;
        }
    }
    arrayMonth[day - 1] = eventList;
    localStorage.setItem(nameMonth, JSON.stringify(arrayMonth));
}

function monthYear(numMonthIni, yearIni) {
    var monthObject = new Date(yearIni, numMonthIni);
    return {
        //   monthObject,
        getMonthYear() {
            return months[monthObject.getMonth()] + monthObject.getFullYear();
        },
        getMonthName() {
            return months[monthObject.getMonth()];
        },
        getNumMonth() {
            return monthObject.getMonth();
        },
        getYear() {
            return monthObject.getFullYear();
        },
        daysInMonth() {
            return getDaysInMonth(monthObject.getMonth(), monthObject.getFullYear());
        },
        firstDayMonthWeekDay() {
            return firstDayMonth(monthObject.getMonth(), monthObject.getFullYear());
        },
        toIso() {
            return d.toISOString();
        },
        addMonth(n) {
            monthObject.setMonth(monthObject.getMonth() + n);
        }
    }
}
// set current date
function setDate(d) {
    todaySpan.textContent = daysWeekShort[d.getDay()] + ", " + d.getDate() + " " + monthsShort[d.getMonth()];
    todayTooltiptext.textContent = daysWeek[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}

function buildMonth(month) {
    clearCalendar();
    monthLabel.textContent = month.getMonthName() + " " + month.getYear();
    var numCells = month.daysInMonth();
    var cellsLeft = totalCells - numCells - month.firstDayMonthWeekDay();
    var monthStored = JSON.parse(localStorage.getItem(month.getMonthYear()));
    var dayInMonth;
    seasonClass(month.getNumMonth());
    if (currentMonth.getMonthYear() === month.getMonthYear()) {
        dayInMonth = today.getDate();
    }
    //Empty cells if month starts at different day than sunday
    for (let i = 0; i < month.firstDayMonthWeekDay(); i++)
        appendBlankCell();
    if (monthStored) {
        for (let i = 0; i < numCells; i++) {
            day = createDayContainer(i);
            var eventContainer = document.createElement("div");
            eventContainer.classList.add("event-wrapper");
            eventContainer.id = "day-" + (i + 1);
            for (event of monthStored[i]) {
                eventContainer.appendChild(displayEvent(event));
                eventContainer.insertAdjacentHTML('beforeend', '<br>');
            }
            day.appendChild(eventContainer);
            calendarContainer.appendChild(day);
        }
    } else {
        for (let i = 0; i < numCells; i++) {
            day = createDayContainer(i);
            calendarContainer.appendChild(day);
            var eventContainer = document.createElement("div");
            eventContainer.classList.add("event-wrapper");
            eventContainer.id = "day-" + (i + 1);
            day.appendChild(eventContainer);
            calendarContainer.appendChild(day);
        }
    }
    for (let i = 0; i < cellsLeft; i++)
        appendBlankCell();

    function appendBlankCell() {
        let blankCell = document.createElement("div");
        blankCell.classList.add("empty-cell");
        blankCell.innerHTML = "<span><br></span>";
        calendarContainer.appendChild(blankCell);
    }

    function createDayContainer(n) {
        n++;
        let day = document.createElement("div");
        day.classList.add("cell");
        day.setAttribute("data-daynum", n);
        day.addEventListener("click", toggleModalDay);
        day.innerHTML = "<br><span>" + n + "</span>";
        if (n === dayInMonth && dayInMonth) {
            day.classList.add("today-cell");
        }
        return day;
    }

    // populate calendar days
    function seasonClass(numMonth) {
        mainHeader.classList.remove(season);
        mainContainer.classList.remove(season);
        if (numMonth < 2 || numMonth == 11) season = "winter";
        else if (numMonth > 7) season = "autum";
        else if (numMonth > 4 && numMonth < 8) season = "summer";
        else season = "spring";
        mainHeader.classList.add(season);
        mainContainer.classList.add(season);
    }
}

function displayEvent(event) {

    var newElement = document.createElement("span");
    newElement.textContent = event.title;
    newElement.classList.add("default-event");
    newElement.id = String(event.id);
    newElement.classList.add(event.eventType);
    newElement.addEventListener("click", showEventInfo);
    if (event.warning) {
        newElement.classList.add("event-warning");
    }
    return newElement;
}
/* navigate through months*/

function previousMonth() {
    displayedMonth.addMonth(-1);
    buildMonth(displayedMonth);
}

function nextMonth() {
    displayedMonth.addMonth(1);
    buildMonth(displayedMonth);
}
/* back to current month if current date is clicked*/
function backToCurrentMonth() {
    if (!(currentMonth.getMonthYear() === displayedMonth.getMonthYear())) {
        displayedMonth = monthYear(today.getMonth(), today.getFullYear());
        buildMonth(displayedMonth);
    }
}

/*function handleWarning() {
    var warningEvents = document.querySelectorAll(" .event-expired li");
    for (let i = 0; i < warningEvents.length; i++) {}
}
*/

/*
-------------------------
Form, validation function
--------------------------
*/

function submitEvent() {
    if (validate()) {
        var newEvent = createEvent();
        var name = monthNameEvent(newEvent);
        var monthArray = getMonthObject(name, newEvent);
        localStorage.setItem(name, JSON.stringify(monthArray));
        toggleModal();
        infoWindow.textContent = "Event successfully created!!"
        toggleInfoWindow();
        setTimeout(toggleInfoWindow, 1500);
        if (name == currentMonth.getMonthYear()) {
            var eventWrapper = document.querySelector("#day-" + newEvent.dateIni.getDate());
            eventWrapper.appendChild(displayEvent(newEvent));
            eventWrapper.insertAdjacentHTML('beforeend', '<br>');
        }
        clearForm();
    }
    //let month = JSON.parse(localStorage.getItem(name));
}
/* create event */
function createEvent() {
    var currentEventType = inputEvent.value ? inputEvent.value : "event-other";
    var titleEvent = inputTitle.value;
    var descriptionEvent = inputEventDescription.value;
    var eventId = idEvent();
    return {
        id: eventId,
        title: titleEvent.trim(),
        dateIni: new Date(inputDateIni.value),
        dateEnd: inputDateEnd.value ? new Date(inputDateEnd.value) : null,
        reminder: timerRemind.value,
        description: descriptionEvent.trim(),
        eventType: currentEventType,
        completed: false,
        warning: false
    }
}

function getMonthObject(name, event) {
    let year = event.dateIni.getFullYear();
    let monthNum = event.dateIni.getMonth();
    let month = JSON.parse(localStorage.getItem(name));
    let day = event.dateIni.getDate();

    if (!month) {
        month = populateMonth(getDaysInMonth(monthNum, year));
    }
    month[day - 1].push(event);
    return month;
}
/* validate form*/
function validate() {
    let validation = true;
    let dateIni = new Date(inputDateIni.value);
    let dateEnd;
    var TitleRegEx = /\b.{1,60}\b/ // literally whatever between 1 and 60 chars
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
        inputDateIni.classList.add("error-input");
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
            inputDateEnd.classList.add("error-input");
            validation = false;
        }
    }
    if (remindExpire.checked) {
        if (timerRemind.value == "") {
            remindExpire.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg' style ='margin-top:20px'><p>Please provide a time or uncheck the box</p></div>"
            );
            remindExpire.classList.add("error-input");
            validation = false;
        }
    }

    if (inputEventDescription.textContent.length > 500) {
        inputEventDescription.parentElement.insertAdjacentHTML(
            "afterend",
            "<div class='error-msg' style ='margin-top:85px'><p>The description must have a maximum of 500 characters</p></div>"
        );
        inputEventDescription.classList.add("error-input");
        validation = false;
    }
    return validation; // true if validation passed, else false
}


/* modal  logic */

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function toggleModalDay(event) {
    if (!event.target.classList.contains("default-event")) {
        toggleModal();
        var d = new Date(displayedMonth.getYear(), displayedMonth.getNumMonth(), event.currentTarget.dataset.daynum, 9, 0);
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, -8);
        inputDateIni.value = localISOTime;
    }

}

function toggleInfoWindow() {
    infoWindow.classList.toggle("show-info");
}

function showWarning() {
    eventExpired.classList.add("show-info");
}

function hideWarning() {
    eventExpired.classList.remove("show-info");
}

function windowOnClick(event) {
    if (event.target === modal) toggleModal();
    else if (event.target == modalCheckEvent) hideEventInfo;

}



/* Modal on event clicked*/

function showEventInfo(event) {
    modalCheckEvent.classList.add("show-info");
    var id = event.currentTarget.id;
    checkTitle.textContent = event.currentTarget.textContent;
    checkTitle.dataset.id = id;
    var day = event.target.parentElement.parentElement.getAttribute("data-daynum");
    checkTitle.dataset.day = day;
    var storedMonth = JSON.parse(localStorage.getItem(displayedMonth.getMonthYear()));
    var storedDay = storedMonth[day - 1];
    for (let i = 0; i < storedDay.length; i++) {
        if (storedDay[i].id == id) {
            checkDescription.textContent = storedDay[i].description;
            checkDate.textContent = isoToReadable(storedDay[i].dateIni);
            var eventType = storedDay[i].eventType;
            if (eventType == "event-other") {
                eventType = "General";
            }
            checkEventType.textContent = eventType;
            checkTitle.classList.add(eventType + "-event");
            if (storedDay[i].dateEnd) {
                checkEndDate.textContent = isoToReadable(storedDay[i].dateEnd);
            } else {
                checkEndDate.textContent = "No end date provided";
            }
        }
    }
}

function hideEventInfo() {
    modalCheckEvent.classList.remove("show-info");
}

function removeEvent() {
    var id = checkTitle.dataset.id;
    var day = checkTitle.dataset.day;
    var storedMonth = JSON.parse(localStorage.getItem(displayedMonth.getMonthYear()));
    var storedDay = storedMonth[day - 1];

    //  1- remove month from local storage
    for (let i = 0; i < storedDay.length; i++) {
        if (id == storedDay[i].id) {
            storedDay.splice(storedDay[i], 1);
        }
    }
    storedMonth[day - 1] = storedDay;
    localStorage.setItem(displayedMonth.getMonthYear(), JSON.stringify(storedMonth));

    // 2-  remove event label on calendar
    var eventWrapper = document.getElementById("day-" + day);
    console.log(day);
    for (let i = 0; i < eventWrapper.children.length; i++) {
        if (eventWrapper.children[i].id == id) {
            eventWrapper.children[i + 1].remove();
            eventWrapper.children[i].remove();
        }
    }

    hideEventInfo();
}

/*function saveCheckEvent() {
    var description = checkDescription.textContent;

}

/*var modalCheckEvent = document.querySelector(".modal-check-event");
var checkTitle = document.getElementById("check-title");
var checkEventType = document.getElementById("check-event-type");
var checkDate = document.getElementById("check-date");
var checkEndDate = document.getElementById("check-end-date");
var checkDescription = document.getElementById("check-description");

*/


*/
/*--------------------------------------
            UTILS
------------------------------------*/

/* clear functions*/

function clearCalendar() {
    calendarContainer.textContent = "";
}

function clearForm() {
    inputTitle.value = "";
    timerRemind.value = "";
    inputEventDescription.textContent = "";

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

function timerRemindMillis(value) {
    var millis = 300000; // five min
    switch (value) {
        case "5 min": {
            break;
        }
        case "10 min": {
            millis *= 2;
            break;
        }
        case "15 min": {

            millis *= 3;
            break;
        }
        case "30 min": {
            millis *= 6;
        }

        case "1 hour": {
            millis *= 12;
            break;
        }
        default: {
            millis = null;
            break;
        }
    }
    return millis;
}

function monthNameEvent(event) {
    let monthNum = event.dateIni.getMonth();
    return months[monthNum] + event.dateIni.getFullYear();
}

function isoToReadable(isoDate) {
    var date = new Date(isoDate);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month;
    if (hours < 10) hours = "0" + hours;
    //if (hours == "00") hours = "12";
    //else if (hours == "12") hours = "00";
    if (minutes < 10) minutes = "0" + minutes;
    var stringDate = month + "/" + day + "/" + date.getFullYear() + "  at " + hours + ":" + minutes;
    return stringDate;
}

function handleKeyDown(event) {
    if (event.keyCode === 27) { // hide modal on esc key pressed
        modal.classList.remove("show-modal");
        hideEventInfo();
    }
}

function getDaysInMonth(numMonth, year) {
    //Day 0 is the last day in the previous month
    return new Date(year, numMonth + 1, 0).getDate()
}

function firstDayMonth(month, year) {
    return new Date(year, month, 1).getDay();
}

function toggleEndDate() {
    inputDateEnd.parentElement.classList.toggle("hidden");
}

function toggleExpire() {
    timerRemind.parentElement.classList.toggle("hidden");
}

function idEvent() {
    return Math.floor(Math.random() * Math.floor(10000000)); // 1 in ten millions
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