const API_BASE = 'https://687731c9dba809d901ee37ad.mockapi.io/OutreachHub';
let currentPage = 1;
const limit = 5;

// Load and render contact list
function fetchContacts(page = 1) {
  currentPage = page;

  fetch(`${API_BASE}?page=${page}&limit=${limit}&sortBy=name&order=asc`)
    .then(res => res.json())
    .then(data => {
      renderContacts(data);
    })
    .catch(err => console.error('Failed to fetch contacts:', err));

  // Get total count for pagination
  fetch(API_BASE)
    .then(res => res.json())
    .then(allData => {
      const totalCount = allData.length;
      renderPagination(totalCount, page);
    });
}

// Render contact rows in table
function renderContacts(contacts) {
  const tbody = document.querySelector('#contacts-table tbody');
  tbody.innerHTML = '';

  contacts.forEach(contact => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.email}</td>
      <td>${contact.number}</td>
      <td>
        <button onclick="viewContact('${contact.id}')">View</button>
        <button onclick="editContact('${contact.id}')">Edit</button>
        <button onclick="deleteContact('${contact.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Render dynamic pagination
function renderPagination(totalContacts, currentPage) {
  const totalPages = Math.ceil(totalContacts / limit);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.addEventListener('click', () => fetchContacts(i));
    pagination.appendChild(btn);
  }
}

// Show contact form for adding new contact
function showForm() {
  document.getElementById('form-title').textContent = 'Add Contact';
  document.getElementById('contact-form').reset();
  document.getElementById('contact-id').value = '';
  showContactView('contact-form-view');
}

function viewContact(id) {
  fetch(`${API_BASE}/${id}`)
    .then(res => res.json())
    .then(contact => {
      document.getElementById('detail-name').textContent = contact.name;
      document.getElementById('detail-email').textContent = contact.email;
      document.getElementById('detail-phone').textContent = contact.number;

      showContactView('contact-details');
    })
    .catch(err => {
      console.error('Failed to load contact details:', err);
    });
}

function editContact(id) {
  fetch(`${API_BASE}/${id}`)
    .then(res => res.json())
    .then(contact => {
      document.getElementById('contact-id').value = contact.id;
      document.getElementById('contact-name').value = contact.name;
      document.getElementById('contact-email').value = contact.email;
      document.getElementById('contact-phone').value = contact.number;
      document.getElementById('form-title').textContent = 'Edit Contact';
      showContactView('contact-form-view');
    });
}

let deleteId = null;

function deleteContact(id) {
  deleteId = id;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.style.display = 'flex';
}

document.getElementById('confirm-delete').addEventListener('click', () => {
  if (!deleteId) return;

  fetch(`${API_BASE}/${deleteId}`, {
    method: 'DELETE'
  })
    .then(() => {
      document.getElementById('delete-modal').style.display = 'none';
      deleteId = null;
      fetchContacts(currentPage);
    })
    .catch(err => {
      console.error('Delete failed:', err);
      alert('Failed to delete contact.');
    });
});

document.getElementById('cancel-delete').addEventListener('click', () => {
  document.getElementById('delete-modal').style.display = 'none';
  deleteId = null;
});

document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const id = document.getElementById('contact-id').value;
  const contact = {
    name: document.getElementById('contact-name').value,
    email: document.getElementById('contact-email').value,
    number: document.getElementById('contact-phone').value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/${id}` : API_BASE;

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact)
  })
    .then(res => res.json())
    .then(() => {
      showList();
    })
    .catch(err => console.error('Save failed:', err));
});

function showList() {
  showContactView('contacts-list');
  fetchContacts(currentPage);
}

function showContactView(idToShow) {
  ['contacts-list', 'contact-form-view', 'contact-details'].forEach(id => {
    document.getElementById(id).style.display = id === idToShow ? 'block' : 'none';
  });
}

// OPTIONAL: in case you want to show/hide entire contacts section in a special way
function showContactSection(section) {
  const sections = ['contacts-section', 'dashboard-section', 'messages-section', 'campaign-section'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = id === `${section}-section` ? 'block' : 'none';
    }
  });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  showList();
});

