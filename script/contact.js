const PAGE_SIZE = 5;
let currentPage = 1;
let contacts = JSON.parse(localStorage.getItem('contacts')) || [];

// Hide all views
function hideAllViews() {
  ['contacts-list', 'contact-form-view', 'contact-details'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// Show contact list view
window.showList = function () {
  hideAllViews();
  document.getElementById('contacts-list').style.display = 'block';
  renderContacts(currentPage);
};

// Show form view for add or edit
window.showForm = function (id = null) {
  hideAllViews();
  document.getElementById('contact-form-view').style.display = 'block';
  document.getElementById('form-title').textContent = id !== null ? 'Edit Contact' : 'Add Contact';

  if (id !== null) {
    const contact = contacts[id];
    document.getElementById('contact-id').value = id;
    document.getElementById('contact-name').value = contact.name;
    document.getElementById('contact-email').value = contact.email;
    document.getElementById('contact-phone').value = contact.phone;
  } else {
    document.getElementById('contact-form').reset();
    document.getElementById('contact-id').value = '';
  }
};

// Show individual contact details
window.viewContact = function (id) {
  hideAllViews();
  const contact = contacts[id];
  document.getElementById('contact-details').style.display = 'block';
  document.getElementById('detail-name').textContent = contact.name;
  document.getElementById('detail-email').textContent = contact.email;
  document.getElementById('detail-phone').textContent = contact.phone;
};

// Save to localStorage
function saveContacts() {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Render contact list with pagination
function renderContacts(page = 1) {
  const tbody = document.querySelector('#contacts-table tbody');
  tbody.innerHTML = '';
  const start = (page - 1) * PAGE_SIZE;
  const paginated = contacts.slice(start, start + PAGE_SIZE);

  paginated.forEach((contact, index) => {
    const actualIndex = start + index;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.email}</td>
      <td>${contact.phone}</td>
      <td>
        <button onclick="viewContact(${actualIndex})">View</button>
        <button onclick="showForm(${actualIndex})">Edit</button>
        <button onclick="deleteContact(${actualIndex})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination();
}

// Render page buttons
function renderPagination() {
  const totalPages = Math.ceil(contacts.length / PAGE_SIZE);
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => {
      currentPage = i;
      renderContacts(currentPage);
    };
    container.appendChild(btn);
  }
}

// Delete contact
window.deleteContact = function (index) {
  if (confirm("Are you sure you want to delete this contact?")) {
    contacts.splice(index, 1);
    saveContacts();
    showList();
  }
};

// Form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const id = document.getElementById('contact-id').value;
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();

      if (!/^\d{10}$/.test(phone)) {
        alert("Phone number must be 10 digits.");
        return;
      }

      if (id) {
        contacts[id] = { name, email, phone };
      } else {
        contacts.push({ name, email, phone });
      }

      saveContacts();
      viewContact(id || contacts.length - 1);
    });

    // Initial load
    showList();
  }
});
