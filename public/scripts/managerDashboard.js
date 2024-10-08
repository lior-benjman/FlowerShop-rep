document.addEventListener('DOMContentLoaded', function() {
    checkAndRouteUser();
    loadInventory();
    loadOrders();
    loadStatistics();
    
    document.getElementById('addProductBtn').addEventListener('click', showAddProductForm);
    document.getElementById('cancelAddProduct').addEventListener('click', toggleAddProductForm);
    document.getElementById('addFlowerForm').addEventListener('submit', addNewProduct);

    document.getElementById('inventoryViewBtn').addEventListener('click', () => toggleView('inventoryView'));
    document.getElementById('ordersViewBtn').addEventListener('click', () => toggleView('ordersView'));
    document.getElementById('statsViewBtn').addEventListener('click', () => toggleView('statsView'));

    document.getElementById('sortOption').addEventListener('change', applyFiltersAndSort);
    document.querySelectorAll('input[name="status"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFiltersAndSort);
    });
    document.getElementById('startDate').addEventListener('change', applyFiltersAndSort);
    document.getElementById('endDate').addEventListener('change', applyFiltersAndSort);

        
});

const token = localStorage.getItem('token');

const mapDiv = document.getElementById('map');

//verify admin
async function checkAndRouteUser() {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
        window.location.href = 'index.html';
    }
}

async function verifyAdmin() {
    try {
        const data = await $.ajax({
            url: '/api/admin/check',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return data.isAdmin === true;
    } catch (error) {
        console.error('Error verifying admin:', error);
        return false;
    }
}

//navigation

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

//statistics

async function loadStatistics() {
    try {
        const [ordersRevenueData, revenueByItemData, topSellingFlowersData] = await Promise.all([
            $.ajax({
                url: '/api/admin/statistics/orders-revenue',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }),
            $.ajax({
                url: '/api/admin/statistics/revenue-by-item',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }),
            $.ajax({
                url: '/api/admin/statistics/top-selling-flowers',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        ]);

        createOrdersRevenueChart(ordersRevenueData);
        createRevenueByItemChart(revenueByItemData);
        createTopSellingFlowersChart(topSellingFlowersData);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function createOrdersRevenueChart(data) {
    d3.select('#ordersRevenueChart').selectAll('*').remove();

    const margin = {top: 20, right: 60, bottom: 30, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#ordersRevenueChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y1 = d3.scaleLinear().range([height, 0]);
    const y2 = d3.scaleLinear().range([height, 0]);

    x.domain(data.labels);
    y1.domain([0, d3.max(data.orders)]);
    y2.domain([0, d3.max(data.revenue)]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g').call(d3.axisLeft(y1));
    svg.append('g')
        .attr('transform', `translate(${width},0)`)
        .call(d3.axisRight(y2));

    const line1 = d3.line()
        .x((d, i) => x(data.labels[i]) + x.bandwidth() / 2)
        .y(d => y1(d));

    const line2 = d3.line()
        .x((d, i) => x(data.labels[i]) + x.bandwidth() / 2)
        .y(d => y2(d));

    svg.append('path')
        .datum(data.orders)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line1);

    svg.append('path')
        .datum(data.revenue)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', line2);

    svg.append('text')
        .attr('x', width - 100)
        .attr('y', 20)
        .attr('fill', 'steelblue')
        .text('Orders');

    svg.append('text')
        .attr('x', width - 100)
        .attr('y', 40)
        .attr('fill', 'red')
        .text('Revenue');
}

function createRevenueByItemChart(data) {
    d3.select('#revenueByItemChart').selectAll('*').remove();

    const margin = {top: 20, right: 20, bottom: 100, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#revenueByItemChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(data.labels);
    y.domain([0, d3.max(data.revenue)]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .style('font-size', '12px');

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.selectAll('.bar')
        .data(data.revenue)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d, i) => x(data.labels[i]))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d))
        .attr('height', d => height - y(d))
        .attr('fill', 'steelblue');

    svg.selectAll('.label')
        .data(data.revenue)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', (d, i) => x(data.labels[i]) + x.bandwidth() / 2)
        .attr('y', d => y(d) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d.toFixed(2))
        .style('font-size', '14px');
}

function createTopSellingFlowersChart(data) {
    d3.select('#topSellingFlowersChart').selectAll('*').remove();

    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 3;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select('#topSellingFlowersChart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
        .value(d => d)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.6);

    const outerArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.7);

    const arcs = svg.selectAll('arc')
        .data(pie(data.quantities))
        .enter()
        .append('g');

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i));

    arcs.append('polyline')
        .attr('points', function(d) {
            const pos = outerArc.centroid(d);
            pos[0] = radius * 0.8 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos];
        })
        .style('fill', 'none')
        .style('stroke', 'black');

    arcs.append('text')
        .attr('dy', '.35em')
        .attr('transform', function(d) {
            const pos = outerArc.centroid(d);
            pos[0] = radius * 0.82 * (midAngle(d) < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .attr('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
        .text((d, i) => `${data.labels[i]} (${d.data})`)
        .style('font-size', '12px')
        .style('fill', 'black');  // Ensure text color is visible

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
}

//orders

async function loadOrders() {
    try {
        const orders = await $.ajax({
            url: '/api/admin/orders',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        allOrders = orders;
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
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

    if (typeof window.reloadMap === 'function') {
        window.reloadMap(filteredOrders.filter(order => order.status === 'Processing'));
    }
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

        if (statusOrders.length > 3) {
            const showMoreButton = document.createElement('button');
            showMoreButton.textContent = 'Show More';
            showMoreButton.className = 'show-more-btn';
            showMoreButton.onclick = () => toggleOrders(groupDiv);
            groupDiv.appendChild(showMoreButton);
        }

        if(statusOrders){
            if(status == 'Processing' && statusOrders.length > 0){
                    mapDiv.style.display = "block";
                    mapDiv.style.height = "400px";
                    mapDiv.style.width = "100%";
                    groupDiv.appendChild(mapDiv);
            }
        }

        orderGroups.appendChild(groupDiv);
    });
}

function createOrderListItem(order, status) {
    const li = document.createElement('li');
    li.innerHTML = `
        Order #${order._id} - ${new Date(order.orderDate).toLocaleDateString()}
        <button onclick="viewOrderDetails('${order._id}')">View Details</button>
        ${status !== 'Cancelled' && status !== 'Delivered' ? 
            `<button class="update-status">Move to ${getNextStatus(status)}</button>` : ''}
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
                <li>${item.flower ? item.flower.name: "Deleted Flower"} - Quantity: ${item.quantity}</li>
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

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await $.ajax({
            url: `/api/admin/orders/${orderId}/status`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: 'application/json',
            data: JSON.stringify({ status: newStatus })
        });

        alert('Order status updated successfully!');
        loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
    }
}

async function cancelOrder(orderId) {
    try {
        await $.ajax({
            url: `/api/admin/orders/${orderId}/cancel`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        alert('Order cancelled successfully!');
        loadOrders();
        loadInventory();
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. Please try again.');
    }
}

async function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order from the list? This action cannot be undone.')) {
        try {
            await $.ajax({
                url: `/api/admin/orders/${orderId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Order deleted successfully!');
            loadOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        }
    }
}

//inventory

async function loadInventory() {
    try {
        const flowersData = await $.ajax({
            url: '/api/flowers?viewAll=true',
            method: 'GET'
        });
        const flowers = flowersData.flowers;
        displayInventory(flowers);
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
                    <button class="edit-btn" onclick="openEditFlower('${flower._id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteFlower('${flower._id}')">Delete</button>
                </td>
            </tr>
        `;
        inventoryTable.innerHTML += row;
    });
}

async function updateStock(flowerId, newStock) {
    try {
        await $.ajax({
            url: `/api/admin/${flowerId}/stock`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: 'application/json',
            data: JSON.stringify({ stock: newStock })
        });

        alert('Stock updated successfully!');
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please try again.');
    }
}

async function deleteFlower(flowerId) {
    if (confirm('Are you sure you want to delete this flower? This action cannot be undone.')) {
        try {
            await $.ajax({
                url: `/api/admin/flowers/${flowerId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Flower deleted successfully!');
            loadInventory();
        } catch (error) {
            console.error('Error deleting flower:', error);
            alert('Failed to delete flower. Please try again.');
        }
    }
}

async function openEditFlower(flowerId) {
    try {
        const flower = await $.ajax({
            url: `/api/flowers/${flowerId}`,
            method: 'GET'
        });
        
        $('#editFlowerId').val(flower._id);
        $('#editName').val(flower.name);
        $('#editPrice').val(flower.price);
        $('#editDescription').val(flower.description);
        $('#editCategory').val(flower.category);
        $('#editColor').val(flower.color);
        $('#editImageUrl').val(flower.imageUrl);
        
        $('#editFlowerModal').show();
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
        await $.ajax({
            url: `/api/admin/${flowerId}`,
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: 'application/json',
            data: JSON.stringify(flowerData)
        });

        alert('Flower updated successfully!');
        $('#editFlowerModal').hide();
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
    
    try {
        await $.ajax({
            url: '/api/admin/add-flower',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: 'application/json',
            data: JSON.stringify(productData)
        });

        alert('Product added successfully!');
        event.target.reset();
        loadInventory();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
    }
}
