document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('register-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            $.ajax({
                url: '/api/auth/signup',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, firstName, lastName, email, password }),
                success: function(data) {
                    alert('Registration successful!');
                    window.location.href = 'login.html';
                },
                error: function(jqXHR) {
                    alert(jqXHR.responseJSON.message || 'Registration failed!');
                }
            });
        });
    }
});