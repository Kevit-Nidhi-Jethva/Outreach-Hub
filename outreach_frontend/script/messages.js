const mockMessages = [
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    subject: "Volunteer Opportunity",
    content: "Hi! I’d love to help with the outreach campaign next week.",
    date: "2025-07-20"
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    subject: "Question About Webinar",
    content: "Could you share the webinar slides?",
    date: "2025-07-19"
  }
];

function loadMessages() {
  const tbody = document.querySelector('#message-table tbody');
  tbody.innerHTML = '';
  mockMessages.forEach(msg => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${msg.name}</td>
      <td>${msg.subject}</td>
      <td>${msg.date}</td>
      <td><button onclick="viewMessage(${msg.id})">View</button></td>
    `;
    tbody.appendChild(row);
  });
}

function viewMessage(id) {
  const msg = mockMessages.find(m => m.id === id);
  if (!msg) return;

  document.getElementById('msg-from').textContent = `${msg.name} (${msg.email})`;
  document.getElementById('msg-subject').textContent = msg.subject;
  document.getElementById('msg-date').textContent = msg.date;
  document.getElementById('msg-content').textContent = msg.content;

  toggleMessageViews('detail');
}

function showInbox() {
  toggleMessageViews('inbox');
}

function toggleMessageViews(view) {
  document.getElementById('inbox-view').style.display = view === 'inbox' ? 'block' : 'none';
  document.getElementById('message-detail').style.display = view === 'detail' ? 'block' : 'none';
  document.getElementById('compose-view').style.display = view === 'compose' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('message-table')) {
    loadMessages();

    const form = document.getElementById('compose-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        alert('Message "sent" (mocked)');
        showInbox();
      });
    }
  }
});
