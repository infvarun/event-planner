
const today = new Date();
const date = today.getDate();
const year = today.getFullYear();
const month = today.getMonth();
const day = today.getDay();

const startDate = new Date(`January, ${year}`);
const startMonth = startDate.getMonth();
const startDay = startDate.getDay();

const yearCal = [];
//Save events
const eventSaved = new Map();

let allMonths;
let sameMonthInLoop = false;
let nextMonthStartWeekDay = -1;
// Month and days object
const calendar = {
        January:31,
        February:0, 
        March:31, 
        April:30, 
        May:31, 
        June:30, 
        July:31, 
        August:31, 
        September:30,
        October:31, 
        November:30, 
        December:31
};

/**
 * Generate latest calendar for all month
 */
(function init() {
    // Set feb days based on leap year
    setFebForLeap();
    // Set webpage title with current year
    setPageTitle();
    // Get all relevant localStorage Data
    getAllEventsFromLocalStorage();

    // populate allMonths array with month name and generate monthly calendar array in yearCal[]
    allMonths = Object.keys(calendar);
    allMonths.forEach((cur)=>{
        yearCal.push(generateMonthCal(cur));
    });

    // generate dom using yearCal
    createCalendarInDOM();
    refreshDOMWithClocks();
})();

/**
 * Iterate over all keys of localStorage, its iterable we can use Object.keys(iterableObject)
 * then populate the events in eventSaved map, to get respective event on date clicked as
 * per usual flow.
 */
function getAllEventsFromLocalStorage() {
    const storageKeys = Object.keys(localStorage);
    let indexes = storageKeys.length;
    
    while(indexes--) {
        //console.log(localStorage.getItem(storageKeys[indexes]));
        if(localStorage.getItem(storageKeys[indexes])) {
            eventSaved.set(storageKeys[indexes], JSON.parse(localStorage.getItem(storageKeys[indexes])));
        }
    }
}

// Set February a/c to leap year
function setFebForLeap() {
        if(year % 400 === 0) {
            calendar.February = 29;
        } else if (year % 100 === 0) {
            calendar.February = 28;
        } else if (year % 4 === 0) {
            calendar.February = 29;
        } else {
            calendar.February = 28;
        }
};

/**
 * Set Web page title to current year
 */
function setPageTitle() {
    const title = document.head.getElementsByTagName('title');
    title[0].innerText = `Planner ${year} 📅`;
};


/**
 * Approach 2 : Create MultiDimensional array
 * and populate
 */
function generateMonthCal(curMonth) {
    const cal = [
        ['','','','','','',''],
        ['','','','','','',''],
        ['','','','','','',''],
        ['','','','','','',''],
        ['','','','','','',''],
        ['','','','','','','']
    ];

    const tempDays = calendar[curMonth];
    const dayIndex = (nextMonthStartWeekDay === -1) ? startDay : nextMonthStartWeekDay;
    let displayDate = 0;
    for(let i=0; i<=5; i++) {
        let indexY = 0;
        const weekDay = (i === 0) ? dayIndex : 0;
        for(let j=0; j< 7-weekDay; j++) {
            if(i === 0 && indexY === 0) {
                indexY = weekDay;
            } else if(i === 0) {
                indexY++;
            } else {
                indexY = j;
            }
            displayDate++;
            if(displayDate <= tempDays) {
                if(curMonth === allMonths[month] && displayDate === date) {
                    cal[i][indexY] = `<td id=${curMonth}-${displayDate} 
                                        class="table-primary">${displayDate}</td>`;
                } else {
                    cal[i][indexY] = `<td id=${curMonth}-${displayDate}>${displayDate}</td>`;
                }
                
                nextMonthStartWeekDay = indexY;
                nextMonthStartWeekDay++;
            }
        }
    }
    return cal;
}

/**
 * Create dynamic table rows and data from yearCal array
 * Insert the html to DOM
 */
async function createCalendarInDOM() {
    await yearCal.forEach((month, index)=> {
        let dynamicCalRows = '';
        month.forEach((curRow)=>{
            dynamicCalRows += `<tr style="text-align:center">`
            curRow.forEach((td)=>{
                if(td) {
                    dynamicCalRows += td;
                } else {
                    dynamicCalRows += `<td>-</td>`;
                }
            });
            dynamicCalRows += `</tr>`
        });

        //Insert adjacent html with concatenated static html and dynamic data
        document.getElementById('calCard').insertAdjacentHTML(
            'beforeEnd', 
            `${getMonthCardStart(allMonths[index])} ${dynamicCalRows} ${getMonthCardEnd()}`
        );

        //add event handler to each month card
        const domMonth = document.getElementById(allMonths[index]);
        domMonth.addEventListener('click', (event)=>{
            addEventToDate(event);
        });
    }); 
}

/**
 * Return static string with interpolated month, for card start
 * @param {string} month 
 */
function getMonthCardStart(month) {
    return `
    <div class="col-md-4" id=${month}>
    <div class="card border-info mb-4 box-shadow" id="card-${month}">
    <h5 style="margin:10px 0 0 10px; text-align:center;">${month}</h5>
    <div class="card-body">
        <p class="card-text">
            <table class="table table-sm" id="${month}-table">
                <thead>
                    <tr>
                        <th scope="col">Sun</th>
                        <th scope="col">Mon</th>
                        <th scope="col">Tue</th>
                        <th scope="col">Wed</th>
                        <th scope="col">Thu</th>
                        <th scope="col">Fri</th>
                        <th scope="col">Sat</th>
                    </tr>
                </thead>
                <tbody>`;

}

/**
 * Return static string for card end
 */
function getMonthCardEnd() {
    return `
        </tbody>
        </table>
        </p>
        <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
                <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
            </div>
            <small class="text-muted">9 mins</small>
        </div>
    </div>
    </div>
    </div>`;
}

/**
 * Add event to clicked date and add  icon ⏰
 */
function addEventToDate(event) {
    // return from function if nodeName is other than TD
    if(event.srcElement.nodeName !== 'TD') return;
    // Lets use ES6 destructuring to map array from split to variable
    [selectedMonth, selectedDate] = event.srcElement.id.split('-');

    const eventName = prompt('What is this event about?', '');
    // return and exit if name is not entered or cancelled
    if(!eventName) return;

    let eventTime = prompt('At what time (hh:mm)?','00:00');
    //lets use regular expression to test time format and prompt unless correct
    const regEx = new RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
    while(!regEx.test(eventTime)) {
        eventTime = prompt('Oops! enter time in format (hh:mm)','00:00');
    }

    // generate unique id and save event
    const id = `${year}-${selectedMonth}-${selectedDate}-${eventTime}`;
    if(eventSaved.has(id)) {
        alert('Already event saved for this time and date: '+ eventSaved.get(id).name);
    } else {
        eventSaved.set(id, `Event name: ${eventName}, Time: ${event.srcElement.id} @ ${eventTime}`);
        //Persist this event for page refresh/ browser close
        const eventData = new EventData(id, year, selectedMonth, selectedDate, eventTime, eventName);
        setInLocalStorage(eventData);
        const dateAndClock = ['',' ⏰']
        let td = document.getElementById(event.srcElement.id).innerHTML;
        dateAndClock[0] = td.split(' ')[0];
        td = dateAndClock.join('');
        document.getElementById(event.srcElement.id).innerHTML = td;
    }
}

/**
 * Repopulate td with clocks as per events
 */
function refreshDOMWithClocks() {
    eventSaved.forEach((value, key)=>{
            const dateAndClock = ['',' ⏰']
            let td = document.getElementById(`${value.month}-${value.date}`).innerHTML;
            dateAndClock[0] = td.split(' ')[0];
            td = dateAndClock.join('');
            document.getElementById(`${value.month}-${value.date}`).innerHTML = td;
    });
}

/**
 * Persist in localStorage
 */
function setInLocalStorage(eventData) {
    localStorage.setItem(eventData.id, JSON.stringify(eventData));
}

/**
 * Get data from localStorage
 */
function getFromLocalStorage(id) {
    return JSON.parse(localStorage.getItem(id));
}

/**
 * EventData function expression (blueprint) for creating eventObject
 */
class EventData {
    constructor(id, year, month, date, time, name) {
        this.id = id;
        this.year = year;
        this.month = month;
        this.date = date;
        this.time = time;
        this.name = name;
    }
}
