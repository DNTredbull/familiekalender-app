document.addEventListener("DOMContentLoaded", function () {
    const daysContainer = document.querySelector(".days");
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
  
    const monthNames = [
      "Januar", "Februar", "Mars", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Desember"
    ];
  
    const events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
  
    const saveEvents = () => {
      localStorage.setItem("calendarEvents", JSON.stringify(events));
    };
  
    const getWeekNumber = (date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };
  
    const modal = document.getElementById("event-modal");
    const form = document.getElementById("event-form");
    const cancelBtn = document.getElementById("cancel-button");
    const eventTextInput = document.getElementById("event-text");
    const eventTimeInput = document.getElementById("event-time");
  
    let selectedEventKey = null;
    let selectedDay = null;
    let selectedMonth = null;
    let selectedYear = null;
  
    cancelBtn.onclick = () => {
      modal.style.display = "none";
      form.reset();
    };
  
    form.onsubmit = (e) => {
      e.preventDefault();
      const text = eventTextInput.value;
      const time = eventTimeInput.value;
      const entry = time ? `${text} kl. ${time}` : text;
  
      if (!events[selectedEventKey]) {
        events[selectedEventKey] = [];
      }
      events[selectedEventKey].push(entry);
      saveEvents();
  
      modal.style.display = "none";
      form.reset();
      renderCalendar(selectedMonth, selectedYear);
    };
  
    window.openEventModal = function (eventKey, day, month, year) {
      selectedEventKey = eventKey;
      selectedDay = day;
      selectedMonth = month;
      selectedYear = year;
      modal.style.display = "flex";
    };
  
    const renderCalendar = (month, year) => {
      daysContainer.innerHTML = "";
  
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      const adjustedFirstDay = (firstDay === 0) ? 6 : firstDay - 1;
  
      document.getElementById("month-display").textContent = `${monthNames[month]} ${year}`;
  
      let currentWeekRow = document.createElement("tr");
  
      const startOfWeek = new Date(year, month, 1 - adjustedFirstDay);
      const weekNumberCell = document.createElement("td");
      weekNumberCell.className = "week-number";
      weekNumberCell.textContent = `Uke ${getWeekNumber(startOfWeek)}`;
      currentWeekRow.appendChild(weekNumberCell);
  
      for (let i = 0; i < adjustedFirstDay; i++) {
        const emptyCell = document.createElement("td");
        emptyCell.className = "day empty";
        currentWeekRow.appendChild(emptyCell);
      }
  
      for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement("td");
        dayElement.textContent = day;
        dayElement.className = "day";
  
        if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
          dayElement.classList.add("today");
        }
  
        const eventKey = `${day}-${month}-${year}`;
        dayElement.onclick = () => openEventModal(eventKey, day, month, year);
  
        currentWeekRow.appendChild(dayElement);
  
        if ((day + adjustedFirstDay) % 7 === 0 || day === daysInMonth) {
          daysContainer.appendChild(currentWeekRow);
          if (day !== daysInMonth) {
            currentWeekRow = document.createElement("tr");
  
            const nextWeekDate = new Date(year, month, day + 1);
            const nextWeekNumberCell = document.createElement("td");
            nextWeekNumberCell.className = "week-number";
            nextWeekNumberCell.textContent = `Uke ${getWeekNumber(nextWeekDate)}`;
            currentWeekRow.appendChild(nextWeekNumberCell);
          }
        }
      }
      renderEventList(month, year);
    };
  
    const renderEventList = (month, year) => {
      const eventListContainer = document.getElementById("event-list");
      eventListContainer.innerHTML = "";
  
      const sortedKeys = Object.keys(events)
        .filter((key) => {
          const [day, eventMonth, eventYear] = key.split("-").map(Number);
          return eventMonth === month && eventYear === year;
        })
        .sort((a, b) => {
          const [dayA] = a.split("-").map(Number);
          const [dayB] = b.split("-").map(Number);
          return dayA - dayB;
        });
  
      sortedKeys.forEach((key) => {
        const [day, eventMonth, eventYear] = key.split("-").map(Number);
  
        const eventWrapper = document.createElement("div");
        eventWrapper.className = "event-wrapper";
  
        const dateTitle = document.createElement("h4");
        dateTitle.textContent = `${day}. ${monthNames[month]} ${year}`;
        eventWrapper.appendChild(dateTitle);
  
        events[key].forEach((eventText, index) => {
          const eventItem = document.createElement("div");
          eventItem.className = "event-item";
  
          const eventInput = document.createElement("input");
          eventInput.type = "text";
          eventInput.value = eventText;
          eventInput.disabled = true;
          eventItem.appendChild(eventInput);
  
          const editButton = document.createElement("button");
          editButton.textContent = "Rediger";
          editButton.className = "edit-button";
          editButton.onclick = () => {
            eventInput.disabled = false;
            eventInput.focus();
            saveButton.style.display = "inline-block";
          };
  
          const saveButton = document.createElement("button");
          saveButton.textContent = "Lagre";
          saveButton.className = "save-button";
          saveButton.style.display = "none";
          saveButton.onclick = () => {
            events[key][index] = eventInput.value;
            saveEvents();
            eventInput.disabled = true;
            saveButton.style.display = "none";
          };
  
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Slett";
          deleteButton.className = "delete-button";
          deleteButton.onclick = () => {
            if (confirm("Er du sikker på at du vil slette denne hendelsen?")) {
              events[key].splice(index, 1);
              if (events[key].length === 0) {
                delete events[key];
              }
              saveEvents();
              renderCalendar(month, year);
            }
          };
  
          eventItem.appendChild(editButton);
          eventItem.appendChild(saveButton);
          eventItem.appendChild(deleteButton);
          eventWrapper.appendChild(eventItem);
        });
  
        eventListContainer.appendChild(eventWrapper);
      });
    };
  
    renderCalendar(currentMonth, currentYear);
    document.getElementById("prev-month").onclick = () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    };
    
    document.getElementById("next-month").onclick = () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    };
    
  });
  