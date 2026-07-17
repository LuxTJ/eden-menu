function renderMenuItems(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = items.map((item, index) => {
    const itemId = `${containerId}-${index}`;

    if (item.type === 'multiselect') {
      return `
        <div class="menu-item" data-id="${itemId}">
          <div class="menu-item-info">
            <div class="menu-item-name">${item.name}</div>
            ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
          </div>
          <div class="drinks-plain-list">
            ${item.variations.map(v => `
              <div class="drink-row">
                <span class="drink-name">${v.name}</span>
                <span class="drink-price">$${v.price}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (item.optionGroups) {
      const hasGroups = item.optionGroups.length > 0;
      return `
        <div class="menu-item" data-id="${itemId}">
          <div class="menu-item-header" onclick="toggleOptions('${itemId}')">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="menu-item-image">` : ''}
            <div class="menu-item-info">
              <div class="menu-item-name">${item.name}</div>
              ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
            </div>
            <div class="menu-item-price">$${item.price}</div>
          </div>
          ${hasGroups ? `
            <div class="menu-item-options" id="options-${itemId}">
              ${item.optionGroups.map((group, gi) => `
                <div class="option-group">
                  <div class="option-label">${group.label}${group.maxSelect ? ` (up to ${group.maxSelect})` : ''}</div>
                  ${group.options.map((opt, oi) => {
                    const isObj = typeof opt === 'object';
                    const name = isObj ? opt.name : opt;
                    const price = isObj ? opt.price : 0;
                    const inputType = group.type === 'radio' ? 'radio' : 'checkbox';
                    const inputName = inputType === 'radio' ? `${itemId}-g${gi}` : `${itemId}-g${gi}-${oi}`;
                    const limitCall = group.maxSelect ? `enforceGroupLimit('${itemId}', ${gi}, ${group.maxSelect}); ` : '';
                    return `
                      <label class="option-checkbox">
                        <input type="${inputType}" name="${inputName}" value="${name}" ${price ? `data-price="${price}"` : ''} ${inputType === 'radio' && oi === 0 ? 'checked' : ''} onchange="${limitCall}updateTotal('${itemId}', ${item.price})">
                        <span>${name}${price > 0 ? ` (+$${price})` : ''}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              `).join('')}
              <div class="item-total" id="total-${itemId}">Total: $${item.price}</div>
              <div class="quantity-control">
                  <button type="button" class="qty-btn" onclick="changeQty('${itemId}', -1, ${item.price})">-</button>
                  <span class="qty-display" id="qty-${itemId}">1</span>
                  <button type="button" class="qty-btn" onclick="changeQty('${itemId}', 1, ${item.price})">+</button>
              </div>
              <button class="add-to-cart-btn" onclick="addToCart('${itemId}', '${item.name}', ${item.price})">Add to Order</button>
            </div>
          ` : `
            <div class="menu-item-options" id="options-${itemId}">
              <div class="quantity-control">
                  <button type="button" class="qty-btn" onclick="changeQty('${itemId}', -1, ${item.price})">-</button>
                  <span class="qty-display" id="qty-${itemId}">1</span>
                  <button type="button" class="qty-btn" onclick="changeQty('${itemId}', 1, ${item.price})">+</button>
              </div>
              <button class="add-to-cart-btn" onclick="addToCart('${itemId}', '${item.name}', ${item.price})">Add to Order</button>
            </div>
          `}
        </div>
      `;
    }

    const hasOptions = (item.meats && item.meats.length > 0) || (item.variations && item.variations.length > 0) || (item.sauces && item.sauces.length > 0) || (item.addons && item.addons.length > 0);

    return `
      <div class="menu-item" data-id="${itemId}">
        <div class="menu-item-header" onclick="toggleOptions('${itemId}')">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" class="menu-item-image">` : ''}
          <div class="menu-item-info">
            <div class="menu-item-name">${item.name}</div>
            ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
          </div>
          <div class="menu-item-price">$${item.price}</div>
        </div>
        ${hasOptions ? `
          <div class="menu-item-options" id="options-${itemId}">
            ${item.meats && item.meats.length > 0 ? `
              <div class="option-group">
                <div class="option-label">Choose your meat</div>
                ${item.meats.map((m, i) => `
                  <label class="option-checkbox">
                    <input type="radio" name="${itemId}-meat" value="${m}" ${i === 0 ? 'checked' : ''}>
                    <span>${m}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}
            ${item.variations && item.variations.length > 0 ? `
              <div class="option-group">
                <div class="option-label">${item.sauces ? 'Choose Your Veggies' : 'Need extras?'}</div>
                ${item.variations.map((v, i) => `
                  <label class="option-checkbox">
                    <input type="checkbox" name="${itemId}-var-${i}" value="${v}" onchange="updateTotal('${itemId}', ${item.price})">
                    <span>${v}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}
            ${item.sauces && item.sauces.length > 0 ? `
              <div class="option-group">
                <div class="option-label">Choose your Sauce (up to 2)</div>
                ${item.sauces.map((s, i) => `
                  <label class="option-checkbox">
                    <input type="checkbox" name="${itemId}-sauce-${i}" value="${s}" onchange="updateSauceLimit('${itemId}', 2); updateTotal('${itemId}', ${item.price})">
                    <span>${s}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}
            ${item.addons && item.addons.length > 0 ? `
              <div class="option-group">
                <div class="option-label">Extra Add-Ons</div>
                ${item.addons.map((a, i) => `
                  <label class="option-checkbox">
                    <input type="checkbox" name="${itemId}-addon-${i}" value="${a.name}" data-price="${a.price}" onchange="updateTotal('${itemId}', ${item.price})">
                    <span>${a.name}${a.price > 0 ? ` (+$${a.price})` : ''}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}
            <div class="item-total" id="total-${itemId}">Total: $${item.price}</div>
            <div class="quantity-control">
                <button type="button" class="qty-btn" onclick="changeQty('${itemId}', -1, ${item.price})">-</button>
                <span class="qty-display" id="qty-${itemId}">1</span>
                <button type="button" class="qty-btn" onclick="changeQty('${itemId}', 1, ${item.price})">+</button>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${itemId}', '${item.name}', ${item.price})">Add to Order</button>
          </div>
        ` : `
          <div class="menu-item-options" id="options-${itemId}">
            <div class="quantity-control">
                <button type="button" class="qty-btn" onclick="changeQty('${itemId}', -1, ${item.price})">-</button>
                <span class="qty-display" id="qty-${itemId}">1</span>
                <button type="button" class="qty-btn" onclick="changeQty('${itemId}', 1, ${item.price})">+</button>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${itemId}', '${item.name}', ${item.price})">Add to Order</button>
          </div>
        `}
      </div>
    `;
  }).join('');
}

function toggleOptions(itemId) {
  const options = document.getElementById(`options-${itemId}`);
  const item = document.querySelector(`[data-id="${itemId}"]`);
  const expandIcon = item.querySelector('.expand-icon');
  
  if (options) {
    if (options.style.display === 'none' || !options.style.display) {
      options.style.display = 'block';
      if (expandIcon) expandIcon.textContent = '−';
      item.classList.add('expanded');
    } else {
      options.style.display = 'none';
      if (expandIcon) expandIcon.textContent = '+';
      item.classList.remove('expanded');
    }
  }
}

function updateSauceLimit(itemId, max) {
  const item = document.querySelector(`[data-id="${itemId}"]`);
  const sauceInputs = item.querySelectorAll(`input[name^="${itemId}-sauce-"]`);
  const checkedCount = Array.from(sauceInputs).filter(cb => cb.checked).length;

  sauceInputs.forEach(cb => {
    const disable = !cb.checked && checkedCount >= max;
    cb.disabled = disable;
    cb.closest('label').classList.toggle('option-checkbox-disabled', disable);
  });
}

function enforceGroupLimit(itemId, groupIndex, max) {
  const item = document.querySelector(`[data-id="${itemId}"]`);
  const inputs = item.querySelectorAll(`input[name^="${itemId}-g${groupIndex}-"]`);
  const checkedCount = Array.from(inputs).filter(cb => cb.checked).length;

  inputs.forEach(cb => {
    const disable = !cb.checked && checkedCount >= max;
    cb.disabled = disable;
    cb.closest('label').classList.toggle('option-checkbox-disabled', disable);
  });
}

function updateTotal(itemId, basePrice) {
  const item = document.querySelector(`[data-id="${itemId}"]`);
  const checkboxes = item.querySelectorAll('input[type="checkbox"]:checked');
  let total = basePrice;
  
  checkboxes.forEach(cb => {
    const price = parseFloat(cb.dataset.price || 0);
    total += price;
  });
  
  const totalEl = document.getElementById(`total-${itemId}`);
  if (totalEl) {
    totalEl.textContent = `Total: $${total}`;
  }
}

// Cart storage
let cart = [];


function changeQty(itemId, delta, basePrice) {
    const qtyEl = document.getElementById(`qty-${itemId}`);
    let qty = parseInt(qtyEl.innerText) + delta;
    if (qty < 1) qty = 1;
    qtyEl.innerText = qty;

    const item = document.querySelector(`[data-id="${itemId}"]`);
    const checkboxes = item.querySelectorAll('input[type="checkbox"]:checked');
    let unitTotal = basePrice;
    checkboxes.forEach(cb => unitTotal += parseFloat(cb.dataset.price || 0));

    const totalEl = document.getElementById(`total-${itemId}`);
    if (totalEl) totalEl.textContent = `Total: $${(unitTotal * qty).toFixed(2)}`;
}

function addToCart(itemId, itemName, basePrice) {
  const item = document.querySelector(`[data-id="${itemId}"]`);
  const qty = parseInt(document.getElementById(`qty-${itemId}`).innerText) || 1;
  const checkboxes = item.querySelectorAll('input[type="checkbox"]:checked');
  const selectedMeat = item.querySelector('input[type="radio"]:checked');
  const selectedOptions = (selectedMeat ? [selectedMeat.value] : []).concat(Array.from(checkboxes).map(cb => cb.value));
  let itemTotal = basePrice;

  checkboxes.forEach(cb => {
    itemTotal += parseFloat(cb.dataset.price || 0);
  });

  cart.push({ name: itemName, options: selectedOptions, unitTotal: itemTotal, quantity: qty });

  document.getElementById(`qty-${itemId}`).innerText = 1; // reset
  updateCartCount();
  
  // Visual feedback
  const btn = item.querySelector('.add-to-cart-btn');
  const originalText = btn.textContent;
  btn.textContent = 'Added!';
  btn.style.background = '#28a745';
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 1000);
}


async function loadMenuData() {
  // no-store: menu edits must reach customers immediately, not after a cache expiry
  const res = await fetch('menu.json', { cache: 'no-store' });
  return await res.json();
}

const LOCATION_LABELS = { dfw: 'DFW', satx: 'San Antonio' };

let CURRENT_LOCATION = 'dfw';
let CURRENT_SIDE = 'eden';

function setPreviewLocation(loc) {
  CURRENT_LOCATION = loc;
  document.querySelectorAll('.location-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.loc === loc);
  });
  const sideWrapper = document.getElementById('side-selector-wrapper');
  if (sideWrapper) {
    sideWrapper.style.display = loc === 'dfw' ? 'block' : 'none';
  }
}

function setSide(side) {
  CURRENT_SIDE = side;
  document.querySelectorAll('.side-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.side === side);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  setPreviewLocation(CURRENT_LOCATION);
  setSide(CURRENT_SIDE);

  const data = await loadMenuData();
  renderMenuItems(data.starters, 'starters-list');
  renderMenuItems(data.mains, 'mains-list');
  renderMenuItems(data.sweets, 'sweets-list');
  renderMenuItems(data.drinks, 'drinks-list');
});

function showCart() {
  const modal = document.getElementById('cart-modal');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem 0;">No items added yet</p>';
  } else {
    cartItems.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-header">
            <div class="cart-item-name">${item.name} <span class="cart-qty-badge">x${item.quantity}</span></div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
        ${item.options.length > 0 ? `<div class="cart-item-options">${item.options.join(', ')}</div>` : ''}
        <div class="cart-item-total">$${(item.unitTotal * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');
  }
  
  const total = cart.reduce((sum, item) => sum + (item.unitTotal * item.quantity), 0);
  cartTotal.textContent = `Total: $${total}`;
  modal.classList.add('active');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  showCart();
}

function closeCart() {
  document.getElementById('cart-modal').classList.remove('active');
}

function checkout() {
  showCart();
}

function setSide(side) {
  CURRENT_SIDE = side;
  const sideButtons = document.querySelectorAll('.side-toggle-btn');
  sideButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.side === side);
  });
}

function placeOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();

  if (!name || !email) {
    alert('Please fill in all fields (Name, Email)');
    return;
  }

  if (cart.length === 0) {
    alert('Please add at least one item to your order');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.unitTotal * item.quantity), 0);

  const order = {
    id: 'ORD-' + Date.now().toString().slice(-6),
    location: CURRENT_LOCATION,
    ...(CURRENT_LOCATION === 'dfw' && { side: CURRENT_SIDE || 'eden' }),
    customer: { name, email },
    items: cart.map(item => ({
        name: item.name,
        options: item.options,
        quantity: item.quantity,
        total: item.unitTotal * item.quantity
    })),
    total,
    status: 'pending',
    timestamp: new Date().toISOString(),
    notified: false
  };

  const orders = JSON.parse(localStorage.getItem('clubEdenOrders') || '[]');
  orders.push(order);
  localStorage.setItem('clubEdenOrders', JSON.stringify(orders));
  console.log('📦 Order placed:', order);
  console.log('💾 All orders:', orders);

  closeCart();

  document.getElementById('confirmation-text').textContent =
    `Order #${order.id} has been sent to the kitchen. We'll email you at ${email} when it's ready for pickup at the bar!`;
  document.getElementById('order-confirmation').classList.add('active');

  // Clear cart and form
  cart = [];
  updateCartCount();
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-email').value = '';

  // Clear all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('.item-total').forEach(el => {
    const itemId = el.id.replace('total-', '');
    const priceEl = document.querySelector(`[data-id="${itemId}"] .menu-item-price`);
    if (priceEl) {
      el.textContent = `Total: ${priceEl.textContent}`;
    }
  });
}

function closeConfirmation() {
  document.getElementById('order-confirmation').classList.remove('active');
}

function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.length;
}
