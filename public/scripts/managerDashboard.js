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

async function verifyAdmin(){
    try {
        const response = await fetch('/api/admin/check', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Unauthorized: Token may be invalid or expired');
            } else {
                console.error('Error checking admin status:', response.statusText);
            }
            return false;
        }

        const data = await response.json();
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

            if(status == 'Processing' && groupedOrders[status].length > 0)
            {
                mapDiv.style.display = "block";
                mapDiv.style.height = "400px";
                mapDiv.style.width = "100%";
                groupDiv.appendChild(mapDiv);
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
            `<button class="update-status">Move to ${getNextStatus(status)}</button>` : ''}
        ${status === 'Pending' ? 
            `<button onclick="cancelOrder('${order._id}')">Cancel Order</button>` : ''}
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

//inventory

async function loadInventory() {
    try {
        const response = await fetch('/api/flowers');
        const flowersData = await response.json();
        const flowers = flowersData.flowers;
        console.log(flowers);
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
