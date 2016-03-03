// var helpers = require('./helpers/js');
// module.exports = MaroonCalendar;
function MaroonCalendar(options) {

    // MODEL ---------------------------------------------------------------------------------------
    var title = options.title;
    var template = options.template;
    var onUpdated = options.onUpdated || $.noop;
    var placeholder = options.placeholder;
    var locale = options.locale || 'en';
    moment.locale(locale);
    var timespan = options.timespan || [currentDate.year(), currentDate.clone().add(5, 'year')];
    var ROWS = 6;
    var COLS = 7;
    var months = moment.months();
    var weekdays = moment.weekdays();
    var weekdaysMin = moment.weekdaysMin();
    var currentDate = new moment();
    var today = new moment();
    var years = closedInterval(timespan[0], timespan[1]);
    var content = generateContent();
    var view = generateView();

    // generates a 6*7 array with date objects as elements
    function generateContent() {
        var startDate = currentDate.clone();
        startDate.startOf('month');
        startDate.subtract(startDate.day(), 'days');
        var endDate = startDate.clone();
        var cellNumber = ROWS * COLS;
        endDate.add(cellNumber - 1, 'days');
        var content = closedDateInterval(startDate, endDate);
        return content;
    }

    // VIEWMODEL ---------------------------------------------------------------------------------------
    // translates the model into an abstraction of the view
    function generateView() {
        var currentYear = currentDate.year();
        var currentMonth = months[currentDate.month()];
        var viewContent = generateViewContent();
        var viewCurrentDate = currentDate.format('DD.MM.YYYY');

        return { years: years, months: months, content: viewContent, weekdays: weekdays, weekdaysMin: weekdaysMin,
            currentDate: viewCurrentDate, currentYear: currentYear, currentMonth: currentMonth, title: title };
    }

    function generateViewContent() {
        var viewContent = content.map(function (date) {
            var timeElement = $('<time></time>');
            timeElement.attr('dateTime', date.format('YYYY-MM-DD'));
            timeElement.html(date.format('DD'));
            var tableElement = $('<td></td>');
            tableElement.addClass('maroonDate');

            // style content
            if (date.isSame(today, 'day')) {
                tableElement.addClass('primary');
            }
            if (!date.isSame(currentDate, 'month')) {
                tableElement.addClass('secondary');
            }
            if (date.isSame(currentDate, 'day')) {
                tableElement.addClass('current');
            }

            var dateElement = tableElement.append(timeElement).prop('outerHTML');
            return dateElement;
        });
        viewContent = toMatrix(viewContent, ROWS, COLS);
        return viewContent;
    }

    // CONTROLLER ----------------------------------------------------------------------------------
    function updateCalendar() {
        content = generateContent();
        updateView();
        render(view);
        onUpdated(view);
    }

    // this function will be called in updateCalendar instead of regenerating the whole view
    // everytime the calendar updates
    // such boilerplate
    function updateView() {
        view.content = generateViewContent();
        view.currentYear = currentDate.year();
        view.currentMonth = months[currentDate.month()];
        view.currentDate = currentDate.format('DD.MM.YYYY');
    }

    // inserts the view into the placeholders html using handlebars templating engine
    function render() {
        placeholder.html(template(view));
    }


    // VIEW ----------------------------------------------------------------------------------------
    // bind events
    placeholder.on('click', '.maroonDate', daySelect);

    function monthSelect(e) {
        var month = $(this).text();
        currentDate.month(month);
        updateCalendar();
    }

    function yearSelect(e) {
        var year = $(this).text();
        currentDate.year(year);
        updateCalendar();
    }

    function daySelect(e) {
        var value = $(this).find('time').attr('datetime');
        var date = moment(value);
        currentDate = date;
        updateCalendar();
    }

    // returns a closed interval from start to end
    function closedInterval(start, end) {
        if (start > end) {
            return [];
        } else {
            var interval = [];
            var i = start;
            do {
                interval[i - start] = i;
                i++;
            } while (i <= end);
            return interval;
        }
    }

    // returns a closed date interval from startDate to endDate
    function closedDateInterval(startDate, endDate) {
        if (startDate > endDate) {
            return [];
        }
        var dateInterval = [];
        var date = startDate.clone();

        while (date <= endDate) {
            dateInterval.push(date);
            date = date.clone();
            date.add(1, 'day');
        }
        return dateInterval;
    }

    // turns an array a into a m x n matrix
    function toMatrix(a, m, n) {
        var result = [];
        for (var i = 0; i < m; i++) {
            result[i] = a.splice(0, n);
        }
        return result;
    }

    // returns the index a date in an array of date objects
    function searchDateArray(date, a) {
        return a.map(function (arrayDate) {
            return arrayDate.format('YYYY-MM-DD');
        }).indexOf(date.format('YYYY-MM-DD'));
    }

    // getters and setters
    var calendarObject = {};

    Object.defineProperty(calendarObject, 'placeholder', {
        get: function () {
            return placeholder;
        },
        set: function (value) {
            placeholder = value;
        }
    });

    Object.defineProperty(calendarObject, 'view', {
        get: function () {
            return view;
        }
    });

    Object.defineProperty(calendarObject, 'monthSelect', {
        get: function () {
            return monthSelect;
        }
    });

    Object.defineProperty(calendarObject, 'yearSelect', {
        get: function () {
            return yearSelect;
        }
    });

    return calendarObject;

}
