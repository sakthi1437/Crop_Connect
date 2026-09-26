document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('orders-root');

  try {
    const response = await apiRequest('/orders');
    const orders = response.data || [];

    if (!orders.length) {
      root.innerHTML = '<div class="panel"><p>You haven\'t placed any orders yet.</p></div>';
      return;
    }

    root.innerHTML = orders.map((order) => `
      <div class="panel" style="margin-bottom: 18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 12px;">
          <div>
            <strong>Order #${order._id.slice(-6)}</strong>
            <div class="small-muted">${new Date(order.createdAt).toDateString()}</div>
          </div>
          <span class="status-pill status-${(order.orderStatus || 'PENDING').toLowerCase()}">${order.orderStatus}</span>
        </div>
        <div class="small-muted">Farmer: ${order.farmerName}</div>
        <p>Total: ${formatCurrency(order.totalAmount)}</p>
        <ul>
          ${order.items.map((item) => `<li>${item.productName} x ${item.quantity}</li>`).join('')}
        </ul>
        <div class="product-actions">
          <button class="btn btn-outline cancel-order" data-order-id="${order._id}">Cancel</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.cancel-order').forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await apiRequest(`/orders/${button.dataset.orderId}/cancel`, { method: 'PUT' });
          showToast('Order cancelled', 'success');
          location.reload();
        } catch (error) {
          showToast(error.message, 'error');
        }
      });
    });
  } catch (error) {
    root.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
  }
});
