export class OrderForm {
  constructor(cartItems, submitCallback){
    this.items = cartItems.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty}));
    this.submitCallback = submitCallback;
  }

  render(){
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <h2>Place Order</h2>
      <form id="pmOrderForm">
        <label>Name<input name="name" required /></label>
        <label>Phone<input name="phone" required /></label>
        <label>Address<textarea name="address" rows="2"></textarea></label>
        <div class="pm-order-summary">
          <h3>Items</h3>
          <ul>${this.items.map(it=>`<li>${it.name} x ${it.qty} — ${(it.price*it.qty).toFixed(2)} AZN</li>`).join('')}</ul>
          <p>Total: <strong>${this.items.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2)} AZN</strong></p>
        </div>
        <div style="margin-top:12px">
          <button class="pm-btn" type="submit">Confirm Order</button>
        </div>
      </form>
    `;
    wrapper.querySelector('#pmOrderForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const customer = { name: fd.get('name'), phone: fd.get('phone'), address: fd.get('address') };
      this.submitCallback({ items:this.items, customer });
    });
    return wrapper;
  }
}
