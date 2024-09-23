document.addEventListener('DOMContentLoaded', function() {
    const userActionsDiv = document.querySelector('.user-actions');
    const user = JSON.parse(localStorage.getItem('user'));

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
                window.location.href = 'admin.html';
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

    async function getCartItemCount() {
        if (!user) return 0;
        try {
            const response = await fetch(`/api/users/cart/${user.id}`);
            const data = await response.json();
            return data.itemCount || 0;
        } catch (error) {
            console.error('Error fetching cart:', error);
            return 0;
        }
    }

    async function updateHeader() {
        const isAdmin = await checkAdminStatus();
        userActionsDiv.innerHTML = '';
        if (user && user.username) {
            userActionsDiv.appendChild(createUserButton(user.username, isAdmin));
            userActionsDiv.appendChild(createLogoutButton());
        } else {
            userActionsDiv.appendChild(createLoginButton());
        }

        const itemCount = await getCartItemCount();
        const cartLink = document.createElement('a');
        cartLink.href = "cart.html";
        cartLink.textContent = `Cart (${itemCount})`;
        userActionsDiv.appendChild(cartLink);
    }

    async function checkAdminStatus() {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch('/api/admin/check', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 403) {
                return false; // User is not an admin
            }
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    updateHeader();
});