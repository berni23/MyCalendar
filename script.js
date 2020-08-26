// main containers and buttons
var mainHeader = document.querySelector(".main-header");
var mainContainer = document.querySelector("main");
var calendarContainer = document.querySelector(".calendar-container");
var stringDays = document.querySelector(".string-days");
var todaySpan = document.querySelector(".today-caption");
var todayTooltiptext = document.querySelector(".tooltiptext");
var monthLabel = document.querySelector(".month-year");

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

//Navigate through months
var btnPrevious = document.querySelector(".previous");
var btnNext = document.querySelector(".next");

//Modal for event creation
var btnModal = document.getElementById("add-event");
var modal = document.querySelector(".modal-create-form");
var btnCloseModal = document.getElementById("close-modal");

//On event expired
var eventExpired = document.querySelector(".event-expired");
var listExpired = document.getElementById("list-expired");
var btnExpired = document.getElementById("button-expired");

//Info displayed on event clicked
var infoWindow = document.querySelector(".info-window");
var modalCheckEvent = document.querySelector(".modal-check-event");
var checkTitle = document.getElementById("check-title");
var checkEventType = document.getElementById("check-event-type");
var checkDate = document.getElementById("check-date");
var checkEndDate = document.getElementById("check-end-date");
var checkReminder = document.getElementById("check-reminder");
var checkStatus = document.getElementById("check-status");
var checkDescription = document.getElementById("check-description");
var btnSaveCheckEvent = document.getElementById("save-check-event");
var btnCloseCheckEvent = document.getElementById("close-check-event");

//Remove event
var btnRemoveEvent = document.getElementById("remove-event");
var windowRemoveEvent = document.querySelector(".remove-window")
var btnRemoveContinue = document.getElementById("remove-continue");
var btnRemoveCancel = document.getElementById("remove-cancel");

//Reminder
var reminderWrapper = document.querySelector(".container-reminder");

//Calendar options and functionalities
btnRemoveEvent.addEventListener("click", askRemove);
btnRemoveContinue.addEventListener("click", removeEvent);
btnRemoveCancel.addEventListener("click", hideAskRemove);
btnSaveCheckEvent.addEventListener("click", saveCheckEvent);
btnCloseCheckEvent.addEventListener("click", hideEventInfo);
btnCreateEvent.addEventListener("click", submitEvent);
btnCancelEvent.addEventListener("click", cancelEvent);
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

//Global vars
var today = new Date();
var currentMonth = monthYear(today.getMonth(), today.getFullYear());
var displayedMonth = monthYear(today.getMonth(), today.getFullYear());
var timerCheckEvents;
var season = "summer";
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var daysWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var daysWeekShort = daysWeek.map(el => el.slice(0, 3));
var monthsShort = months.map(el => el.slice(0, 3));
const totalCells = 42;


/*---------------------
INITIALIZE CALENDAR
----------------------*/

initializeCalendar();


function initializeCalendar() {
    setDate(today);
    buildMonth(displayedMonth);
    checkEventsMonth(getMonthStored(currentMonth));
    timerCheckEvents = setInterval(updateToday, 10000);
}

/*-----------------------------------------------------------------------
Update current day and check for changes made by the user every 10 seconds
-------------------------------------------------------------------------*/

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

/*-----------------------------------------------------------------------------------------------
check each event on current day to see if it has expired or if the reminder should be activated
--------------------------------------------------------------------------------------------------*/

function checkEvents(currentDay) {
    var windoWarning = false;
    var windowReminder = false;
    var dayNum = currentDay.getDate();
    var todayEvents = document.querySelectorAll("#day-" + dayNum + ">span");
    var monthUpdated = getMonthStored(currentMonth);
    var todayStored = monthUpdated[currentDay.getDate() - 1];

    for (let i = 0; i < todayStored.length; i++) {
        var date = new Date(todayStored[i].dateIni);
        var reminderMillis = date.getTime() - timerRemindMillis(todayStored[i].reminder);
        if (!todayStored[i].completed && currentDay.getTime() > date.getTime() && !todayStored[i].warning) {

            todayEvents[i].classList.add("event-warning"); // if we are on another month, this line of code will simply do nothing
            windoWarning = true;
            todayStored[i].warning = true;
            addWarning(todayStored[i], date);
            // display warning, display event in red
        } else if (!todayStored[i].reminderDisplayed && !todayStored[i].completed && currentDay.getTime() > reminderMillis) {

            addReminder(todayStored[i], date);
            todayStored[i].reminderDisplayed = true;
            windowReminder = true;
        }
        if (windoWarning) {
            showWarning();
        }
        if (windowReminder || windoWarning) {
            monthUpdated[dayNum - 1] = todayStored;
            saveMonth(monthUpdated, currentMonth.getMonthYear());
        }
    }

}

/* --------------------------------------------------------------

Function only called when user opens or refreshes the calendar,
which checks the status of the events from the beginning of the month

---------------------------------------------------------------- */

function checkEventsMonth(monthStored) {
    var windoWarning = false;
    for (let i = 0; i < today.getDate(); i++) {
        var numDay = i + 1;
        var todayEvents = document.querySelectorAll("#day-" + numDay + ">span");
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

/* ----------------------------------------------

LOGIC FOR BUILDING THE CALENDAR

-----------------------------------------------*/

// Storage  logic  and data retrieve based on 'month-year' objects. For instance August2020,September2020,....

function monthYear(numMonthIni, yearIni) {
    var monthObject = new Date(yearIni, numMonthIni);
    return {
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

// Setting one of the header spans as the current day, including a tooltip with more precise info about the day and monthç

function setDate(d) {
    todaySpan.textContent = daysWeekShort[d.getDay()] + ", " + d.getDate() + " " + monthsShort[d.getMonth()];
    todayTooltiptext.textContent = daysWeek[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}

// Actual function in charge of building the month in the html when a 'monthYear' object is given to it

function buildMonth(month) {
    clearCalendar();
    monthLabel.textContent = month.getMonthName() + " " + month.getYear();
    var numCells = month.daysInMonth();
    var cellsLeft = totalCells - numCells - month.firstDayMonthWeekDay();
    var monthStored = JSON.parse(localStorage.getItem(month.getMonthYear()));
    var dayInMonth;
    seasonClass(month.getNumMonth());
    if (currentMonth.getMonthYear() === month.getMonthYear()) dayInMonth = today.getDate();
    //Empty cells if month starts at different day than sunday
    for (let i = 0; i < month.firstDayMonthWeekDay(); i++) appendBlankCell();
    if (monthStored) {
        for (let i = 0; i < numCells; i++) {
            day = createDayContainer(i);
            var eventContainer = document.createElement("div");
            eventContainer.classList.add("event-wrapper");
            eventContainer.id = "day-" + (i + 1);
            for (let j = 0; j < monthStored[i].length; j++) {
                if (eventContainer.children.length == 8) {
                    eventContainer.insertAdjacentHTML('beforeend', '<br class = "extra-break">');
                }
                eventContainer.appendChild(displayEvent(monthStored[i][j]));
                eventContainer.insertAdjacentHTML('beforeend', '<br>');
            }
            day.addEventListener("mouseover", windowEventList);
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

            day.addEventListener("mouseover", windowEventList);
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

    // Populate calendar days

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

// Function in charge of displaying a single event on the calendar based on the 'createEvent' object

function displayEvent(event) {
    var newElement = document.createElement("span");
    newElement.classList.add("display-events");
    var date = new Date(event.dateIni);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    newElement.textContent = event.title + " - " + hours + ":" + minutes;
    newElement.classList.add("default-event");
    newElement.id = String(event.id);
    newElement.classList.add(event.eventType);
    newElement.addEventListener("click", showEventInfo);
    if (event.warning) {
        newElement.classList.add("event-warning");
    }

    if (event.completed) {
        newElement.classList.add("event-completed");
    }
    return newElement;
}

/* --------------------------------
REMINDER LOGIC
----------------------------------*/

//Add a reminder in the reminder wrapper. function call  in the 'checkEvents' function .
function addReminder(event, date) {
    var monthYear = months[date.getMonth()] + date.getFullYear();
    var day = date.getDate();
    reminderWrapper.insertAdjacentHTML("afterbegin", `<div class = "info-reminder show-info"
    style = "position:relative"> <div> <span class = "iconify icon-clock" data-icon = "flat-color-icons:alarm-clock" data-inline = "false"> </span>
    <p> You have an upcoming event in <span class = "minutes-left"> ${event.reminder}</p></div>
    <p>${event.title}</p> <button id = 'btn-reminderComplete-${event.id}' data-id = '${event.id}'
    data-monthyear = '${monthYear}' data-day='${day}'>Completed </button>
    <button id=btn-reminderClose-${event.id}> Close </button></div>`);
    document.getElementById(`btn-reminderComplete-${event.id}`).addEventListener("click", reminderComplete);
    document.getElementById(`btn-reminderClose-${event.id}`).addEventListener("click", reminderRemoved)
    setTimeout(function () {
        var windowReminder = document.getElementById(`btn-reminderComplete-${event.id}`).parentElement
        if (windowReminder) {
            windowReminder.remove()
        }
    }, 120000);
}

/* If the user clicks on 'complete' in the reminder, the event status changes to 'complete',
deleting the remind message and updating the object in the local storage. */

function reminderComplete(event) {
    // on 'event completed' clicked
    var id = event.target.dataset.id;
    var displayedEvent = document.getElementById(id)
    displayedEvent.classList.add("event-completed");
    eventCompleted(event.target, reminder = true);

}

function reminderRemoved(event) {
    event.parentElement.remove();
}

/*------------------------------------
EVENT EXPIRED, WARNING LOGIC
---------------------------------------*/

function addWarning(event, date) {
    var monthYear = months[date.getMonth()] + date.getFullYear();
    var day = date.getDate();
    listExpired.insertAdjacentHTML("afterbegin", `<li ><span>${event.title}</span> <input id = warning-${event.id} data-id =${event.id}
    data-monthyear=${monthYear} data-day=${day} type = "checkbox" class ="checkbox-warning"><br></li> `);
    document.getElementById(`warning-${event.id}`).addEventListener("click", removeWarning);
}

function removeWarning(event) {
    if (event.target.checked) {
        var id = event.target.dataset.id;
        var displayedEvent = document.getElementById(id)
        displayedEvent.classList.remove("event-warning");
        displayedEvent.classList.add("event-completed");
        eventCompleted(event.target);
        document.getElementById(event.target.id).parentElement.remove();
    }
}

//Routine for event completed, both used by warning or reminders

function eventCompleted(event, reminder = false) {
    var id = event.dataset.id;
    var nameMonth = event.dataset.monthyear;
    var day = event.dataset.day;
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

    if (reminder) {
        reminderRemoved(event);

    }
}

/* If there are more than four events in one day  ,only the first four will be displayed.
 If we hover on the event container, all of the events will be displayed */

var noWindow = true;

function windowEventList(event) {
    if (noWindow) {
        var eventWrapper = document.getElementById("day-" + event.currentTarget.dataset.daynum);
        if (eventWrapper.children.length > 8) {
            noWindow = false;
            event.currentTarget.classList.add("day-wrap");
            event.currentTarget.removeEventListener("mouseover", windowEventList);
            event.currentTarget.addEventListener("mouseout", removeEventList);

        }
    }
}

// remove event list if we do not hover the day any more

function removeEventList(event) {
    noWindow = true;
    event.currentTarget.classList.remove("day-wrap");
    event.currentTarget.addEventListener("mouseover", windowEventList);
    event.currentTarget.removeEventListener("mouseout", removeEventList);
}

/* --------------------------------
NAVIGATION THROUGH MONTHS
-----------------------------------*/

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

/*
------------------------------------
EVENT CREATION AND EVENT VALIDATION
-----------------------------------
*/

// function called when user creates an event after having filled the event form

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
        if (name == displayedMonth.getMonthYear()) {
            var eventWrapper = document.querySelector("#day-" + newEvent.dateIni.getDate());
            eventWrapper.innerHTML = "";
            var events = monthArray[newEvent.dateIni.getDate() - 1];
            for (let i = 0; i < events.length; i++) {
                if (eventWrapper.children.length == 8) {
                    eventWrapper.insertAdjacentHTML('beforeend', '<br class = "extra-break">');
                }
                eventWrapper.appendChild(displayEvent(events[i]));
                eventWrapper.appendChild(document.createElement('br'));
            }
        }
        clearForm();
        clearErrors();
    }
}

// create event object
function createEvent() {
    var currentEventType = inputEvent.value ? inputEvent.value : "event-other";
    var titleEvent = inputTitle.value;
    var descriptionEvent = inputEventDescription.value;
    var initialDate = new Date(inputDateIni.value);
    var eventId = idEvent();
    var Rdisplayed = true;
    if (timerRemind.value) Rdisplayed = false;
    return {
        id: eventId,
        title: titleEvent.trim(),
        dateIni: initialDate,
        millis: initialDate.getTime(),
        reminderDisplayed: Rdisplayed,
        dateEnd: inputDateEnd.value ? new Date(inputDateEnd.value) : null,
        reminder: timerRemind.value,
        description: descriptionEvent.trim(),
        eventType: currentEventType,
        completed: false,
        warning: false
    }
}

/* Function for getting the month from localstorage if it exists, and if not ( first time creating an event in a given month)
create the month and store it */

function getMonthObject(name, event) {
    let year = event.dateIni.getFullYear();
    let monthNum = event.dateIni.getMonth();
    let month = JSON.parse(localStorage.getItem(name));
    let day = event.dateIni.getDate();
    if (!month) {
        month = populateMonth(getDaysInMonth(monthNum, year));
    }
    month[day - 1].push(event);
    let daySorted = month[day - 1].sort(compareDateIni);
    month[day - 1] = daySorted;
    return month;
}

/*--------------------------------------
VALIDATION LOGIC
-----------------------------------------*/

function validate() {
    let validation = true;
    let dateIni = new Date(inputDateIni.value);
    let dateEnd;
    var TitleRegEx = /\b.{1,60}\b/ // literally whatever between 1 and 60 chars
    clearErrors();
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
        var dateRemind = new Date();
        dateRemind.setTime(dateRemind.getTime() + timerRemindMillis(timerRemind.value));
        if (timerRemind.value == "") {
            remindExpire.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg' style ='margin-top:20px'><p>Please provide a time or uncheck the box</p></div>"
            );
            remindExpire.classList.add("error-input");
            validation = false;


        } else if (dateRemind.getTime() > dateIni.getTime()) {
            timerRemind.parentElement.insertAdjacentHTML(
                "beforeend",
                "<div class='error-msg' style ='margin-top:25px; margin-right:5px;'><p>The event is scheduled sooner than in " + timerRemind.value + "</p></div>"
            );
            timerRemind.classList.add("error-input");
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

/* ---------------------------------------

Show and hide windows, toggle functionality

--------------------------------------*/

function cancelEvent() {
    clearErrors();
    toggleModal();
}

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
    else if (event.target == modalCheckEvent) hideEventInfo();

}

/* ------------------------------------------

Populate fields with stored information, on event clicked

--------------------------------------------------*/

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
            if (eventType == "event-other") eventType = "General";
            checkEventType.textContent = eventType;
            checkTitle.classList.add(eventType + "-event");
            if (storedDay[i].dateEnd) checkEndDate.textContent = isoToReadable(storedDay[i].dateEnd);
            else checkEndDate.textContent = "No end date provided";
            if (storedDay[i].reminder) checkReminder.textContent = storedDay[i].reminder + " in advance";
            else checkReminder.textContent = "No reminder";
            if (storedDay[i].completed) checkStatus.textContent = "Completed";
            else checkStatus.textContent = "Pending";
        }
    }
}

function hideEventInfo() {
    modalCheckEvent.classList.remove("show-info");
}

function askRemove() {
    showAskRemove();
}

/* Remove an event*/

function removeEvent() {
    hideEventInfo();
    hideAskRemove();
    var id = checkTitle.dataset.id;
    var day = checkTitle.dataset.day;
    var storedMonth = JSON.parse(localStorage.getItem(displayedMonth.getMonthYear()));
    var storedDay = storedMonth[day - 1];

    //  1- remove event from local storage
    for (let i = 0; i < storedDay.length; i++) {
        if (id == storedDay[i].id) {
            storedDay.splice(storedDay[i], 1);
        }
    }
    storedMonth[day - 1] = storedDay;
    localStorage.setItem(displayedMonth.getMonthYear(), JSON.stringify(storedMonth));

    // 2-  remove event label on calendar
    var eventWrapper = document.getElementById("day-" + day);
    for (let i = 0; i < eventWrapper.children.length; i++) {
        if (eventWrapper.children[i].id == id) {
            eventWrapper.children[i + 1].remove();
            eventWrapper.children[i].remove();
        }
    }
    if (eventWrapper.children.length == 9) {
        document.querySelector("#day-" + day + " .extra-break").remove();
    }
    hideEventInfo();
    hideAskRemove();
    toggleInfoWindow();
    infoWindow.textContent = "Event succesfully removed";
    setTimeout(toggleInfoWindow, 1500);
}

/*----------------------------

Save updated information we have changed from the event ( only the description)

----------------------------*/

function saveCheckEvent() {
    var description = checkDescription.textContent;
    var id = checkTitle.dataset.id;
    var day = checkTitle.dataset.day;
    var storedMonth = JSON.parse(localStorage.getItem(displayedMonth.getMonthYear()));
    var storedDay = storedMonth[day - 1];

    for (let i = 0; i < storedDay.length; i++) {
        if (id == storedDay[i].id) {
            storedDay[i].description = description;
        }
    }
    storedMonth[day - 1] = storedDay;
    localStorage.setItem(displayedMonth.getMonthYear(), JSON.stringify(storedMonth));
    hideEventInfo();
}

/*--------------------------------------
            UTILS
------------------------------------*/

/*------------------------------------
Deal with the local storage
---------------------------------------------*/

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

/*---------------------------
Clear functions for the calendar, the form inputs and the form errors
----------------------------*/

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
        div.classList.remove("error-input");
    }
}

/* translate reminder strings into milliseconds*/

function timerRemindMillis(value) {
    var millis = 300000; // five min
    switch (value) {
        case "5 minutes":
            break;
        case "10 minutes": {
            millis *= 2;
            break;
        }
        case "15 minutes": {
            millis *= 3;
            break;
        }
        case "30 minutes": {
            millis *= 6;
            break;
        }
        case "1 hour": {
            millis = "3600000"
            break;
        }
        default: {
            millis = null;
            break;
        }
    }
    return millis;
}

/* get the name  of the monthYear object corresponding to a given event ( for local storage update or retrieve)*/

function monthNameEvent(event) {
    let monthNum = event.dateIni.getMonth();
    return months[monthNum] + event.dateIni.getFullYear();
}

/* switch  date from iso format to human readable (month/day/yeat at hours:minutes ) */

function isoToReadable(isoDate) {
    var date = new Date(isoDate);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    var stringDate = month + "/" + day + "/" + date.getFullYear() + "  at " + hours + ":" + minutes;
    return stringDate;
}

/* handle escape key to close modals*/

function handleKeyDown(event) {
    if (event.keyCode === 27) { // hide modal on esc key pressed
        modal.classList.remove("show-modal");
        hideEventInfo();
    }
}

/* number of days in a month*/
function getDaysInMonth(numMonth, year) {
    //Day 0 is the last day in the previous month
    return new Date(year, numMonth + 1, 0).getDate()
}

/* first day of the month*/
function firstDayMonth(month, year) {
    return new Date(year, month, 1).getDay();
}

/* toggle for enabling user to set an end date in case the ' end date' checkbox is checked*/
function toggleEndDate() {
    inputDateEnd.parentElement.classList.toggle("hidden");
}

/* toggle for enabling user to set reminder time in case the 'timer-remind' checkbox is checked*/

function toggleExpire() {
    timerRemind.parentElement.classList.toggle("hidden");
}

/* if user decides to remove an event, he/she is asked once again to confirm the operation ( as  such action can not be reversed)*/

function showAskRemove() {
    windowRemoveEvent.classList.add("show-info");
    windowRemoveEvent.style.zIndex = 5;
}

/* cancel the removing operation */

function hideAskRemove() {

    windowRemoveEvent.classList.remove("show-info");
    windowRemoveEvent.style.zIndex = 1;
}

/* create a random id for an event*/
function idEvent() {
    return Math.floor(Math.random() * Math.floor(10000000)); // 1 in ten millions
}

/* populare an empty month with as many sub-arrays as days in it*/

function populateMonth(len) {
    var array = [];
    for (let i = 0; i < len; i++) {
        array.push([]);
    }
    return array;
}
/* sorting events based on their initial date*/

function compareDateIni(event1, event2) {

    if (event1.millis < event2.millis) {
        return -1;
    }
    if (event1.millis > event2.millis) {
        return 1;
    }
    return 0;
}