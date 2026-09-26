document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('checkout-root');

  try {
    const response = await apiRequest('/cart');
    const cart = response.data;

    if (!cart || !cart.items || cart.items.length === 0) {
      root.innerHTML = '<div class="panel"><h2>Your cart is empty.</h2><a href="/products.html" class="btn btn-primary">Browse Crops</a></div>';
      return;
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = cart.items.length ? 35 : 0;
    const total = subtotal + deliveryFee;

    root.innerHTML = `
      <div class="panel">
        <h2>Delivery Address</h2>
        <div class="form-group">
          <label>Name</label>
          <input id="ship-name" type="text" value="${getUser()?.name || ''}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone</label>
            <input id="ship-phone" type="text" value="${getUser()?.phone || ''}" />
          </div>
          <div class="form-group">
            <label>Pincode</label>
            <input id="ship-pincode" type="text" value="" />
          </div>
        </div>
        <div class="form-group">
          <label>Address</label>
          <textarea id="ship-address"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>City</label>
            <input id="ship-city" type="text" value="" />
          </div>
          <div class="form-group">
            <label>District</label>
            <input id="ship-district" type="text" value="" />
          </div>
        </div>
        <div class="form-group">
          <label>State</label>
          <input id="ship-state" type="text" value="" />
        </div>
        <div class="form-group">
          <label>Payment Method</label>
          <select id="payment-method">
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>
        </div>
      </div>
      <div class="summary-box">
        <h2>Order Summary</h2>
        ${cart.items.map((item) => `
          <div class="summary-row"><span>${item.productName} x ${item.quantity}</span><span>${formatCurrency(item.subtotal)}</span></div>
        `).join('')}
        <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery fee</span><span>${formatCurrency(deliveryFee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
        <button class="btn btn-primary" id="place-order" style="width:100%; margin-top: 16px;">Place Order</button>
      </div>
    `;

    document.getElementById('place-order').addEventListener('click', async () => {
      const shippingAddress = {
        name: document.getElementById('ship-name').value,
        phone: document.getElementById('ship-phone').value,
        address: document.getElementById('ship-address').value,
        city: document.getElementById('ship-city').value,
        district: document.getElementById('ship-district').value,
        state: document.getElementById('ship-state').value,
        pincode: document.getElementById('ship-pincode').value,
      };

      try {
        const response = await apiRequest('/orders', {
          method: 'POST',
          body: JSON.stringify({ shippingAddress })
        });
        showToast(response.message, 'success');
        setTimeout(() => window.location.href = '/orders.html', 800);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  } catch (error) {
    root.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
  }
});
