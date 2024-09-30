document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.querySelector('.product-grid');
    const loadMoreButton = document.querySelector('.load-more');
    const viewAllButton = document.querySelector('.view-all');

    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const categorySelect = document.getElementById('category-select');
    const colorSelect = document.getElementById('color-select');
    const applyFiltersButton = document.getElementById('apply-filters');
    
    window.addEventListener('resize', handleResize(resize, 400));

    let page = 1;
    let limit = calculateProductsPerRow();
    let isShopPage = window.location.pathname.includes('shop.html');
    let isIndexPage = window.location.pathname.includes('index.html');
    let isViewingAll = false;

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');


    function calculateProductsPerRow() {
        let screenWidth = window.innerWidth;
        screenWidth = Math.min(screenWidth, 1600);
        return Math.floor(screenWidth/340);
    }

    
    function resize() {
        limit = calculateProductsPerRow();
        loadProducts(true);
    }

    function handleResize(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async function fetchProducts(pageNum, pageLimit, filters = {}, viewAll = false) {
        try {
            let url = `/api/flowers?page=${pageNum}&limit=${pageLimit}`;
            
            if (viewAll) url += '&viewAll=true';
            if (filters.search) url += `&search=${filters.search}`;
            if (filters.sort) url += `&sort=${filters.sort}`;
            if (filters.category) url += `&category=${filters.category}`;
            if (filters.color) url += `&color=${filters.color}`;

            return $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            return { flowers: [] };
        }
    }

    function createProductElement(product) {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        imageContainer.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">`;

        productItem.appendChild(imageContainer);
        
        productItem.innerHTML += `
            <p>${product.name}</p>
            <p class="price">${product.price.toFixed(2)} ₪</p>
            <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
        `;


        return productItem;
    }

    async function loadProducts(reset = false) {
        let filters;
        if (reset) {
            productGrid.innerHTML = '';
            page = 1;
            if(!isIndexPage){
                if(!(searchInput.value || sortSelect.value || categorySelect.value || colorSelect.value)){
                    isViewingAll = false;
                }
            }
        }else{
            filters = {};
        }

        if(!filters){
            filters = {};
        }

        if(!isIndexPage){
            filters = {
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
        if (!user) {
            alert('Please log in to add items to your cart.');
            return;
        }

        try {
            const response = await $.ajax({
                url: '/api/users/cart/add',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    userId: user.id,
                    flowerId: productId,
                    quantity: 1
                })
            });

            alert('Product added to cart!');
            updateCartCount();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart. Please try again.');
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
                },
                dataType: 'json'
            });
    
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

    async function populateFilterOptions() {
        try {
            const options = await $.ajax({
                url: '/api/flowers/filter-options',
                method: 'GET',
                dataType: 'json'
            });

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