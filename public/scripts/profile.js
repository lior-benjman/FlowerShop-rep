document.addEventListener('DOMContentLoaded', function() {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    loadUserProfile();
    loadOrderHistory();

    $('#editProfileBtn').on('click', function() {
        showEditProfileModal();
    });

    $('.close').on('click', function() {
        $('#editProfileModal').hide();
    });

    $(window).on('click', function(event) {
        if (event.target == $('#editProfileModal')[0]) {
            $('#editProfileModal').hide();
        }
    });

    $('#editProfileForm').on('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });

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
            displayOrders(orders)
        },
        error: function(xhr) {
            console.error('Error loading order history:', xhr.responseText);
        }
    });
}

function showEditProfileModal() {
    $('#editProfileModal').show();
}

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

async function viewOrderDetails(orderId) {
    try {
        const order = await $.ajax({
            url: `/api/orders/${orderId}`,
            method: 'GET'
        });
        
        let shippingCost = order.totalAmount > 150 ? 0 : 10;
        
        const modalContent = $('#orderDetailsContent');
        modalContent.html(`
        <p><strong>Order ID:</strong> <span>${order._id}</span></p>
        <p><strong>Customer:</strong> <span>${order.user.username}</span></p>
        <p><strong>Order Date:</strong> <span>${new Date(order.orderDate).toLocaleString()}</span></p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
        <h4>Items:</h4>
        <ul>
            ${order.items.map(item => `
                <li>${item.flower.name} - Quantity: ${item.quantity}</li>
            `).join('')}
            <li>Shipping: ${shippingCost}₪</li>
        </ul>
        <p><strong>Shipping Address:</strong> <span>${order.shippingAddress}</span></p>
        <p class="total-amount"><strong>Total Amount:</strong> <span>${(order.totalAmount+shippingCost).toFixed(2)}₪</span></p>
        `);
        
        $('#orderDetailsModal').show();
    } catch (error) {
        console.error('Error fetching order details:', error);
        alert('Failed to load order details. Please try again.');
    }
}

function displayOrders(orders) {
    const orderGroups = document.getElementById('orderGroups');
    orderGroups.innerHTML = '';

    const groupedOrders = groupOrdersByStatus(orders);
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    statuses.forEach(status => {
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'order-group';
        groupDiv.innerHTML = `<h3>${status} Orders</h3>`;
        
        const orderList = document.createElement('ul');
        orderList.className = 'order-list';
        
        if (groupedOrders[status]) {
            groupedOrders[status].forEach((order) => {
                const li = createOrderListItem(order, status);
                orderList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.innerHTML = 'Nothing to see here yet...';
            orderList.appendChild(li);
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
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        email: $('#email').val(),
        address: $('#address').val()
    };
    console.log(updatedData);
    $.ajax({
        url: `/api/users/${user.id}`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: JSON.stringify(updatedData),
        contentType: 'application/json',
        success: function(response) {
            alert('Profile updated successfully!');
            $('#editProfileModal').hide();
            loadUserProfile();
        },
        error: function(xhr) {
            console.error('Error updating profile:', xhr.responseText);
            alert('Failed to update profile. Please try again.');
        }
    });
}