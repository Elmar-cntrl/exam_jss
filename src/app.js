import { MarketAPI } from './api/marketAPI.js';
import { renderProductCard } from './components/productCard.js';
import { OrderForm } from './components/createOrderForm.js';
import { Helpers } from './utils/helpers.js';
import { Auth } from './auth.js';

const productListEl = document.getElementById('productList');
const categoryFilter = document.getElementById('categoryFilter');
const cartListEl = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const viewOrdersBtn = document.getElementById('viewOrdersBtn');

const authModal = document.getElementById('authModal');
const authBody = document.getElementById('authBody');
const authClose = document.getElementById('authClose');

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');

const orderModal = document.getElementById('orderModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

let products = [];
let cart = Helpers.loadFromStorage('pm_cart') || [];
let orders = Helpers.loadFromStorage('pm_orders') || [];

async function init(){
    products = await MarketAPI.fetchCatalog();
    populateCategories();
    renderProducts(products);
    renderCart();
    updateUserUI();
}

function populateCategories(){
    const cats = ['all', ...new Set(products.map(p => p.category))];
    categoryFilter.innerHTML = cats.map(c => `<option value="${c}">${Helpers.capitalize(c)}</option>`).join('');
    categoryFilter.addEventListener('change', ()=> {
        const v = categoryFilter.value;
        renderProducts(v === 'all' ? products : products.filter(p => p.category === v));
    });
}

function renderProducts(list){
    productListEl.innerHTML = '';
    for(const p of list){
        const card = renderProductCard(p, onAddToCart);
        productListEl.appendChild(card);
    }
}

function onAddToCart(productId){
    const p = products.find(x=>x.id===productId);
    if(!p) return;
    const existing = cart.find(it=>it.id===p.id);
    if(existing) existing.qty++;
    else cart.push({id:p.id,name:p.name,price:p.price,qty:1});
    Helpers.saveToStorage('pm_cart', cart);
    renderCart();
}

function renderCart(){
    cartListEl.innerHTML = '';
    for(const item of cart){
        const li = document.createElement('li');
        li.className = 'pm-cart-item';
        li.innerHTML = `<span>${item.name} x ${item.qty}</span><strong>${(item.price*item.qty).toFixed(2)} AZN</strong>`;
        cartListEl.appendChild(li);
    }
    cartTotalEl.textContent = cart.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2);
}

// рег и лог

function updateUserUI(){
    const user = Auth.getCurrentUser();

    if(user){
        userDisplay.textContent = user.username;
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        userDisplay.textContent = "";
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

loginBtn.addEventListener('click', ()=> showAuthForm('login'));
registerBtn.addEventListener('click', ()=> showAuthForm('register'));
logoutBtn.addEventListener('click', ()=> {
    Auth.logout();
    updateUserUI();
});

function showAuthForm(type){
    authBody.innerHTML = `
    <h2>${type === 'login' ? 'Login' : 'Register'}</h2>
    <form id="authForm">
      <label>Username<input name="username" required /></label>
      <label>Password<input type="password" name="password" required /></label>
      <button class="pm-btn" type="submit">${type}</button>
    </form>
  `;

    document.getElementById('authForm').addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const username = fd.get('username');
        const password = fd.get('password');

        const result = type === 'login'
            ? Auth.login(username, password)
            : Auth.register(username, password);

        if(!result.ok){
            alert(result.message);
            return;
        }

        updateUserUI();
        authModal.classList.add('hidden');
    });

    authModal.classList.remove('hidden');
}

authClose.addEventListener('click', ()=> {
    authModal.classList.add('hidden');
});

// ордера

checkoutBtn.addEventListener('click', ()=> {
    if(cart.length===0){ alert('Cart is empty'); return; }

    const user = Auth.getCurrentUser();
    if(!user){
        alert("You must be logged in to place an order.");
        return;
    }

    const form = new OrderForm(cart, onPlaceOrder);
    modalBody.innerHTML = '';
    modalBody.appendChild(form.render());
    orderModal.classList.remove('hidden');
});

viewOrdersBtn.addEventListener('click', ()=> {
    showOrders();
});

closeModal.addEventListener('click', ()=> {
    orderModal.classList.add('hidden');
});

function onPlaceOrder(orderData){
    const user = Auth.getCurrentUser();
    if(!user){
        alert("Login first.");
        return;
    }

    orderData.userId = user.id;

    const order = MarketAPI.createOrder(orderData);
    orders.push(order);
    Helpers.saveToStorage('pm_orders', orders);
    cart = [];
    Helpers.saveToStorage('pm_cart', cart);
    renderCart();
    orderModal.classList.add('hidden');
    alert('Order placed — ID: ' + order.id);
}

function showOrders(){
    const user = Auth.getCurrentUser();
    if(!user){
        alert("Login first.");
        return;
    }

    const userOrders = orders.filter(o => o.customer.name === user.username || o.userId === user.id);

    const container = document.createElement('div');
    container.innerHTML = `<h2>Your orders</h2>`;

    if(userOrders.length===0) container.innerHTML += '<p>No orders yet.</p>';
    else{
        const ul = document.createElement('ul');
        for(const o of userOrders){
            const li = document.createElement('li');
            li.innerHTML = `<strong>Order ${o.id}</strong> — ${o.items.length} items — ${o.total.toFixed(2)} AZN<br/><small>${o.customer.name} • ${o.createdAt}</small>`;
            ul.appendChild(li);
        }
        container.appendChild(ul);
    }

    modalBody.innerHTML = '';
    modalBody.appendChild(container);
    orderModal.classList.remove('hidden');
}

init();
