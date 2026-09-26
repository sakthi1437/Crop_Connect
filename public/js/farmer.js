document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user || user.role !== 'farmer') {
    window.location.href = '/login.html';
    return;
  }

  const dashboardRoot = document.getElementById('farmer-dashboard-root');
  if (dashboardRoot) {
    try {
      const response = await apiRequest('/users/dashboard');
      const data = response.data;
      dashboardRoot.innerHTML = `
        <div class="grid grid-4">
          <div class="card feature-card"><h3>Total Products</h3><p>${data.totalProducts || 0}</p></div>
          <div class="card feature-card"><h3>Active Products</h3><p>${data.activeProducts || 0}</p></div>
          <div class="card feature-card"><h3>Pending Orders</h3><p>${data.pendingOrders || 0}</p></div>
          <div class="card feature-card"><h3>Total Sales</h3><p>${formatCurrency(data.totalSales || 0)}</p></div>
        </div>
      `;
    } catch (error) {
      dashboardRoot.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
    }
  }

  const productRoot = document.getElementById('farmer-products-root');
  if (productRoot) {
    try {
      const response = await apiRequest(`/products/farmer/${user.id}`);
      const products = response.data || [];

      if (!products.length) {
        productRoot.innerHTML = '<div class="panel"><p>You haven\'t listed any crops yet.</p></div>';
        return;
      }

      productRoot.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Crop</th><th>Category</th><th>Price</th><th>Qty</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${products.map((product) => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${formatCurrency(product.price)}</td>
                  <td>${product.quantity}</td>
                  <td><span class="status-pill status-${(product.status || 'AVAILABLE').toLowerCase()}">${product.status}</span></td>
                  <td><button class="btn btn-outline delete-product" data-id="${product._id}">Delete</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      document.querySelectorAll('.delete-product').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await apiRequest(`/products/${button.dataset.id}`, { method: 'DELETE' });
            showToast('Product deleted', 'success');
            location.reload();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
      });
    } catch (error) {
      productRoot.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
    }
  }

  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(addProductForm);

      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to add product');
        showToast(result.message, 'success');
        setTimeout(() => window.location.href = '/farmer/products.html', 800);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  }
});
