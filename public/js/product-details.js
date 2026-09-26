document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('product-details-root');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    root.innerHTML = '<div class="panel"><p>No product selected.</p></div>';
    return;
  }

  try {
    const response = await apiRequest(`/products/${id}`);
    const product = response.data;

    const reviewsResponse = await apiRequest(`/reviews/product/${id}`);
    const reviews = reviewsResponse.data || [];

    const averageRating = reviews.length
      ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    root.innerHTML = `
      <div class="grid" style="grid-template-columns: 1.1fr 1fr; gap: 24px; align-items: start;">
        <div class="panel">
          <img src="${product.image || 'https://images.unsplash.com/photo-1464226184884-fa52add7c5b2?auto=format&fit=crop&w=1200&q=80'}" alt="${product.name}" style="width:100%; height:440px; object-fit: cover; border-radius: 18px;" />
        </div>
        <div class="panel">
          <div class="badge badge-green">${product.organic ? 'Organic' : 'Non-organic'}</div>
          <h1>${product.name}</h1>
          <p class="price-row">${formatCurrency(product.price)} / ${product.unit}</p>
          <p>Available: ${product.quantity} ${product.unit}</p>
          <p>Farmer: ${product.farmerName}</p>
          <p>Location: ${product.location}</p>
          <p>Harvest Date: ${new Date(product.harvestDate).toDateString()}</p>
          <p>Category: ${product.category}</p>
          <p>Rating: ${averageRating} / 5</p>
          <div class="qty-box" style="margin-bottom: 16px;">
            <button type="button" id="decrease-qty">-</button>
            <span id="qty-value">1</span>
            <button type="button" id="increase-qty">+</button>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" id="add-to-cart">Add to Cart</button>
            <button class="btn btn-secondary" id="buy-now">Buy Now</button>
          </div>
        </div>
      </div>

      <div class="panel" style="margin-top: 30px;">
        <h2>About the Product</h2>
        <p>${product.description}</p>
      </div>

      <div class="panel" style="margin-top: 30px;">
        <h2>Customer Reviews</h2>
        ${reviews.length ? reviews.map((review) => `
          <div class="card feature-card" style="margin-bottom: 10px;">
            <strong>${review.customerName}</strong>
            <div>Rating: ${review.rating}/5</div>
            <p>${review.comment}</p>
          </div>
        `).join('') : '<p>No reviews yet.</p>'}
      </div>
    `;

    let quantity = 1;
    const qtyValue = document.getElementById('qty-value');
    document.getElementById('increase-qty').addEventListener('click', () => {
      quantity = Math.min(quantity + 1, product.quantity || 1);
      qtyValue.textContent = quantity;
    });
    document.getElementById('decrease-qty').addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      qtyValue.textContent = quantity;
    });

    document.getElementById('add-to-cart').addEventListener('click', async () => {
      if (!isLoggedIn()) return window.location.href = '/login.html';
      try {
        const resp = await apiRequest('/cart', { method: 'POST', body: JSON.stringify({ productId: product._id, quantity }) });
        showToast(resp.message, 'success');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });

    document.getElementById('buy-now').addEventListener('click', async () => {
      if (!isLoggedIn()) return window.location.href = '/login.html';
      try {
        const resp = await apiRequest('/cart', { method: 'POST', body: JSON.stringify({ productId: product._id, quantity }) });
        window.location.href = '/cart.html';
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  } catch (error) {
    root.innerHTML = `<div class="panel"><p>${error.message}</p></div>`;
  }
});
