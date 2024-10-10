document.addEventListener('DOMContentLoaded', function() {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    loadUserProfile();
    loadOrderHistory();

    document.getElementById('editProfileBtn').addEventListener('click', showEditProfileModal);

    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('editProfileModal').style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('editProfileModal')) {
            document.getElementById('editProfileModal').style.display = 'none';
        }
    });

    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });

    document.getElementById('changePasswordBtn').addEventListener('click', showChangePasswordModal);

    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });

    document.getElementById('deleteAccountBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            deleteAccount();
        }
    });

    document.getElementById('sortOption').addEventListener('change', applyFiltersAndSort);
    document.querySelectorAll('input[name="status"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFiltersAndSort);
    });
    document.getElementById('startDate').addEventListener('change', applyFiltersAndSort);
    document.getElementById('endDate').addEventListener('change', applyFiltersAndSort);

});

const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');


//verify logged in
async function checkAndRouteUser() {
    const isAdmin = await verifyLoggedIn();
    if (!isAdmin) {
        window.location.href = 'index.html';
    }
}

async function verifyLoggedIn() {
    try {
        const data = await $.ajax({
            url: '/api/users/check',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return data.loggedIn === true;
    } catch (error) {
        console.error('Error verifying admin:', error);
        return false;
    }
}

function loadUserProfile() {
    $.ajax({
        url: `/api/users/${user.id}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(user) {
            $('#userInfo').html(`
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>First Name:</strong> ${user.firstName}</p>
                <p><strong>Last Name:</strong> ${user.lastName}</p>
                <p><strong>Address:</strong> ${user.address || 'Not provided'}</p>
            `);
            console.log(user);
            $('#firstName').val(user.firstName);
            $('#lastName').val(user.lastName);
            $('#email').val(user.email);
            $('#address').val(user.address);
        },
        error: function(xhr) {
            console.error('Error loading user profile:', xhr.responseText);
        }
    });
}

function loadOrderHistory() {
    $.ajax({
        url: `/api/users/${user.id}/orders`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(orders) {
            allOrders = orders;
            applyFiltersAndSort();
        },
        error: function(xhr) {
            console.error('Error loading order history:', xhr.responseText);
        }
    });
}

function applyFiltersAndSort() {
    const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(input => input.value);
    const sortOption = document.getElementById('sortOption').value;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    let filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return statusFilters.includes(order.status) &&
               (!startDate.getTime() || orderDate >= startDate) &&
               (!endDate.getTime() || orderDate <= endDate);
    });

    filteredOrders.sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        switch (sortOption) {
            case 'dateAsc':
                return dateA - dateB;
            case 'dateDesc':
                return dateB - dateA;
            case 'priceAsc':
                return a.totalAmount - b.totalAmount;
            case 'priceDesc':
                return b.totalAmount - a.totalAmount;
        }
    });

    displayOrders(filteredOrders);
}

function showEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'block';
}

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

function viewOrderDetails(orderId) {
    $.ajax({
        url: `/api/orders/${orderId}`,
        method: 'GET'
    })
    .then(function(order) {
        let shippingCost = order.totalAmount > 150 ? 0 : 10;
        
        const modalContent = document.getElementById('orderDetailsContent');
        modalContent.innerHTML = `
        <p><strong>Order ID:</strong> <span>${order._id}</span></p>
        <p><strong>Customer:</strong> <span>${order.user.username}</span></p>
        <p><strong>Order Date:</strong> <span>${new Date(order.orderDate).toLocaleString()}</span></p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
        <h4>Items:</h4>
        <ul>
            ${order.items.map(item => `
                <li>${item.flower ? item.flower.name: "Deleted Flower"} - Quantity: ${item.quantity}</li>
            `).join('')}
            <li>Shipping: ${shippingCost}₪</li>
        </ul>
        <p><strong>Shipping Address:</strong> <span>${order.shippingAddress}</span></p>
        <p class="total-amount"><strong>Total Amount:</strong> <span>${(order.totalAmount+shippingCost).toFixed(2)}₪</span></p>
        `;
        
        document.getElementById('orderDetailsModal').style.display = 'block';
    })
    .catch(function(error) {
        console.error('Error fetching order details:', error);
        alert('Failed to load order details. Please try again.');
    });
}

function displayOrders(orders) {
    const orderGroups = document.getElementById('orderGroups');
    orderGroups.innerHTML = '';

    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    statuses.forEach(status => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'order-group';
        groupDiv.innerHTML = `<h3>${status} Orders</h3>`;

        const orderList = document.createElement('ul');
        orderList.className = 'order-list';
    
        const statusOrders = orders.filter(order => order.status === status);
        
        if (statusOrders.length > 0) {
            statusOrders.forEach((order, index) => {
                const li = createOrderListItem(order, status);
                if (index < 3) {
                    li.style.display = 'block';
                } else {
                    li.style.display = 'none';
                    li.classList.add('hidden-order');
                }
                orderList.appendChild(li);
            });
            groupDiv.style.display = 'block';
        } else {
            groupDiv.style.display = 'none';
        }

        groupDiv.appendChild(orderList);
        orderGroups.appendChild(groupDiv);
    });
}

function createOrderListItem(order, status) {
    const li = document.createElement('li');
    li.innerHTML = `
        Order #${order._id} - ${new Date(order.orderDate).toLocaleDateString()}
        <button onclick="viewOrderDetails('${order._id}')">View Details</button>
        ${status === 'Pending' ? 
            `<button onclick="cancelOrder('${order._id}')">Cancel Order</button>` : ''}
        ${(status === 'Delivered' || status === 'Cancelled') ?
            `<button onclick="deleteOrder('${order._id}')">Delete Order</button>` : ''}
        `;

    li.querySelector('.update-status')?.addEventListener('click', () => {
        updateOrderStatus(order._id, getNextStatus(status));
        window.reloadMap?.();
    });

    return li;
}

function groupOrdersByStatus(orders) {
    return orders.reduce((groups, order) => {
        const status = order.status;
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(order);
        groups[status].sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
        return groups;
    }, {});
}

function getNextStatus(currentStatus) {
    const statusFlow = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : currentStatus;
}

async function cancelOrder(orderId) {
    try {
        await $.ajax({
            url: `/api/users/orders/${orderId}/cancel`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        alert('Order cancelled successfully!');
        loadOrderHistory();
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
    }
}

async function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order from the list? This action cannot be undone.')) {
        try {
            await $.ajax({
                url: `/api/users/orders/${orderId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Order deleted successfully!');
            loadOrderHistory();
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        }
    }
}

function updateProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(user.id);
    const updatedData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value
    };
    console.log(updatedData);
    $.ajax({
        url: `/api/users/${user.id}`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: JSON.stringify(updatedData),
        contentType: 'application/json'
    })
    .then(function(response) {
        alert('Profile updated successfully!');
        document.getElementById('editProfileModal').style.display = 'none';
        loadUserProfile();
    })
    .catch(function(error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    });
}

function showChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'block';
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!isValidPassword(newPassword)) {
        alert('Password must be at least 8 characters long and contain at least one number and one letter.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }

    $.ajax({
        url: `/api/auth/${user.id}/change-password`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        data: JSON.stringify({ currentPassword, newPassword }),
        contentType: 'application/json'
    })
    .then(function(response) {
        alert('Password changed successfully!');
        document.getElementById('changePasswordModal').style.display = 'none';
    })
    .catch(function(error) {
        console.error('Error changing password:', error);
        alert('Failed to change password. Please try again.');
    });
}

function deleteAccount() {
    $.ajax({
        url: `/api/users/${user.id}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(response) {
            alert('Account deleted successfully!');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        },
        error: function(xhr) {
            console.error('Error deleting account:', xhr.responseText);
            if (xhr.status === 400) {
                alert('Cannot delete account: You have active orders.');
            } else {
                alert('Failed to delete account. Please try again.');
            }
        }
    });
}

function isValidPassword(password) {
    return password.length >= 8 && 
           /[A-Za-z]/.test(password) && 
           /\d/.test(password);
}