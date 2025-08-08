// This is the main function that runs when the page content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // This is a simple router that checks which page is currently active
    // and calls the appropriate function to set up its functionality.
    if (document.getElementById('login-form')) {
        setupLoginPage();
    }
    if (document.getElementById('expenses-accordion')) {
        setupDashboardPage();
    }
});

/**
 * Sets up functionality for the Login/Registration page (index.html).
 * It handles toggling between views, displaying login errors, and submitting the registration form.
 */
function setupLoginPage() {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const registerForm = document.getElementById('register-form');
    const loginAlert = document.getElementById('login-alert');
    const registerAlert = document.getElementById('register-alert');

    // Logic to switch from the login form to the register form
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('d-none');
        registerView.classList.remove('d-none');
    });

    // Logic to switch from the register form back to the login form
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('d-none');
        loginView.classList.remove('d-none');
    });

    // Check the URL for "?error=true", which Spring Security adds on a failed login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        showAlert(loginAlert, 'Login failed. Please check your username and password.');
    }

    // Event listener for the registration form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                showAlert(registerAlert, 'Registration successful! You can now log in.', 'success');
            } else {
                const errorData = await response.text();
                showAlert(registerAlert, `Registration failed: ${errorData}`);
            }
        } catch (error) {
            showAlert(registerAlert, 'An error occurred. Please try again.');
        }
    });
}

/**
 * Sets up all functionality for the main Dashboard page (dashboard.html).
 * It fetches and displays expenses, and handles receipt uploads and logout.
 */
function setupDashboardPage() {
    const accordionContainer = document.getElementById('expenses-accordion');
    const uploadForm = document.getElementById('upload-form');
    const logoutButton = document.getElementById('logout-button');
    const uploadStatus = document.getElementById('upload-status');
    const itemModalElement = document.getElementById('itemModal');
    const itemModal = new bootstrap.Modal(itemModalElement);
    const saveItemButton = document.getElementById('save-item-button');
    const itemForm = document.getElementById('item-form');

    let allReceipts = []; // Store receipts to find item data for editing

    async function fetchAndDisplayExpenses() {
        try {
            const response = await fetch('/api/expenses');
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) window.location.href = 'index.html';
                return;
            }

            allReceipts = await response.json(); // Save data to our global variable
            accordionContainer.innerHTML = '';

            if (allReceipts.length === 0) {
                accordionContainer.innerHTML = '<p class="text-muted">No expenses found. Upload a receipt to get started!</p>';
                return;
            }

            const groupedByDate = allReceipts.reduce((acc, receipt) => {
                const date = receipt.receiptDate;
                if (!acc[date]) acc[date] = [];
                acc[date].push(receipt);
                return acc;
            }, {});

            let index = 0;
            for (const date in groupedByDate) {
                const receiptsForDate = groupedByDate[date];

                let itemsHtml = '<ul class="list-group list-group-flush">';
                receiptsForDate.forEach(receipt => {
                    const storeName = receipt.storeName || 'Unknown Store';
                    const totalAmount = receipt.totalAmount || 0.00;
                    const totalDiscount = receipt.totalDiscount || 0.00;

                    itemsHtml += `
                    <li class="list-group-item bg-light d-flex justify-content-between align-items-center">
                        <strong>${storeName} (Total: $${totalAmount.toFixed(2)})</strong>
                        <button class="btn btn-sm btn-outline-success create-btn" data-receipt-id="${receipt.id}">Add Item</button>
                    </li>`;

                    if (totalDiscount > 0) {
                        itemsHtml += `<li class="list-group-item list-group-item-success ps-4">Savings: -$${totalDiscount.toFixed(2)}</li>`;
                    }

                    if (receipt.items && receipt.items.length > 0) {
                        receipt.items.forEach(item => {
                            // console.log("Inspecting item object:", item);
                            const itemName = item.itemName || 'Unnamed Item';
                            const itemPrice = item.price || 0.00;
                            const itemQuantity = item.quantity || 1;

                            // This block creates the HTML for each item, including the buttons
                            itemsHtml += `
                            <li class="list-group-item ps-4 d-flex justify-content-between align-items-center">
                                <span>&ndash; ${itemQuantity} x ${itemName} ($${itemPrice.toFixed(2)})</span>
                                <span>
                                    <button class="btn btn-sm btn-outline-primary edit-btn" data-item-id="${item.id}">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger delete-btn" data-item-id="${item.id}">Delete</button>
                                </span>
                            </li>`;
                        });
                    }
                });
                itemsHtml += '</ul>';

                // This is the full HTML for the accordion item that was missing
                const accordionItemHtml = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${index}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}">
                            ${date}
                        </button>
                    </h2>
                    <div id="collapse-${index}" class="accordion-collapse collapse" data-bs-parent="#expenses-accordion">
                        <div class="accordion-body">${itemsHtml}</div>
                    </div>
                </div>`;

                accordionContainer.innerHTML += accordionItemHtml;
                index++;
            }

        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    }

    // --- ALL EVENT LISTENERS ---

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        uploadStatus.textContent = 'Processing...';
        uploadStatus.className = 'mt-3 text-primary';

        const imageFile = document.getElementById('receipt-image').files[0];
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch('/api/receipts/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                uploadStatus.textContent = 'Receipt uploaded successfully!';
                uploadStatus.className = 'mt-3 text-success';
                uploadForm.reset();
                fetchAndDisplayExpenses();
            } else {
                uploadStatus.textContent = 'Upload failed. Please try again.';
                uploadStatus.className = 'mt-3 text-danger';
            }
        } catch (error) {
            uploadStatus.textContent = 'An error occurred during upload.';
            uploadStatus.className = 'mt-3 text-danger';
        }
    });

    logoutButton.addEventListener('click', () => { window.location.href = '/logout'; });

    // A single listener for all Create, Edit, and Delete button clicks
    accordionContainer.addEventListener('click', async (e) => {
        const target = e.target;

        if (target && target.classList.contains('delete-btn')) {
            const itemId = target.dataset.itemId;
            console.log("itemID: ", itemId);
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
                    if (response.ok) fetchAndDisplayExpenses();
                    else alert('Failed to delete item.');
                } catch (error) { console.error('Delete failed:', error); }
            }
        }

        if (target && target.classList.contains('create-btn')) {
            const receiptId = target.dataset.receiptId;
            document.getElementById('itemModalLabel').textContent = 'Create New Item';
            itemForm.reset();
            document.getElementById('modal-item-id').value = '';
            document.getElementById('modal-receipt-id').value = receiptId;
            saveItemButton.dataset.action = 'create';
            itemModal.show();
        }

        if (target && target.classList.contains('edit-btn')) {
            const itemId = target.dataset.itemId;
            let itemToEdit = null;
            for(const receipt of allReceipts) {
                const found = receipt.items.find(i => i.id == itemId);
                if (found) {
                    itemToEdit = found;
                    break;
                }
            }

            if (itemToEdit) {
                document.getElementById('itemModalLabel').textContent = 'Edit Item';
                itemForm.reset();
                document.getElementById('modal-item-id').value = itemToEdit.id;
                document.getElementById('modal-item-name').value = itemToEdit.itemName;
                document.getElementById('modal-item-quantity').value = itemToEdit.quantity;
                document.getElementById('modal-item-price').value = itemToEdit.price;
                saveItemButton.dataset.action = 'edit';
                itemModal.show();
            }
        }
    });

    // Event listener for the "Save Changes" button in the modal
    saveItemButton.addEventListener('click', async () => {
        const action = saveItemButton.dataset.action;
        const itemId = document.getElementById('modal-item-id').value;
        const receiptId = document.getElementById('modal-receipt-id').value;

        const itemData = {
            itemName: document.getElementById('modal-item-name').value,
            quantity: parseInt(document.getElementById('modal-item-quantity').value),
            price: parseFloat(document.getElementById('modal-item-price').value)
        };

        let url = '';
        let method = '';

        if (action === 'create') {
            url = `/api/items/receipt/${receiptId}`;
            method = 'POST';
        } else if (action === 'edit') {
            url = `/api/items/${itemId}`;
            method = 'PUT';
        } else { return; }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                itemModal.hide();
                fetchAndDisplayExpenses();
            } else {
                alert('Failed to save item.');
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
    });

    // Initial data load
    fetchAndDisplayExpenses();
}
/**
 * A helper function to show alert messages on the forms
 */
function showAlert(element, message, type = 'danger') {
    element.textContent = message;
    element.className = `alert alert-${type}`;
}