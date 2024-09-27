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

document.getElementById("checkout-form").onsubmit = function(e) {
    e.preventDefault();

    console.log("Form submitted!");
    modal.style.display = "none";
    alert("Thank you for your purchase!");
}

async function fetchUserDetails() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        console.error('User not logged in');
        return;
    }

    try {
        const response = await fetch(`/api/users/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const userData = await response.json();
        console.log(userData);
        
        document.getElementById('name').value = userData.firstName +" "+ userData.lastName;
        document.getElementById('email').value = userData.email;
        document.getElementById('address').value = userData.address || '';

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
        const response = await fetch(`/api/users/cart/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart data');
        }

        const cartData = await response.json();
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
        return;
    }

    cartData.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.flower.imageUrl}" alt="${item.flower.name}">
            <div class="item-details">
                <h3>${item.flower.name}</h3>
                <p>Price: $${item.flower.price.toFixed(2)}</p>
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

    updateCartSummary(cartData);
}

function updateCartSummary(cartData) {
    const subtotal = cartData.items.reduce((total, item) => total + (item.flower.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0; // Example shipping cost
    const total = subtotal + shipping;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

async function updateQuantity(flowerId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(flowerId);
        return;
    }
    try {
        const response = await fetch('/api/users/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: user.id,
                flowerId: flowerId,
                quantity: newQuantity
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update cart');
        }

        loadCart();
        updateCartCount();
    } catch (error) {
        console.error('Error updating cart:', error);
        alert('Failed to update cart. Please try again.');
    }
}

async function removeFromCart(flowerId) {
    try {
        const response = await fetch('/api/users/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: user.id,
                flowerId: flowerId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from cart');
        }

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
        const response = await fetch(`/api/users/cart/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart data');
        }

        const cartData = await response.json();
        const cartCount = cartData.items.reduce((total, item) => total + item.quantity, 0);

        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = `Cart (${cartCount})`;
            cartCountElement.style.display = cartCount > 0 ? 'inline' : 'none';
        }
    
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

document.getElementById('checkout-button').addEventListener('click', function() {
    // Implement checkout logic here
    // Redirect to checkout page or open checkout modal
});