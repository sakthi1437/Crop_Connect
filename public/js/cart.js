document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('cart-root');

  const loadCart = async () => {
    try {
      const response = await apiRequest('/cart');
      const cart = response.data;

      if (!cart || !cart.items || cart.items.length === 0) {
        root.innerHTML = '<div class="panel"><h2>Your cart is empty.</h2><p>Explore fresh crops from local farmers.</p><a href="/products.html" class="btn btn-primary">Shop Crops</a></div>';
        return;
      }

      const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryFee = cart.items.length ? 35 : 0;
      const total = subtotal + deliveryFee;

      root.innerHTML = `
        <div class="panel">
          ${cart.items.map((item) => `
            <div class="cart-item" style="margin-bottom: 18px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
              <img src="${item.image || 'https://images.unsplash.com/photo-1464226184884-fa52add7c5b2?auto=format&fit=crop&w=800&q=80'}" alt="${item.productName}" />
              <div>
                <h3>${item.productName}</h3>
                <p>Farmer: ${item.farmerName}</p>
                <p>Price: ${formatCurrency(item.price)} / ${item.unit}</p>
                <div class="qty-box">
                  <button type="button" class="decrease" data-product-id="${item.productId}">-</button>
                  <span>${item.quantity}</span>
                  <button type="button" class="increase" data-product-id="${item.productId}">+</button>
                </div>
              </div>
              <div>
                <strong>${formatCurrency(item.subtotal)}</strong>
                <div><button class="btn btn-outline remove-item" data-product-id="${item.productId}">Remove</button></div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="summary-box">
          <h2>Order Summary</h2>
          <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
          <div class="summary-row"><span>Delivery fee</span><span>${formatCurrency(deliveryFee)}</span></div>
          <div class="summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
          <a class="btn btn-primary" href="/checkout.html" style="display: block; margin-top: 16px; width: 100%;">Proceed to Checkout</a>
        </div>
      `;

      document.querySelectorAll('.increase').forEach((button) => {
        button.addEventListener('click', async () => {
          const productId = button.dataset.productId;
          const item = cart.items.find((entry) => entry.productId === productId);
          if (!item) return;
          try {
            await apiRequest(`/cart/${productId}`, {
              method: 'PUT',
              body: JSON.stringify({ quantity: item.quantity + 1 })
            });
            loadCart();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
      });

      document.querySelectorAll('.decrease').forEach((button) => {
        button.addEventListener('click', async () => {
          const productId = button.dataset.productId;
          const item = cart.items.find((entry) => entry.productId === productId);
          if (!item) return;
          try {
            await apiRequest(`/cart/${productId}`, {
              method: 'PUT',
              body: JSON.stringify({ quantity: item.quantity - 1 })
            });
            loadCart();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
      });

      document.querySelectorAll('.remove-item').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await apiRequest(`/cart/${button.dataset.productId}`, { method: 'DELETE' });
            loadCart();
          } catch (error) {
            showToast(error.message, 'error');
          }
        });
      });
    } catch (error) {
      root.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
    }
  };

  loadCart();
});
