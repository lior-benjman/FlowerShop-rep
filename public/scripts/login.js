document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            $.ajax({
                url: '/api/auth/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, password }),
                success: function(data) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    if (data.user.isAdmin) {
                        window.location.href = 'indexAdmin.html';
                    } else {
                        window.location.href = 'shop.html';
                    }
                },
                error: function(jqXHR) {
                    alert(jqXHR.responseJSON.message || 'Login failed!');
                }
            });
        });
    }
});