var currentDate = new Date();

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var daysWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var daysWeekShort = daysWeek.map(el => el.slice(0, 3));
var monthsShort = months.map(el => el.slice(0, 3));


var stringDays = document.querySelector(".string-days");
var today = document.querySelector(".today");
var tooltiptext = document.querySelector(".tooltiptext");

console.log(today);
var d = new Date();
var date = d.getDate(); // day in the month
var month = d.getMonth();
var year = d.getFullYear();
var day = d.getDay()
var dayWeek = daysWeek[day];


var dateStr = dayWeek + ", " + date + "  " + month + "  " + year;

today.textContent = daysWeekShort[day] + ", " + date + " " + monthsShort[month];
tooltiptext.textContent = daysWeek[day] + ", " + date + " " + months[month] + " " + year;