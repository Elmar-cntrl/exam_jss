// src/components/productCard.js
export function renderProductCard(product, onAdd){
  const el = document.createElement('article');
  el.className = 'pm-card';
  el.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <div class="pm-meta">
      <div class="price">${product.price.toFixed(2)} AZN</div>
      <div class="pm-actions">
        <button class="pm-btn addBtn">Add</button>
      </div>
    </div>
    <p class="pm-desc">${product.desc}</p>
  `;
  el.querySelector('.addBtn').addEventListener('click', ()=> onAdd(product.id));
  return el;
}
