const API_BASE = 'http://localhost:3000/contacts';
  let currentPage = 1;
  const limit = 5;

  // Load and render contact list
  function fetchContacts(page = 1) {
    currentPage = page;

    const token = localStorage.getItem('access_token');

    fetch(API_BASE, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(allData => {
        if (!Array.isArray(allData.data)) {
          throw new Error(allData.message || 'Failed to fetch contacts');
        }

        // Sort contacts by name ascending
        const sortedData = allData.data.slice().sort((a, b) => {
          if (!a.name) return 1;
          if (!b.name) return -1;
          return a.name.localeCompare(b.name);
        });

        // Client-side pagination
        const start = (page - 1) * limit;
        const paginatedData = sortedData.slice(start, start + limit);
        renderContacts(paginatedData);
        renderPagination(sortedData.length, page);
      })
        .catch(err => console.error('Failed to fetch contacts:', err));
  }

  // Render contact rows in table
  function renderContacts(contacts) {
    const tbody = document.querySelector('#contacts-table tbody');
    tbody.innerHTML = '';

    contacts.forEach(contact => {
      const row = document.createElement('tr');
      // Render tags as styled spans
      let tagsHtml = '';
      if (Array.isArray(contact.tags)) {
        tagsHtml = contact.tags.map(tag => `<span class="contact-tag">${tag}</span>`).join(' ');
      }
      row.innerHTML = `
        <td>${contact.name}</td>
        <td>${contact.phoneNumber}</td>
        <td>${tagsHtml}</td>
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

  const showForm = () => {
    document.getElementById('form-title').textContent = 'Add Contact';
    document.getElementById('contact-form').reset();
    document.getElementById('contact-id').value = '';
    showContactView('contact-form-view');
  };

  function viewContact(id) {
    fetch(`${API_BASE}/${id}` , {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => res.json())
      .then(contact => {
        document.getElementById('detail-name').textContent = contact.name;
        document.getElementById('detail-phone').textContent = contact.phoneNumber;
          document.getElementById('detail-tags').textContent = Array.isArray(contact.tags) ? contact.tags.join(', ') : '';
        showContactView('contact-details');
      })
      .catch(err => {
        console.error('Failed to load contact details:', err);
      });
  }

  function editContact(id) {
    fetch(`${API_BASE}/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => res.json())
      .then(contact => {
        document.getElementById('contact-id').value = contact.id;
        document.getElementById('contact-name').value = contact.name;  
        document.getElementById('contact-phone').value = contact.phoneNumber;
        document.getElementById('contact-tags').value = Array.isArray(contact.tags) ? contact.tags.join(', ') : '';
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
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
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
      phoneNumber: document.getElementById('contact-phone').value,
      tags: document.getElementById('contact-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/${id}` : API_BASE;

    fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'application/json' },
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
