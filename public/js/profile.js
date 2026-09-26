document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('profile-root');
  try {
    const response = await apiRequest('/users/profile');
    const user = response.data;

    root.innerHTML = `
      <h2>${user.name}</h2>
      <p>Email: ${user.email}</p>
      <p>Role: ${user.role}</p>
      <p>Phone: ${user.phone}</p>
      <p>Address: ${user.address || 'Not provided'}</p>
      <p>City: ${user.city || 'Not provided'}</p>
      <p>State: ${user.state || 'Not provided'}</p>
      <p>District: ${user.district || 'Not provided'}</p>
      <p>Pincode: ${user.pincode || 'Not provided'}</p>
    `;
  } catch (error) {
    root.innerHTML = `<p>${error.message}</p>`;
  }
});
