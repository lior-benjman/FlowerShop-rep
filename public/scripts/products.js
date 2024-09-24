document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.querySelector('.product-grid');
    const loadMoreButton = document.querySelector('.load-more button');
    const viewAllButton = document.querySelector('.view-all button');

    const urlParams = new URLSearchParams(window.location.search);
    const viewAll = urlParams.get('viewAll') === 'true';

    let page = 1;
    const limit = 4;
    let isShopPage = window.location.pathname.includes('shop.html');


    async function fetchProducts(pageNum, pageLimit, viewAll = false) {
        try {
            const url = viewAll 
                ? `/api/flowers?viewAll=true` 
                : `/api/flowers?page=${pageNum}&limit=${pageLimit}`;
            const response = await fetch(url);
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return { flowers: [] };
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

    async function loadProducts(pageNum = page, pageLimit = limit) {
        const productsData = await fetchProducts(pageNum, pageLimit);
        const products = productsData.flowers;
        
        if (!products || products.length < 1) {
            loadMoreButton.style.display = 'none';
            return;
        }
        
        products.forEach(product => {
            const productElement = createProductElement(product);
            productGrid.appendChild(productElement);
        });
    
        if (products.length < pageLimit) {
            loadMoreButton.style.display = 'none';
        } else {
            page++;
        }
    }

    async function viewAllProducts() {
        if (!isShopPage) {
            window.location.href = 'shop.html?viewAll=true';
        } else {
            productGrid.innerHTML = '';
            loadMoreButton.style.display = 'none';
            
            const productsData = await fetchProducts(1, 1000, true);
            const products = productsData.flowers;
            
            products.forEach(product => {
                const productElement = createProductElement(product);
                productGrid.appendChild(productElement);
            });
        }
        viewAllButton.style.display = 'none';
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

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => loadProducts());
    }
    
    if (viewAllButton) {
        viewAllButton.addEventListener('click', viewAllProducts);
    }


    productGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = event.target.getAttribute('data-id');
            addToCart(productId);
        }
    });


    if (viewAll) {
        viewAllProducts();
    } else {
        loadProducts();
    }



});