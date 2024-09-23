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

    function createUserButton(username) {
        const userButton = createButton(username, 'login-button', () => window.location.href = 'profile.html');
        const img = document.createElement('img');
        img.src = "../images/user2_white_corrected.png";
        img.alt = "User Icon";
        img.className = "login-icon";
        userButton.prepend(img);
        return userButton;
    }

    function updateHeader() {
        userActionsDiv.innerHTML = '';

        if (user && user.username) {
            userActionsDiv.appendChild(createUserButton(user.username));
            userActionsDiv.appendChild(createLogoutButton());
        } else {
            userActionsDiv.appendChild(createLoginButton());
        }

        const cartLink = document.createElement('a');
        cartLink.href = "cart.html";
        cartLink.textContent = "Cart (0)";
        userActionsDiv.appendChild(cartLink);
    }

    updateHeader();
});