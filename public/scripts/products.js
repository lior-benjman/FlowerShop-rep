document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.querySelector('.product-grid');
    const loadMoreButton = document.querySelector('.load-more button');
    const viewAllButton = document.querySelector('.view-all button');

    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const colorSelect = document.getElementById('color-select');
    const applyFiltersButton = document.getElementById('apply-filters');
    

    let page = 1;
    const limit = 4;
    let isShopPage = window.location.pathname.includes('shop.html');
    let isIndexPage = window.location.pathname.includes('index.html');
    let isViewingAll = false;


    async function fetchProducts(pageNum, pageLimit, filters = {}, viewAll = false) {
        try {
            let url = `/api/flowers?page=${pageNum}&limit=${pageLimit}`;
            
            if (viewAll) url += '&viewAll=true';
            if (filters.search) url += `&search=${filters.search}`;
            if (filters.sort) url += `&sort=${filters.sort}`;
            if (filters.category) url += `&category=${filters.category}`;
            if (filters.color) url += `&color=${filters.color}`;

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

    async function loadProducts(reset = false) {
        if (reset) {
            productGrid.innerHTML = '';
            page = 1;
            isViewingAll = false;
        }

        let filters = {};

        if(!isIndexPage){
            const filters = {
                search: searchInput.value,
                sort: sortSelect.value,
                category: categorySelect.value,
                color: colorSelect.value
            };
        }

        const productsData = await fetchProducts(page, limit, filters, isViewingAll);
        const products = productsData.flowers;
        
        if (!products || products.length < 1) {
            loadMoreButton.style.display = 'none';
            return;
        }
        
        products.forEach(product => {
            const productElement = createProductElement(product);
            productGrid.appendChild(productElement);
        });
    
        if (isViewingAll || products.length < limit) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'block';
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

    async function viewAllProducts() {
        if (!isShopPage) {
            window.location.href = 'shop.html?viewAll=true';
        } else {
            productGrid.innerHTML = ''; 
            loadMoreButton.style.display = 'none';
            isViewingAll = true;
            
            const filters = {
                search: searchInput.value,
                sort: sortSelect.value,
                category: categorySelect.value,
                color: colorSelect.value
            };
            
            const productsData = await fetchProducts(1, 1000, filters, true);
            const products = productsData.flowers;
            
            products.forEach(product => {
                const productElement = createProductElement(product);
                productGrid.appendChild(productElement);
            });

            viewAllButton.style.display = 'none';
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

    async function populateFilterOptions() {
        try {
            const response = await fetch('/api/flowers/filter-options');
            const options = await response.json();
            options.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

            options.colors.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                colorSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => loadProducts());
    }
    
    if (viewAllButton) {
        viewAllButton.addEventListener('click', viewAllProducts);
    }

    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', () => loadProducts(true));
    }

    productGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = event.target.getAttribute('data-id');
            addToCart(productId);
        }
    });


    // Only load initial products and populate filters if we're on the shop page
    if(!isIndexPage){
        populateFilterOptions();
    }
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('viewAll') === 'true') {
        viewAllProducts();
    } else {
        loadProducts();
    }

});