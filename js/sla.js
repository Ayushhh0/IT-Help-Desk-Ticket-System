
export function getSLADeadline(ticket) {
  const slaHours = {
    High: 4,
    Medium: 24,
    Low: 72
  };

  let createdAt;

  if (ticket.createdAt) {
    createdAt = new Date(ticket.createdAt);
  } else if (ticket.date) {
    // Use the saved date for older tickets.
    // Exact creation time cannot be recovered if it was never saved.
    createdAt = new Date(ticket.date);

    if (Number.isNaN(createdAt.getTime())) {
      createdAt = new Date();
    }
  } else {
    createdAt = new Date();
  }

  const hours = slaHours[ticket.priority] || 24;

  return new Date(
    createdAt.getTime() + hours * 60 * 60 * 1000
  );
}
