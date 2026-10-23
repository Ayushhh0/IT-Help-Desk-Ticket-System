import { loadTickets, saveTickets } from "./js/storage.js";
import { displayTickets } from "./js/tickets.js";
import { filterTickets, sortTickets  } from "./js/filters.js";
const openCount = document.getElementById("open-count");
const progressCount = document.getElementById("progress-count");
const resolvedCount = document.getElementById("resolved-count");
const newTicketBtn = document.getElementById("new-ticket-btn");
const formSection = document.getElementById("ticket-form-section");
const ticketForm = document.getElementById("ticket-form");
const cancelBtn = document.getElementById("cancel-btn");
const ticketList = document.getElementById("ticket-list");
const totalTickets = document.getElementById("total-tickets");
const emptyMessage = document.getElementById("empty-message");

const searchTicket = document.getElementById("search-ticket");
const filterStatus = document.getElementById("filter-status");
const filterPriority = document.getElementById("filter-priority");
const sortTicketsSelect = document.getElementById("sort-tickets");
sortTicketsSelect.addEventListener("change", refreshTickets);
let tickets = loadTickets();
let statusChart = null;
let priorityChart = null;


function getSLADeadline(ticket) {
  const slaHours = {
    High: 4,
    Medium: 24,
    Low: 72
  };

  // Use the ticket's creation timestamp if available.
  // For older tickets, use the current time as a fallback.
  const createdAt = ticket.createdAt
    ? new Date(ticket.createdAt)
    : new Date();

  const hours = slaHours[ticket.priority] || 24;

  return new Date(
    createdAt.getTime() + hours * 60 * 60 * 1000
  );
}

function updateDashboardCharts() {
  if (typeof Chart === "undefined") {
    console.error("Chart.js did not load.");
    return;
  }

  const statusCounts = {
    Open: 0,
    "In Progress": 0,
    Resolved: 0
  };

  const priorityCounts = {
    High: 0,
    Medium: 0,
    Low: 0
  };

  tickets.forEach(function(ticket) {
    if (Object.prototype.hasOwnProperty.call(statusCounts, ticket.status)) {
      statusCounts[ticket.status]++;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        priorityCounts,
        ticket.priority
      )
    ) {
      priorityCounts[ticket.priority]++;
    }
  });

  const statusCanvas = document.getElementById("statusChart");
  const priorityCanvas = document.getElementById("priorityChart");

  if (!statusCanvas || !priorityCanvas) {
    console.error("Dashboard chart elements were not found.");
    return;
  }

  if (statusChart) {
    statusChart.destroy();
  }

  if (priorityChart) {
    priorityChart.destroy();
  }

  statusChart = new Chart(statusCanvas, {
    type: "doughnut",
    data: {
      labels: ["Open", "In Progress", "Resolved"],
      datasets: [{
        data: [
          statusCounts.Open,
          statusCounts["In Progress"],
          statusCounts.Resolved
        ],
        backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });

  priorityChart = new Chart(priorityCanvas, {
    type: "bar",
    data: {
      labels: ["High", "Medium", "Low"],
      datasets: [{
        label: "Number of Tickets",
        data: [
          priorityCounts.High,
          priorityCounts.Medium,
          priorityCounts.Low
        ],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function refreshTickets(updatedTickets) {
  if (updatedTickets) {
    tickets = updatedTickets;
  }

const ticketModal = document.getElementById("ticket-modal");
const closeModalBtn = document.getElementById("close-modal");

closeModalBtn.addEventListener("click", function() {
  ticketModal.hidden = true;
});

ticketModal.addEventListener("click", function(event) {
  if (event.target === ticketModal) {
    ticketModal.hidden = true;
  }
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    ticketModal.hidden = true;
  }
});

  totalTickets.textContent = tickets.length;
  openCount.textContent = tickets.filter(function(ticket) {
  return ticket.status === "Open";
}).length;

progressCount.textContent = tickets.filter(function(ticket) {
  return ticket.status === "In Progress";
}).length;

resolvedCount.textContent = tickets.filter(function(ticket) {
  return ticket.status === "Resolved";
}).length;
  openCount.textContent = tickets.filter(function(ticket) {
  return ticket.status === "Open";
}).length;

progressCount.textContent = tickets.filter(function(ticket) {
  return ticket.status === "In Progress";
}).length;

resolvedCount.textContent = tickets.filter(function(ticket) {
  return ticket.status === "Resolved";
}).length;

updateDashboardCharts();

  const filtered = filterTickets(
    tickets,
    searchTicket.value,
    filterStatus.value,
    filterPriority.value
  );
const sorted = sortTickets(
  filtered,
  sortTicketsSelect.value
);
  emptyMessage.hidden = filtered.length > 0;

  displayTickets(
  ticketList,
  sorted,
  tickets,
  function(updatedTickets) {
    saveTickets(updatedTickets || tickets);
  },
  refreshTickets
);
}

newTicketBtn.addEventListener("click", function() {
  formSection.hidden = false;
  document.getElementById("full-name").focus();
});

cancelBtn.addEventListener("click", function() {
  ticketForm.reset();
  formSection.hidden = true;
});

ticketForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const ticket = {
    id: "HD-" + Date.now().toString().slice(-6),
    fullName: document.getElementById("full-name").value.trim(),
    email: document.getElementById("email").value.trim(),
    category: document.getElementById("category").value,
    priority: document.getElementById("priority").value,
    description: document.getElementById("description").value.trim(),
    status: "Open",
    statusHistory: [
  {
    status: "Open",
    date: new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
    note: "Ticket created"
  }
],
    date: new Date().toLocaleDateString()
  };

  tickets.unshift(ticket);
  saveTickets(tickets);
  refreshTickets();

  ticketForm.reset();
  formSection.hidden = true;

  alert("Ticket created successfully! Ticket ID: " + ticket.id);
});

searchTicket.addEventListener("input", refreshTickets);
filterStatus.addEventListener("change", refreshTickets);
filterPriority.addEventListener("change", refreshTickets);

refreshTickets();

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-ticket-form");

function closeEditModal() {
  editModal.hidden = true;
  editForm.reset();
}

document.getElementById("close-edit-modal").addEventListener("click", closeEditModal);
document.getElementById("cancel-edit").addEventListener("click", closeEditModal);

editModal.addEventListener("click", function(event) {
  if (event.target === editModal) {
    closeEditModal();
  }
});

editForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const ticketId = editModal.dataset.ticketId;
  const ticket = tickets.find(function(item) {
    return item.id === ticketId;
  });

  if (!ticket) {
    alert("Ticket not found.");
    closeEditModal();
    return;
  }

  ticket.fullName = document.getElementById("edit-full-name").value.trim();
  ticket.email = document.getElementById("edit-email").value.trim();
  ticket.category = document.getElementById("edit-category").value;
  ticket.priority = document.getElementById("edit-priority").value;
  ticket.description = document.getElementById("edit-description").value.trim();

  saveTickets(tickets);
  refreshTickets();
  closeEditModal();

  alert("Ticket updated successfully!");
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    editModal.hidden = true;
  }
});

const exportTicketsBtn = document.getElementById("export-tickets-btn");

exportTicketsBtn.addEventListener("click", function() {
  if (tickets.length === 0) {
    alert("There are no tickets to export!");
    return;
  }

  const headers = [
    "Ticket ID",
    "Name",
    "Email",
    "Category",
    "Priority",
    "Status",
    "Date",
    "Description"
  ];

  const rows = tickets.map(function(ticket) {
    return [
      ticket.id,
      ticket.fullName,
      ticket.email,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.date,
      ticket.description
    ];
  });

  function escapeCSV(value) {
    let text = String(value ?? "");
    return '"' + text.replace(/"/g, '""') + '"';
  }

  const csvContent = [headers, ...rows]
    .map(function(row) {
      return row.map(escapeCSV).join(",");
    })
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "help-desk-tickets.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  alert("Tickets exported successfully!");
});
