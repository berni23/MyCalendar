var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var daysWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var daysWeekShort = daysWeek.map(el => el.slice(0, 3));
var monthsShort = months.map(el => el.slice(0, 3));

var stringDays = document.querySelector(".string-days");
var todaySpan = document.querySelector(".today-caption");
var todayTooltiptext = document.querySelector(".tooltiptext");

var btnModal = document.getElementById("add-event");
const totalCells = 42;

function currentDate() {

    var d = new Date();
    var date = d.getDate(); // day in the month
    var numMonth = d.getMonth();
    var month = months[numMonth];
    var year = d.getFullYear();
    var day = d.getDay() // day in the week
    var dayWeek = daysWeek[day];
    var dayWeekShort = daysWeekShort[day];
    var monthShort = monthsShort[numMonth];
    return {
        day,
        date,
        setDate() {
            todaySpan.textContent = dayWeekShort + ", " + date + " " + monthShort;
            todayTooltiptext.textContent = dayWeek + ", " + date + " " + month + " " + year;
        },
        daysInMonth() {
            return getDaysInMonth(numMonth, year);
        },
        firstDayMonthWeekDay() {
            return firstDayMonth(numMonth, year);
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
    if (i === today.date) {
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
        // toggleModal();
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