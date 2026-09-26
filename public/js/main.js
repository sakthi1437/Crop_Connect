const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('cropConnectToken');
}

function setToken(token) {
  localStorage.setItem('cropConnectToken', token);
}

function clearAuth() {
  localStorage.removeItem('cropConnectToken');
  localStorage.removeItem('cropConnectUser');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('cropConnectUser') || 'null');
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('cropConnectUser', JSON.stringify(user));
}

function apiRequest(url, options = {}) {
  const token = getToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  return fetch(`${API_BASE}${url}`, requestOptions).then(async (res) => {
    const result = await res.json().catch(() => ({ success: false, message: 'Request failed' }));
    if (!res.ok) {
      throw new Error(result.message || 'Request failed');
    }
    return result;
  });
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'notification';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `notification show toast-${type}`;
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.className = 'notification';
  }, 2600);
}

function isLoggedIn() {
  return Boolean(getToken());
}

function redirectToRoleHome() {
  const user = getUser();
  if (!user) return;
  if (user.role === 'farmer') {
    window.location.href = '/farmer/dashboard.html';
  } else {
    window.location.href = '/products.html';
  }
}

function updateNav() {
  const user = getUser();
  const navLinks = document.querySelectorAll('[data-nav]');
  navLinks.forEach((link) => {
    const target = link.dataset.nav;
    if (target === 'login' && isLoggedIn()) link.classList.add('hidden');
    if (target === 'register' && isLoggedIn()) link.classList.add('hidden');
    if (target === 'profile' && !isLoggedIn()) link.classList.add('hidden');
    if (target === 'logout' && !isLoggedIn()) link.classList.add('hidden');
  });

  const userBadge = document.getElementById('user-badge');
  if (userBadge && user) {
    userBadge.textContent = `${user.name} (${user.role})`;
  }

  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      clearAuth();
      window.location.href = '/';
    });
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function renderProductList(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!products || products.length === 0) {
    container.innerHTML = '<div class="panel"><p>No crops found matching your search.</p></div>';
    return;
  }

  container.innerHTML = products.map((product) => `
    <article class="product-card card">
      <div class="image-wrap">
        <img src="${product.image || 'https://images.unsplash.com/photo-1464226184884-fa52add7c5b2?auto=format&fit=crop&w=800&q=80'}" alt="${product.name}">
      </div>
      <div class="product-body">
        <div class="meta-line">
          <span>${product.category}</span>
          <span>${product.organic ? 'Organic' : 'Standard'}</span>
        </div>
        <h3 class="product-name">${product.name}</h3>
        <div class="price-row">${formatCurrency(product.price)} / ${product.unit}</div>
        <div class="small-muted">Available: ${product.quantity} ${product.unit}</div>
        <div class="small-muted">Farmer: ${product.farmerName || 'Farmer'}</div>
        <div class="small-muted">Location: ${product.location}</div>
        <div class="product-actions">
          <a href="/product-details.html?id=${product._id}" class="btn btn-outline">View Details</a>
          <button class="btn btn-primary add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.add-to-cart-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.dataset.productId;
      if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
      }
      try {
        const response = await apiRequest('/cart', {
          method: 'POST',
          body: JSON.stringify({ productId, quantity: 1 }),
        });
        showToast(response.message || 'Added to cart', 'success');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function initHomePage() {
  const featuredContainer = document.getElementById('featured-products');
  if (!featuredContainer) return;

  apiRequest('/products').then((response) => {
    renderProductList(response.data.slice(0, 8), 'featured-products');
  }).catch((error) => {
    showToast(error.message, 'error');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  initHomePage();
});
