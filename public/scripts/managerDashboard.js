// manager-dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    loadInventory();
    loadOrders();
    loadStatistics();
    
    document.getElementById('addProductBtn').addEventListener('click', showAddProductForm);
    document.getElementById('cancelAddProduct').addEventListener('click', toggleAddProductForm);
    document.getElementById('addFlowerForm').addEventListener('submit', addNewProduct);

    document.getElementById('inventoryViewBtn').addEventListener('click', () => toggleView('inventoryView'));
    document.getElementById('ordersViewBtn').addEventListener('click', () => toggleView('ordersView'));
    document.getElementById('statsViewBtn').addEventListener('click', () => toggleView('statsView'));

});

const token = localStorage.getItem('token');

function toggleView(viewId) {
    const views = document.querySelectorAll('.dashboard-view');
    views.forEach(view => view.style.display = 'none');

    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(viewId).style.display = 'block';
    document.querySelector(`button[id="${viewId}Btn"]`).classList.add('active');

    if (viewId === 'ordersView') {
        loadOrders();
    } else if (viewId === 'inventoryView') {
        loadInventory();
    } else if (viewId === 'statsView') {
        loadStatistics();
    }

}

async function loadStatistics() {
    try {
        const [ordersRevenueData, revenueByItemData, topSellingFlowersData] = await Promise.all([
            fetch('/api/admin/statistics/orders-revenue', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }).then(res => res.json()),
            fetch('/api/admin/statistics/revenue-by-item', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }).then(res => res.json()),
            fetch('/api/admin/statistics/top-selling-flowers', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }).then(res => res.json())
        ]);

        createOrdersRevenueChart(ordersRevenueData);
        createRevenueByItemChart(revenueByItemData);
        createTopSellingFlowersChart(topSellingFlowersData);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function createOrdersRevenueChart(data) {
    const ctx = document.getElementById('ordersRevenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Orders',
                    data: data.orders,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    yAxisID: 'y-axis-orders',
                },
                {
                    label: 'Revenue',
                    data: data.revenue,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    yAxisID: 'y-axis-revenue',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                'y-axis-orders': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Orders'
                    }
                },
                'y-axis-revenue': {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Revenue ($)'
                    }
                }
            }
        }
    });
}

function createRevenueByItemChart(data) {
    const ctx = document.getElementById('revenueByItemChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Revenue',
                data: data.revenue,
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue ($)'
                    }
                }
            }
        }
    });
}

function createTopSellingFlowersChart(data) {
    const ctx = document.getElementById('topSellingFlowersChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.quantities,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayOrders(orders) {
    const orderGroups = document.getElementById('orderGroups');
    orderGroups.innerHTML = '';

    const groupedOrders = groupOrdersByStatus(orders);
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    statuses.forEach(status => {
        if (groupedOrders[status]) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'order-group';
            groupDiv.innerHTML = `<h3>${status} Orders</h3>`;

            const orderList = document.createElement('ul');
            orderList.className = 'order-list';

            groupedOrders[status].forEach((order, index) => {
                const li = createOrderListItem(order, status);
                if (index < 3) {
                    li.style.display = 'block';
                } else {
                    li.style.display = 'none';
                    li.classList.add('hidden-order');
                }
                orderList.appendChild(li);
            });

            groupDiv.appendChild(orderList);

            if (groupedOrders[status].length > 3) {
                const showMoreButton = document.createElement('button');
                showMoreButton.textContent = 'Show More';
                showMoreButton.className = 'show-more-btn';
                showMoreButton.onclick = () => toggleOrders(groupDiv);
                groupDiv.appendChild(showMoreButton);
            }

            orderGroups.appendChild(groupDiv);
        }
    });
}

function createOrderListItem(order, status) {
    const li = document.createElement('li');
    li.innerHTML = `
        Order #${order._id} - ${new Date(order.orderDate).toLocaleDateString()}
        <button onclick="viewOrderDetails('${order._id}')">View Details</button>
        ${status !== 'Cancelled' && status !== 'Delivered' ? 
            `<button onclick="updateOrderStatus('${order._id}', '${getNextStatus(status)}')">
                Move to ${getNextStatus(status)}
             </button>` : ''}
        ${status === 'Pending' ? 
            `<button onclick="cancelOrder('${order._id}')">Cancel Order</button>` : ''}
    `;
    return li;
}

function toggleOrders(groupDiv) {
    const hiddenOrders = groupDiv.querySelectorAll('.hidden-order');
    const showMoreBtn = groupDiv.querySelector('.show-more-btn');

    hiddenOrders.forEach(order => {
        if (order.style.display === 'none') {
            order.style.display = 'block';
            showMoreBtn.textContent = 'Show Less';
        } else {
            order.style.display = 'none';
            showMoreBtn.textContent = 'Show More';
        }
    });
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

async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        const order = await response.json();
        
        const modalContent = document.getElementById('orderDetailsContent');
        modalContent.innerHTML = `
        <p><strong>Order ID:</strong> <span>${order._id}</span></p>
        <p><strong>Customer:</strong> <span>${order.user.username}</span></p>
        <p><strong>Order Date:</strong> <span>${new Date(order.orderDate).toLocaleString()}</span></p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
        <h4>Items:</h4>
        <ul>
            ${order.items.map(item => `
                <li>${item.flower.name} - Quantity: ${item.quantity}</li>
            `).join('')}
        </ul>
        <p><strong>Shipping Address:</strong> <span>${order.shippingAddress}</span></p>
        <p class="total-amount"><strong>Total Amount:</strong> <span>$${order.totalAmount.toFixed(2)}</span></p>
    `;
        
        document.getElementById('orderDetailsModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching order details:', error);
        alert('Failed to load order details. Please try again.');
    }
}

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            throw new Error('Failed to update order status');
        }

        alert('Order status updated successfully!');
        loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
    }
}

async function cancelOrder(orderId) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to cancel order');
        }

        alert('Order cancelled successfully!');
        loadOrders();
        loadInventory();
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
    }
}

async function loadInventory() {
    try {
        const response = await fetch('/api/flowers');
        const flowersData = await response.json();
        const flowers = flowersData.flowers;
        console.log(flowers);
        displayInventory(flowers);
        const response2 = await fetch('/api/users');
        const flowersData2 = await response2.json();
        console.log(flowersData2);
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

function displayInventory(flowers) {
    const inventoryTable = document.querySelector('.inventory-table tbody');
    inventoryTable.innerHTML = '';

    flowers.forEach(flower => {
        const row = `
            <tr>
                <td data-label="Product">${flower.name}</td>
                <td data-label="Stock Level">
                    <input type="number" value="${flower.stock || 0}" min="0" 
                           onchange="updateStock('${flower._id}', this.value)">
                </td>
                <td data-label="Actions">
                    <button onclick="openEditFlower('${flower._id}')">Edit</button>
                </td>
            </tr>
        `;
        inventoryTable.innerHTML += row;
    });
}

async function updateStock(flowerId, newStock) {
    try {
        const response = await fetch(`/api/admin/${flowerId}/stock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock: newStock }),
        });

        if (!response.ok) {
            throw new Error('Failed to update stock');
        }

        alert('Stock updated successfully!');
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please try again.');
    }
}

async function openEditFlower(flowerId) {
    try {
        const response = await fetch(`/api/flowers/${flowerId}`);
        const flower = await response.json();
        
        document.getElementById('editFlowerId').value = flower._id;
        document.getElementById('editName').value = flower.name;
        document.getElementById('editPrice').value = flower.price;
        document.getElementById('editDescription').value = flower.description;
        document.getElementById('editCategory').value = flower.category;
        document.getElementById('editColor').value = flower.color;
        document.getElementById('editImageUrl').value = flower.imageUrl;
        
        document.getElementById('editFlowerModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching flower details:', error);
        alert('Failed to load flower details. Please try again.');
    }
}

async function updateFlower(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const flowerData = Object.fromEntries(formData.entries());
    const flowerId = flowerData.id;

    try {
        const response = await fetch(`/api/admin/${flowerId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flowerData),
        });

        if (!response.ok) {
            throw new Error('Failed to update flower');
        }

        alert('Flower updated successfully!');
        document.getElementById('editFlowerModal').style.display = 'none';
        loadInventory();
    } catch (error) {
        console.error('Error updating flower:', error);
        alert('Failed to update flower. Please try again.');
    }
}

function toggleAddProductForm() {
    const form = document.getElementById('addFlowerForm');
    const addBtn = document.getElementById('addProductBtn');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        addBtn.textContent = 'Cancel';
    } else {
        form.style.display = 'none';
        addBtn.textContent = 'Add Product';
        // Reset form fields
        form.reset();
    }
}

function closeEditModal() {
    document.getElementById('editFlowerModal').style.display = 'none';
}

function showAddProductForm() {
    document.getElementById('addFlowerForm').style.display = 'block';
}

async function addNewProduct(event) {

    event.preventDefault();

    const formData = new FormData(event.target);
    const productData = Object.fromEntries(formData.entries());
    console.log(productData);
    try {
        const response = await fetch('/api/admin/add-flower', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            alert('Product added successfully!');
            event.target.reset();
            loadInventory();
        } else {
            throw new Error('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
    }
}

function reorderProduct(flowerId) {

    console.log('Reorder product:', flowerId);

}