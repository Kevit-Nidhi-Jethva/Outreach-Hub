// login.ts

interface LoginResponse {
  access_token: string;
  username?: string;
  role?: string;
  message?: string;
}

const loginForm = document.getElementById('login-form') as HTMLFormElement | null;

if (loginForm) {
  loginForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;

    if (!usernameInput || !passwordInput) {
      alert("Form elements not found");
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data: LoginResponse = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.access_token) {
        const jwtToken = data.access_token;

        // decode JWT payload safely
        try {
          const base64Payload = jwtToken.split('.')[1];
          const payload = JSON.parse(atob(base64Payload));
          console.log("payload", payload);

          localStorage.setItem('userdata', JSON.stringify(payload));
          localStorage.setItem('access_token', jwtToken);

          // redirect after successful login
          window.location.href = './dashboard.html';
        } catch (decodeError) {
          console.error("Error decoding JWT:", decodeError);
          alert("Failed to process login token.");
        }
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to connect to server.');
    }
  });
} else {
  console.error("Login form not found in DOM");
}
