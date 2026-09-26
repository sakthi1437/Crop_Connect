document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const payload = {
        email: formData.get('email'),
        password: formData.get('password'),
      };

      try {
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setToken(response.data.token);
        setUser(response.data.user);
        showToast('Login successful', 'success');
        setTimeout(() => redirectToRoleHome(), 700);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        role: formData.get('role'),
        address: formData.get('address') || '',
        city: formData.get('city') || '',
        district: formData.get('district') || '',
        state: formData.get('state') || '',
        pincode: formData.get('pincode') || '',
        farmName: formData.get('farmName') || '',
        farmLocation: formData.get('farmLocation') || '',
        village: formData.get('village') || '',
      };

      try {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setToken(response.data.token);
        setUser(response.data.user);
        showToast('Registration successful', 'success');
        setTimeout(() => redirectToRoleHome(), 700);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }

  const roleSelect = document.getElementById('role-select');
  if (roleSelect) {
    const extraFields = document.getElementById('farmer-extra-fields');
    roleSelect.addEventListener('change', () => {
      if (roleSelect.value === 'farmer') {
        extraFields.classList.remove('hidden');
      } else {
        extraFields.classList.add('hidden');
      }
    });
  }

  if (isLoggedIn()) {
    const authMessage = document.getElementById('auth-message');
    if (authMessage) {
      authMessage.textContent = 'You are already logged in.';
    }
  }
});
