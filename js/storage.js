const STORAGE_KEY = "helpDeskTickets";

export function loadTickets() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}