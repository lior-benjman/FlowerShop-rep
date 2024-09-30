document.addEventListener('DOMContentLoaded', function() {
    const userActionsDiv = document.querySelector('.user-actions');
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    function createButton(text, className, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        button.onclick = onClick;
        return button;
    }

    function createLoginButton() {
        const loginButton = createButton('Log In', 'login-button', () => window.location.href = 'login.html');
        const img = document.createElement('img');
        img.src = "../images/user2_white_corrected.png";
        img.alt = "Login Icon";
        img.className = "login-icon";
        loginButton.prepend(img);
        return loginButton;
    }

    function createLogoutButton() {
        return createButton('Logout', 'logout-button', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            updateHeader();
            window.location.href = 'index.html';
        });
    }

    function createUserButton(username, isAdmin) {
        const userButton = createButton(username, 'login-button', () => {
            if (user && isAdmin) {
                window.location.href = 'indexAdmin.html';
            } else {
                window.location.href = 'profile.html';
            }
        });
        const img = document.createElement('img');
        img.src = "../images/user2_white_corrected.png";
        img.alt = "User Icon";
        img.className = "login-icon";
        userButton.prepend(img);
        return userButton;
    }

    function getCartItemCount() {
        if (!user) return Promise.resolve(0);
        return $.ajax({
            url: `/api/users/cart/${user.id}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(function(data) {
            return data.itemCount || 0;
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching cart:', textStatus, errorThrown);
            return 0;
        });
    }

    function checkTokenValidity() {
        if (!token) return Promise.resolve(false);
        return $.ajax({
            url: '/api/auth/check-token',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(function() {
            return true;
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error checking token validity:', textStatus, errorThrown);
            return false;
        });
    }

    function checkAdminStatus() {
        if (!token) return Promise.resolve(false);
        return $.ajax({
            url: '/api/admin/check',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(function(data) {
            return data.isAdmin;
        }).catch(function(jqXHR) {
            console.error('Error checking admin status:', jqXHR.responseText);
            return false;
        });
    }

    function updateHeader() {
        Promise.all([
            checkTokenValidity().catch(() => false),
            checkAdminStatus().catch(() => false),
            getCartItemCount().catch(() => 0)
        ])
        .then(function([isTokenValid, isAdmin, itemCount]) {
            userActionsDiv.innerHTML = '';
            if (isTokenValid && user && user.username) {
                userActionsDiv.appendChild(createUserButton(user.username, isAdmin));
                userActionsDiv.appendChild(createLogoutButton());
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                userActionsDiv.appendChild(createLoginButton());
            }
    
            const cartLink = document.createElement('a');
            cartLink.href = "cart.html";
            cartLink.textContent = `Cart (${itemCount})`;
            cartLink.id = 'cart-count';
            userActionsDiv.appendChild(cartLink);
        })
        .catch(function(error) {
            console.error('Error updating header:', error);
            userActionsDiv.innerHTML = '';
            userActionsDiv.appendChild(createLoginButton());
        });
    }
    updateHeader();
});