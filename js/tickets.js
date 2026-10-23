import { getSLADeadline } from "./sla.js";
export function displayTickets(
  ticketList,
  tickets,
  allTickets,
  saveTickets,
  refreshTickets
) {
  ticketList.innerHTML = "";

  tickets.forEach(function(ticket) {
    const card = document.createElement("article");
    card.className = "ticket";

    // Ticket title
    const title = document.createElement("h3");
    title.textContent = ticket.id + " — " + ticket.category;

    // Name and priority badge
    const details = document.createElement("p");
    details.textContent = "Name: " + ticket.fullName + " ";

    const priorityBadge = document.createElement("span");
    priorityBadge.textContent = ticket.priority;
    priorityBadge.className =
      "priority-badge " + (ticket.priority || "low").toLowerCase();

    details.appendChild(priorityBadge);

    // Description
    const description = document.createElement("p");
    description.textContent = ticket.description;

    
    // SLA deadline
    const slaDeadline = getSLADeadline(ticket);
    const slaInfo = document.createElement("p");

    const deadlineText = slaDeadline.toLocaleString();
    const isOverdue =
      ticket.status !== "Resolved" &&
      slaDeadline.getTime() < Date.now();

    slaInfo.textContent = isOverdue
      ? "SLA Deadline: " + deadlineText + " — OVERDUE"
      : "SLA Deadline: " + deadlineText;

    if (isOverdue) {
      slaInfo.style.color = "#dc2626";
      slaInfo.style.fontWeight = "bold";
    }

    // Email and date
    const email = document.createElement("small");
    email.textContent = ticket.email + " • " + ticket.date;

    // View Details button
    const viewButton = document.createElement("button");
    viewButton.textContent = "View Details";
    viewButton.className = "view-details-btn";
    viewButton.type = "button";

    viewButton.addEventListener("click", function() {
      const modal = document.getElementById("ticket-modal");
      const modalContent = document.getElementById(
        "ticket-details-content"
      );

      modalContent.replaceChildren();

      const fields = [
        ["Ticket ID", ticket.id],
        ["Name", ticket.fullName],
        ["Email", ticket.email],
        ["Category", ticket.category],
        ["Priority", ticket.priority],
        ["Status", ticket.status],
        ["Date Created", ticket.date],
        ["Description", ticket.description]
      ];

      fields.forEach(function(field) {
        const paragraph = document.createElement("p");
        const label = document.createElement("strong");

        label.textContent = field[0] + ": ";
        paragraph.appendChild(label);
        paragraph.appendChild(
          document.createTextNode(field[1] || "Not provided")
        );

        modalContent.appendChild(paragraph);
      });

      // Status History
      const historyHeading = document.createElement("h3");
      historyHeading.textContent = "Status History";
      modalContent.appendChild(historyHeading);

      const historyList = document.createElement("ul");

      const history = Array.isArray(ticket.statusHistory)
        ? ticket.statusHistory
        : [
            {
              status: ticket.status,
              date: ticket.date || "Date unavailable",
              note: "History not available for earlier changes"
            }
          ];

      history.forEach(function(entry) {
        const item = document.createElement("li");

        const status = document.createElement("strong");
        status.textContent = entry.status || "Unknown";

        const date = document.createElement("p");
        date.textContent = entry.date || "Date unavailable";

        const note = document.createElement("p");
        note.textContent = entry.note || "";

        item.append(status, date, note);
        historyList.appendChild(item);
      });

      modalContent.appendChild(historyList);
      modal.hidden = false;
    });

    // Ticket status dropdown
    const statusLabel = document.createElement("label");
    statusLabel.textContent = "Ticket Status: ";

    const statusSelect = document.createElement("select");

    ["Open", "In Progress", "Resolved"].forEach(function(status) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = ticket.status === status;

      statusSelect.appendChild(option);
    });

    statusSelect.addEventListener("change", function() {
      const previousStatus = ticket.status;
      const newStatus = statusSelect.value;

      if (previousStatus === newStatus) return;

      // Create a history entry for older tickets if needed.
      if (!Array.isArray(ticket.statusHistory)) {
        ticket.statusHistory = [
          {
            status: previousStatus,
            date: ticket.date || "Date unavailable",
            note: "History started; earlier changes are unavailable"
          }
        ];
      }

      ticket.status = newStatus;

      ticket.statusHistory.push({
        status: newStatus,
        date: new Date().toLocaleString(),
        note: "Status changed from " +
          previousStatus + " to " + newStatus
      });

      saveTickets();
      refreshTickets();
    });

    statusLabel.appendChild(statusSelect);

    // Edit Ticket button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit Ticket";
    editButton.className = "view-details-btn";
    editButton.type = "button";

    editButton.addEventListener("click", function() {
      const editModal = document.getElementById("edit-modal");

      document.getElementById("edit-full-name").value =
        ticket.fullName || "";
      document.getElementById("edit-email").value =
        ticket.email || "";
      document.getElementById("edit-category").value =
        ticket.category || "Other";
      document.getElementById("edit-priority").value =
        ticket.priority || "Low";
      document.getElementById("edit-description").value =
        ticket.description || "";

      editModal.dataset.ticketId = ticket.id;
      editModal.hidden = false;
    });

    // Delete Ticket button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Ticket";
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", function() {
      const confirmed = confirm(
        "Are you sure you want to delete ticket " + ticket.id + "?"
      );

      if (!confirmed) return;

      const updatedTickets = allTickets.filter(function(item) {
        return item.id !== ticket.id;
      });

      saveTickets(updatedTickets);
      refreshTickets(updatedTickets);
    });

    // Add everything to the ticket card
    card.append(
      title,
      details,
      description,
      slaInfo,
      email,
      statusLabel,
      viewButton,
      editButton,
      deleteButton
    );

    ticketList.appendChild(card);
  });
}
