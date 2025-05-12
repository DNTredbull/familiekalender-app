document.addEventListener("DOMContentLoaded", function () {
    const daysContainer = document.querySelector(".days");
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    const monthNames = [
        "Januar", "Februar", "Mars", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Desember"
    ];

    const events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

    const saveEvents = () => {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    };

    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Opprett navigasjonselementer
    const navigationContainer = document.createElement('div');
    navigationContainer.className = 'calendar-navigation';

    const prevButton = document.createElement('button');
    prevButton.textContent = '◀';
    prevButton.onclick = () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    };

    const nextButton = document.createElement('button');
    nextButton.textContent = '▶';
    nextButton.onclick = () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    };

    const monthDisplay = document.createElement('div');
    monthDisplay.id = 'month-display';

    navigationContainer.appendChild(prevButton);
    navigationContainer.appendChild(monthDisplay);
    navigationContainer.appendChild(nextButton);

    document.getElementById('calendar').prepend(navigationContainer);

    const openEventModal = (eventKey, day, month, year) => {
        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const header = document.createElement('h3');
        header.textContent = `Hendelser for ${day}. ${monthNames[month]} ${year}`;
        modalContent.appendChild(header);

        const eventList = document.createElement('ul');
        eventList.className = 'event-list';

        if (events[eventKey]) {
            events[eventKey].forEach((eventText, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = eventText;
                listItem.onclick = () => {
                    if (confirm(`Slett hendelse: ${eventText}?`)) {
                        events[eventKey].splice(index, 1);
                        if (events[eventKey].length === 0) {
                            delete events[eventKey];
                        }
                        saveEvents();
                        renderCalendar(currentMonth, currentYear);
                        document.body.removeChild(modal);
                    }
                };
                eventList.appendChild(listItem);
            });
        }

        modalContent.appendChild(eventList);

        const input = document.createElement('textarea');
        modalContent.appendChild(input);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Legg til';
        saveButton.onclick = () => {
            if (input.value.trim() !== "") {
                if (!events[eventKey]) {
                    events[eventKey] = [];
                }
                events[eventKey].push(input.value);
                saveEvents();
                renderCalendar(currentMonth, currentYear);
                document.body.removeChild(modal);
            }
        };

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Lukk';
        closeButton.onclick = () => {
            document.body.removeChild(modal);
        };

        modalContent.appendChild(saveButton);
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);
    };

    const renderCalendar = (month, year) => {
        daysContainer.innerHTML = "";

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const adjustedFirstDay = (firstDay === 0) ? 6 : firstDay - 1;

        monthDisplay.textContent = `${monthNames[month]} ${year}`;

        let currentWeekRow = document.createElement('tr');

        const startOfWeek = new Date(year, month, 1 - adjustedFirstDay);
        const weekNumberCell = document.createElement('td');
        weekNumberCell.className = 'week-number';
        weekNumberCell.textContent = `Uke ${getWeekNumber(startOfWeek)}`;
        currentWeekRow.appendChild(weekNumberCell);

        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyCell = document.createElement('td');
            emptyCell.className = 'day empty';
            currentWeekRow.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('td');
            dayElement.textContent = day;
            dayElement.className = 'day';

            const eventKey = `${day}-${month}-${year}`;
            dayElement.onclick = () => openEventModal(eventKey, day, month, year);

            currentWeekRow.appendChild(dayElement);

            if ((day + adjustedFirstDay) % 7 === 0 || day === daysInMonth) {
                daysContainer.appendChild(currentWeekRow);
                if (day !== daysInMonth) {
                    currentWeekRow = document.createElement('tr');

                    const nextWeekDate = new Date(year, month, day + 1);
                    const nextWeekNumberCell = document.createElement('td');
                    nextWeekNumberCell.className = 'week-number';
                    nextWeekNumberCell.textContent = `Uke ${getWeekNumber(nextWeekDate)}`;
                    currentWeekRow.appendChild(nextWeekNumberCell);
                }
            }
        }
    };

    renderCalendar(currentMonth, currentYear);
});
