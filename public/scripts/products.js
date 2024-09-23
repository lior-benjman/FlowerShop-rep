document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.querySelector('.product-grid');
    const loadMoreButton = document.querySelector('.load-more button');
    let page = 1;
    const limit = 4;

    async function fetchProducts() {
        try {
            const response = await fetch(`/api/flowers?page=${page}&limit=${limit}`);
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    function createProductElement(product) {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <p>${product.name}</p>
            <p class="price">${product.price.toFixed(2)} ₪</p>
            <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
        `;
        return productItem;
    }

    async function loadProducts() {
        const products = await fetchProducts();
        products.forEach(product => {
            const productElement = createProductElement(product);
            productGrid.appendChild(productElement);
        });

        if (products.length < limit) {
            loadMoreButton.style.display = 'none';
        } else {
            page++;
        }
    }

    async function addToCart(productId) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please log in to add items to your cart.');
            return;
        }

        try {
            const response = await fetch('/api/auth/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    flowerId: productId,
                    quantity: 1
                })
            });

            if (response.ok) {
                alert('Product added to cart!');
                updateCartCount();
            } else {
                throw new Error('Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart. Please try again.');
        }
    }

    loadMoreButton.addEventListener('click', loadProducts);

    productGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = event.target.getAttribute('data-id');
            addToCart(productId);
        }
    });

    loadProducts();
});