const API_URL = "http://localhost:3000/api/logs"; 

let moodChart;
let fullMoodData = [];

//Ambil data mood
function fetchMoodHistory() {
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      const moodList = document.getElementById("mood-list");
      moodList.innerHTML = "";

      fullMoodData = data; //Ini buat load data mood

      data.forEach((entry) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${entry.mood}</span> <span>${new Date(entry.DATE).toLocaleDateString("en-CA")}</span>          
          <div>
            <button class="edit-button" data-id="${entry.id}">Edit</button>
            <button class="delete-button" data-id="${entry.id}">Delete</button>
          </div>
        `;
        moodList.appendChild(li);
      });

      document.querySelectorAll(".edit-button").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          editMood(id);
        });
      });

      document.querySelectorAll(".delete-button").forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          deleteMood(id);
        });
      });

      updateMoodChart(data);
    })
    .catch((error) => console.error("Error fetching moods:", error));
}

function logMood(mood) {
  const dateInput = document.getElementById("mood-date").value;
  if (!dateInput) {
    alert("Please select a date.");
    return;
  }

  const formattedDate = dateInput;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mood: mood,
      date: formattedDate,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Mood logged:", data);
      fetchMoodHistory();
    })
    .catch((error) => console.error("Error logging mood:", error));
}

// Edit mood
function editMood(id) {
  const moodToEdit = fullMoodData.find((entry) => entry.id == id);
  if (!moodToEdit) {
    alert("Mood not found.");
    return;
  }

  const newMood = prompt("Edit mood:", moodToEdit.mood);
  if (newMood !== null) {
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: newMood }),
    })
      .then((response) => response.json())
      .then(() => {
        alert("Mood updated successfully.");
        fetchMoodHistory();
      })
      .catch((error) => console.error("Error updating mood:", error));
  }
}

// Delete mood
function deleteMood(id) {
  if (confirm("Are you sure you want to delete this mood entry?")) {
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        alert("Mood deleted successfully.");
        fetchMoodHistory();
      })
      .catch((error) => console.error("Error deleting mood:", error));
  }
}

// Update mood chart
function updateMoodChart(data) {
  const ctx = document.getElementById("moodChart").getContext("2d");

  const moodMapping = {
    neutral: 0,
    sad: 1,
    angry: 2,
    happy: 3,
  };

  const moodColors = {
    neutral: "#ffffff",
    happy: "#ffeb3b",
    sad: "#2196f3",
    angry: "#f44336",
  };

  data.sort((a, b) => new Date(a.DATE) - new Date(b.DATE));

  const labels = data.map((entry) =>
    new Date(entry.DATE).toLocaleDateString("en-CA")
  );
  const moodData = data.map(
    (entry) => moodMapping[entry.mood.toLowerCase()] || 0
  );
  const moodPointColors = data.map(
    (entry) => moodColors[entry.mood.toLowerCase()] || "#ccc"
  );

  if (moodChart) {
    moodChart.destroy();
  }

  moodChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Mood Over Time",
          data: moodData,
          fill: false,
          borderColor: "#6200ea",
          backgroundColor: moodPointColors,
          tension: 0.3,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 3,
          ticks: {
            callback: function (value) {
              const labels = ["Neutral", "Sad", "Angry", "Happy"];
              return Number.isInteger(value) ? labels[value] : "";
            },
            color: "#e0e0e0",
          },
          title: {
            display: true,
            text: "Mood",
            color: "#e0e0e0",
            font: {
              weight: "bold",
            },
          },
        },
        x: {
          ticks: {
            color: "#e0e0e0",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "#e0e0e0",
          },
        },
      },
    },
  });
}

//Filter mood berdasar tanggal
function filterMoods() {
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  const filteredData = fullMoodData.filter((entry) => {
    const entryDate = new Date(entry.DATE);
    return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
  });

  updateMoodChart(filteredData);
  updateMoodList(filteredData);
}

function applyDateRange(start, end) {
  const toInputDate = (date) => date.toISOString().split("T")[0];
  document.getElementById("start-date").value = toInputDate(start);
  document.getElementById("end-date").value = toInputDate(end);
  filterMoods();
}

function updateMoodList(data) {
  const moodList = document.getElementById("mood-list");
  moodList.innerHTML = "";

  data.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${entry.mood}</span> <span>${new Date(entry.DATE).toLocaleDateString("en-CA")}</span>      
      <div>
        <button class="edit-button" data-id="${entry.id}">Edit</button>
        <button class="delete-button" data-id="${entry.id}">Delete</button>
      </div>
    `;
    moodList.appendChild(li);
  });

  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      editMood(id);
    });
  });

  document.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      deleteMood(id);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchMoodHistory();

  document.getElementById("filter-button").addEventListener("click", filterMoods);

  document.getElementById("last7days-button").addEventListener("click", () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    applyDateRange(start, end);
  });

  document.getElementById("last30days-button").addEventListener("click", () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    applyDateRange(start, end);
  });

  document.getElementById("thisweek-button").addEventListener("click", () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    const end = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    end.setDate(start.getDate() + 6);
    applyDateRange(start, end);
  });

  document.getElementById("reset-button").addEventListener("click", () => {
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    updateMoodChart(fullMoodData);
    updateMoodList(fullMoodData);
  });
});

document.querySelectorAll(".mood-button").forEach((button) => {
  button.addEventListener("click", () => {
    const mood = button.getAttribute("data-mood").toLowerCase();
    logMood(mood);
  });
});

