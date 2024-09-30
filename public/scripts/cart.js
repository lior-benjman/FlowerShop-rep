document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const modal = document.getElementById("checkout-modal");
const checkoutBtn = document.getElementById("checkout-button");
const span = document.getElementsByClassName("close")[0];

checkoutBtn.onclick = async function() {
    modal.style.display = "block";
    await fetchUserDetails();
}


span.onclick = function() {
    modal.style.display = "none";
}


window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


document.getElementById("checkout-form").onsubmit = async function(e) {
    e.preventDefault();
    const shippingAddress  = document.getElementById('address').value;
    
    if (!shippingAddress .trim()) {
        alert("Please enter a valid shipping address.");
        return;
    }

    try {
        await createOrderFromCart({ shippingAddress  });
        console.log("Order created successfully!");
        modal.style.display = "none";
        alert("Thank you for your purchase! Your order has been placed.");
        window.location.href = '';
    } catch (error) {
        console.error("Error creating order:", error);
        alert("There was an error processing your order. Please try again.");
    }
}

async function createOrderFromCart(shippingAddress) {
    try {
        const orderData = await $.ajax({
            url: `/api/users/cart/create-from-cart/${user.id}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: 'application/json',
            data: JSON.stringify(shippingAddress)
        });
        return orderData;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}


async function fetchUserDetails() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        console.error('User not logged in');
        return;
    }

    try {
        const userData = await $.ajax({
            url: `/api/users/${user.id}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        $('#name').val(userData.firstName + " " + userData.lastName);
        $('#email').val(userData.email);
        $('#address').val(userData.address || '');

    } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to load user details. Please fill in the form manually.');
    }
}

async function loadCart() {
    if (!user) {
        alert('Please log in to view your cart.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const cartData = await $.ajax({
            url: `/api/users/cart/${user.id}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        renderCart(cartData);
    } catch (error) {
        console.error('Error loading cart:', error);
        alert('Failed to load cart. Please try again.');
    }
}

function renderCart(cartData) {
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = '';

    if (cartData.items.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        updateCartSummary(cartData, true);
        return;
    }

    cartData.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.flower.imageUrl}" alt="${item.flower.name}">
            <div class="item-details">
                <h3>${item.flower.name}</h3>
                <p>Price: ${item.flower.price.toFixed(2)}₪</p>
                <div class="quantity-control">
                    <button onclick="updateQuantity('${item.flower._id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.flower._id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-button" onclick="removeFromCart('${item.flower._id}')">Remove</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    updateCartSummary(cartData, false);
}

function updateCartSummary(cartData, resetCart) {
    let subtotal = 0;
    let shipping = 0;
    let total = 0;
    
    if(!resetCart){
        subtotal = cartData.items.reduce((total, item) => total + (item.flower.price * item.quantity), 0);
        shipping = calculateShippingCost(subtotal);
        total = subtotal + shipping;
    }

    document.getElementById('cart-subtotal').textContent = `${subtotal.toFixed(2)}₪`;
    document.getElementById('cart-shipping').textContent = `${shipping.toFixed(2)}₪`;
    document.getElementById('cart-total').textContent = `${total.toFixed(2)}₪`;
}

function calculateShippingCost(subtotal){
    if (subtotal > 150){
        return 0;
    } else {
        return 10;
    }
}

async function updateQuantity(flowerId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(flowerId);
        return;
    }
    try {
        await $.ajax({
            url: '/api/users/cart/update',
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: 'application/json',
            data: JSON.stringify({
                userId: user.id,
                flowerId: flowerId,
                quantity: newQuantity
            })
        });

        loadCart();
        updateCartCount();
    } catch (error) {
        console.error('Error updating cart:', error);
        alert('Failed to update cart. Please try again.');
    }
}

async function removeFromCart(flowerId) {
    try {
        await $.ajax({
            url: '/api/users/cart/remove',
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            contentType: 'application/json',
            data: JSON.stringify({
                userId: user.id,
                flowerId: flowerId
            })
        });

        loadCart();
        updateCartCount();
    } catch (error) {
        console.error('Error removing item from cart:', error);
        alert('Failed to remove item from cart. Please try again.');
    }
}

async function updateCartCount() {
    if (!user) {
        console.log('User not logged in');
        return;
    }

    try {
        const cartData = await $.ajax({
            url: `/api/users/cart/${user.id}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const cartCount = cartData.items.reduce((total, item) => total + item.quantity, 0);

        const cartCountElement = $('#cart-count');
        if (cartCountElement.length) {
            cartCountElement.text(`Cart (${cartCount})`);
            cartCountElement.css('display', cartCount > 0 ? 'inline' : 'none');
        }
    
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

document.getElementById('checkout-button').addEventListener('click', function() {
    // Implement checkout logic here
    // Redirect to checkout page or open checkout modal
});