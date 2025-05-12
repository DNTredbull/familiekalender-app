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

    const renderCalendar = (month, year) => {
        daysContainer.innerHTML = "";

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const adjustedFirstDay = (firstDay === 0) ? 6 : firstDay - 1;

        const monthDisplay = document.getElementById('month-display');
        if (monthDisplay) {
            monthDisplay.textContent = `${monthNames[month]} ${year}`;
        }

        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyDiv = document.createElement('div');
            daysContainer.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;

            if (
                day === currentDate.getDate() &&
                month === currentDate.getMonth() &&
                year === currentDate.getFullYear()
            ) {
                dayElement.classList.add('today');
            }

            const eventKey = `${day}-${month}-${year}`;
            if (events[eventKey]) {
                const eventDot = document.createElement('div');
                eventDot.className = 'event-dot';
                eventDot.textContent = events[eventKey].length;
                dayElement.appendChild(eventDot);
            }

            dayElement.onclick = () => openEventModal(eventKey, day, month, year);

            daysContainer.appendChild(dayElement);
        }
    };

    // Navigasjonsknapper og månedstittel
    const navContainer = document.createElement('div');
    navContainer.className = 'navigation';

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
    navContainer.appendChild(prevButton);
    navContainer.appendChild(monthDisplay);
    navContainer.appendChild(nextButton);

    document.getElementById('app').prepend(navContainer);

    renderCalendar(currentMonth, currentYear);

    // Legger tilbake modalen med funksjoner
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.body.appendChild(modal);
    };
});
