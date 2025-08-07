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

    // This function fetches all expenses and builds the accordion UI
    async function fetchAndDisplayExpenses() {
        try {
            const response = await fetch('/api/expenses');

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = 'index.html';
                }
                return;
            }

            const receipts = await response.json();
            const accordionContainer = document.getElementById('expenses-accordion');

            accordionContainer.innerHTML = '';

            if (receipts.length === 0) {
                accordionContainer.innerHTML = '<p class="text-muted">No expenses found. Upload a receipt to get started!</p>';
                return;
            }

            const groupedByDate = receipts.reduce((acc, receipt) => {
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

                    itemsHtml += `<li class="list-group-item bg-light"><strong>${storeName} (Total: $${totalAmount.toFixed(2)})</strong></li>`;

                    if (totalDiscount > 0) {
                        itemsHtml += `<li class="list-group-item list-group-item-success ps-4">Savings: -$${totalDiscount.toFixed(2)}</li>`;
                    }

                    if (receipt.items && receipt.items.length > 0) {
                        receipt.items.forEach(item => {
                            const itemName = item.itemName || 'Unnamed Item';
                            const itemPrice = item.price || 0.00;
                            const itemQuantity = item.quantity || 1;
                            itemsHtml += `<li class="list-group-item ps-4">&ndash; ${itemQuantity} x ${itemName} ($${itemPrice.toFixed(2)})</li>`;
                        });
                    }
                });
                itemsHtml += '</ul>';

                const accordionItemHtml = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${index}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}">
                            ${date}
                        </button>
                    </h2>
                    <div id="collapse-${index}" class="accordion-collapse collapse" data-bs-parent="#expenses-accordion">
                        <div class="accordion-body">
                            ${itemsHtml}
                        </div>
                    </div>
                </div>
            `;

                accordionContainer.innerHTML += accordionItemHtml;
                index++;
            }

        } catch (error) {
            console.error('Error fetching or displaying expenses:', error);
            const accordionContainer = document.getElementById('expenses-accordion');
            if(accordionContainer) {
                accordionContainer.innerHTML = '<p class="text-danger">Could not load expenses. Please try again later.</p>';
            }
        }
    }

    // Event listener for the receipt upload form
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        uploadStatus.textContent = 'Processing...';
        uploadStatus.className = 'mt-3 text-primary';

        const imageFile = document.getElementById('receipt-image').files[0];
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            // The browser will automatically include the session cookie with this request
            const response = await fetch('/api/receipts/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                uploadStatus.textContent = 'Receipt uploaded successfully!';
                uploadStatus.className = 'mt-3 text-success';
                uploadForm.reset();
                fetchAndDisplayExpenses(); // Refresh the expense list
            } else {
                uploadStatus.textContent = 'Upload failed. Please try again.';
                uploadStatus.className = 'mt-3 text-danger';
            }
        } catch (error) {
            uploadStatus.textContent = 'An error occurred during upload.';
            uploadStatus.className = 'mt-3 text-danger';
        }
    });

    // Event listener for the logout button
    logoutButton.addEventListener('click', () => {
        // Redirect to the logout URL handled by Spring Security
        window.location.href = '/logout';
    });

    // Initial call to load the expenses when the dashboard page loads
    fetchAndDisplayExpenses();
}

/**
 * A helper function to show alert messages on the forms
 */
function showAlert(element, message, type = 'danger') {
    element.textContent = message;
    element.className = `alert alert-${type}`;
}