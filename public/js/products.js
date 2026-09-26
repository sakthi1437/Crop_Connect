document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('product-list');
  const searchInput = document.getElementById('product-search');
  const categoryInput = document.getElementById('filter-category');
  const organicInput = document.getElementById('filter-organic');
  const locationInput = document.getElementById('filter-location');
  const minPriceInput = document.getElementById('filter-min-price');
  const maxPriceInput = document.getElementById('filter-max-price');
  const applyButton = document.getElementById('apply-filters');

  const loadProducts = async () => {
    const params = new URLSearchParams();
    const search = searchInput?.value?.trim();
    const category = categoryInput?.value || '';
    const organic = organicInput?.value || '';
    const location = locationInput?.value?.trim() || '';
    const minPrice = minPriceInput?.value || '';
    const maxPrice = maxPriceInput?.value || '';

    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (organic) params.set('organic', organic);
    if (location) params.set('location', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    try {
      const response = await apiRequest(`/products?${params.toString()}`);
      renderProductList(response.data, 'product-list');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  searchInput?.addEventListener('input', loadProducts);
  applyButton?.addEventListener('click', loadProducts);
  [categoryInput, organicInput, locationInput, minPriceInput, maxPriceInput].forEach((input) => {
    input?.addEventListener('change', loadProducts);
  });

  loadProducts();
});
