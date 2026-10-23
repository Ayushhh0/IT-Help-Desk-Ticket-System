
export function filterTickets(
  tickets,
  searchText,
  selectedStatus,
  selectedPriority
) {
  const query = searchText.toLowerCase().trim();

  return tickets.filter(function(ticket) {
    const matchesSearch =
      (ticket.id || "").toLowerCase().includes(query) ||
      (ticket.fullName || "").toLowerCase().includes(query) ||
      (ticket.category || "").toLowerCase().includes(query);

    const matchesStatus =
      selectedStatus === "All" ||
      ticket.status === selectedStatus;

    const matchesPriority =
      selectedPriority === "All" ||
      ticket.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

export function sortTickets(tickets, sortBy) {
  const sortedTickets = [...tickets];

  if (sortBy === "newest") {
    return sortedTickets;
  }

  if (sortBy === "oldest") {
    return sortedTickets.reverse();
  }

  if (sortBy === "priority") {
    const priorityOrder = {
      High: 3,
      Medium: 2,
      Low: 1
    };

    return sortedTickets.sort(function(a, b) {
      return (priorityOrder[b.priority] || 0) -
             (priorityOrder[a.priority] || 0);
    });
  }

  if (sortBy === "status") {
    const statusOrder = {
      Open: 1,
      "In Progress": 2,
      Resolved: 3
    };

    return sortedTickets.sort(function(a, b) {
      return (statusOrder[a.status] || 0) -
             (statusOrder[b.status] || 0);
    });
  }

  return sortedTickets;
}
