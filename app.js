function renderMenuItems(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = items.map((item, index) => {
    const hasOptions = (item.variations && item.variations.length > 0) || (item.addons && item.addons.length > 0);
    const itemId = `${containerId}-${index}`;
    
    return `
      <div class="menu-item" data-id="${itemId}">
        <div class="menu-item-header" onclick="toggleOptions('${itemId}')">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" class="menu-item-image">` : ''}
          <div class="menu-item-info">
            <div class="menu-item-name">${item.name}</div>
            ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
          </div>
          ${item.type !== 'dropdown' ? `<div class="menu-item-price">$${item.price}</div>` : ''}
        </div>
        ${hasOptions ? `
          <div class="menu-item-options" id="options-${itemId}">
            ${item.variations && item.variations.length > 0 ? `
              <div class="option-group">
                ${item.type === 'dropdown' ? `
                  <div class="option-label">Select your drink</div>
                  <select class="drink-select" id="select-${itemId}" onchange="updateTotal('${itemId}', 0)">
                    ${item.variations.map(v => `<option value="${v.name}|${v.price}">${v.name} - $${v.price}</option>`).join('')}
                  </select>
                ` : `
                  <div class="option-label">Need extras?</div>
                  ${item.variations.map((v, i) => `
                    <label class="option-checkbox">
                      <input type="checkbox" name="${itemId}-var-${i}" value="${v}" onchange="updateTotal('${itemId}', ${item.price})">
                      <span>${v}</span>
                    </label>
                  `).join('')}
                `}
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
          </div>
        ` : `
          <div class="quantity-control-small">
              <button type="button" class="qty-btn-small" onclick="changeQty('${itemId}', -1, ${item.price})">-</button>
              <span class="qty-display-small" id="qty-${itemId}">1</span>
              <button type="button" class="qty-btn-small" onclick="changeQty('${itemId}', 1, ${item.price})">+</button>
          </div>
          <button class="add-to-cart-btn" onclick="addToCart('${itemId}', '${item.name}', ${item.price})">Add to Order</button>
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
      expandIcon.textContent = '−';
      item.classList.add('expanded');
    } else {
      options.style.display = 'none';
      expandIcon.textContent = '+';
      item.classList.remove('expanded');
    }
  }
}

function updateTotal(itemId, basePrice) {
  const item = document.querySelector(`[data-id="${itemId}"]`);
  const select = item.querySelector('select.drink-select');
  
  if (select) {
    const [, price] = select.value.split('|');
    const qty = parseInt(document.getElementById(`qty-${itemId}`).innerText) || 1;
    const totalEl = document.getElementById(`total-${itemId}`);
    if (totalEl) totalEl.textContent = `Total: $${(parseFloat(price) * qty).toFixed(2)}`;
    return;
  }

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
  const checkboxes = item.querySelectorAll('input[type="checkbox"]:checked');
  const selectedOptions = Array.from(checkboxes).map(cb => cb.value);
  let itemTotal = basePrice;
  
  checkboxes.forEach(cb => {
    itemTotal += parseFloat(cb.dataset.price || 0);
  });
  
  const qty = parseInt(document.getElementById(`qty-${itemId}`).innerText) || 1;
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

const defaultMenuData = {
  starters: [
    { name: "4 Loaded Potato Skins", price: 10, image: "images/loaded-potato-skins.webp", variations: ["Cheese", "Bacon", "Sour Cream"], addons: [] },
    { name: "5 Cheese Sticks", price: 6, image: "images/cheese-sticks.webp", variations: ["Ranch", "Marinara"], addons: [] },
    { name: "Zucchini Fries", price: 6, image: "images/zucchini-fries.jpg", variations: ["Ranch"], addons: [] },
    { name: "Large Onion Rings", price: 6, image: "images/onion-rings.jpg", variations: ["Ketchup"], addons: [] },
    { name: "Ballpark Nachos", price: 6, image: "images/nachos.jpg", variations: ["Jalapeno"], addons: [] },
    { name: "Hand Cut Fries", price: 6, image: "images/fries.jpg", variations: ["Ketchup"], addons: [{ name: "Add Cheese", price: 2 }] },
    { name: "State Fair Corn Dog", price: 4, image: "images/corn-dog.jpg", variations: ["Mustard"], addons: [] },
    { name: "Bag of Chips", price: 3, image: "images/chips.webp", variations: ["Lays", "Doritos", "BBQ"], addons: [] }
  ],
  mains: [
    { name: "Margherita Pizza", price: 14, variations: ["Basil", "Mozzarella"], addons: [] },
    { name: "12 Inch Brick Oven Cheese Pizza", price: 12, variations: ["Red Sauce", "White Sauce", "Ranch", "Garlic Butter"], addons: [{ name: "Pepperoni", price: 1 }, { name: "Canadian Bacon", price: 1 }, { name: "American Bacon", price: 1 }, { name: "Sausage", price: 1 }, { name: "Chicken", price: 1 }, { name: "Hamburger", price: 1 }, { name: "Steak", price: 1 }, { name: "Extra Cheese", price: 1 }, { name: "Pineapple", price: 1 }, { name: "Bell Pepper", price: 1 }, { name: "Onion", price: 1 }, { name: "Mushroom", price: 1 }, { name: "Black Olives", price: 1 }, { name: "Jalapeno", price: 1 }, { name: "Tomato", price: 1 }, { name: "Spinach", price: 1 }] },
    { name: "12 Inch Brick Oven Cheese Pizza (Unlimited Toppings)", price: 16, variations: ["Red Sauce", "White Sauce", "Pepperoni", "Canadian Bacon", "American Bacon", "Sausage", "Chicken", "Hamburger", "Steak", "Extra Cheese", "Pineapple", "Bell Pepper", "Onion", "Mushroom", "Black Olives", "Jalapeno", "Tomato", "Spinach", "Ranch", "Garlic Butter"], addons: [] },
    { name: "Stromboli with Unlimited Toppings", price: 16, variations: ["Red Sauce", "White Sauce", "Pepperoni", "Canadian Bacon", "American Bacon", "Sausage", "Chicken", "Hamburger", "Steak", "Extra Cheese", "Pineapple", "Bell Pepper", "Onion", "Mushroom", "Black Olives", "Jalapeno", "Tomato", "Spinach", "Ranch", "Garlic Butter"], addons: [] },
    { name: "Specialty Pizzas", price: 13, variations: ["BBQ Chicken", "Buffalo Chicken Ranch", "Chicken Alfredo", "Chicken Bacon Ranch", "Hawaiian", "Three Meat", "Supreme"], addons: [] },
    { name: "Smash Burger", price: 12, description: "1/2 Pound of Fresh Angus Beef on a Sesame Seed Bun", variations: ["American", "Provolone", "Mozzarella", "Cheese Sauce", "Swiss", "Shredded Cheddar", "Lettuce", "Tomato", "Pickle", "Sautéed Onions", "Raw Onions", "Mushrooms", "Jalapenos", "Sweet Relish", "Mustard", "Ketchup", "Mayo", "BBQ", "A1 Sauce", "Ranch"], addons: [{ name: "Extra Cheese", price: 1 }, { name: "Add Bacon", price: 2 }] },
    { name: "3 Smash Burger Sliders", price: 12, description: "1/2 Pound of Fresh Angus Beef on a Sesame Seed Bun", variations: ["American", "Provolone", "Mozzarella", "Cheese Sauce", "Swiss", "Shredded Cheddar", "Lettuce", "Tomato", "Pickle", "Sautéed Onions", "Raw Onions", "Mushrooms", "Jalapenos", "Sweet Relish", "Mustard", "Ketchup", "Mayo", "BBQ", "A1 Sauce", "Ranch"], addons: [{ name: "Extra Cheese", price: 1 }, { name: "Add Bacon", price: 2 }] },
    { name: "Street Taco", price: 6, variations: ["Soft Corn Tortilla", "Toasted Corn Tortilla", "Crispy Corn", "Flour", "Steak", "Ground Beef", "Chicken", "Shrimp", "Cilantro", "Onions", "Cabbage", "Lettuce", "Tomato", "Fresh Jalapeno", "Cheese", "Lime", "Mild Red Sauce", "Salsa Verde Hot (green)", "Sour Cream", "Creamy Garlic Cilantro Sauce"], addons: [] },
    { name: "Chicken Bacon Ranch Taco", price: 8, variations: ["Grilled Chicken", "Bacon", "Cheese", "Pico de Gallo", "Ranch"], addons: [] },
    { name: "Cheese Quesadilla", price: 6, variations: ["Steak", "Chicken", "Shrimp", "Chorizo", "Ground Beef", "Bacon", "Canadian Bacon", "Cilantro", "Onions", "Bell Pepper", "Mushrooms", "Tomato", "Fresh Jalapeno", "Mild Red Sauce", "Hot Red Sauce", "Salsa Verde Hot (green)", "Sour Cream", "Ranch", "Creamy Garlic Cilantro Sauce"], addons: [{ name: "Extra Meat", price: 1 }] },
    { name: "Loaded Quesadilla", price: 12, variations: ["Steak", "Chicken", "Shrimp", "Chorizo", "Ground Beef", "Bacon", "Canadian Bacon", "Cilantro", "Onions", "Bell Pepper", "Mushrooms", "Tomato", "Fresh Jalapeno", "Mild Red Sauce", "Hot Red Sauce", "Salsa Verde Hot (green)", "Sour Cream", "Ranch", "Creamy Garlic Cilantro Sauce"], addons: [{ name: "Extra Meat", price: 1 }] },
    { name: "6 Naked Chicken Wings", price: 12, description: "One Flavor with Celery, Carrots & Ranch", variations: ["Frank's Hot Buffalo", "Sweet Baby Ray's Honey BBQ", "Caribbean Jerk", "Asian Zing", "Hidden Valley Ranch Dry Rub", "Lemon Pepper Dry Rub", "Garlic Parmesan Dry Rub", "Plain"], addons: [] },
    { name: "Philly Cheese Sandwich", price: 12, variations: ["Steak", "Chicken", "Provolone", "Mozzarella", "Cheese Sauce", "Swiss", "Bell Pepper", "Onion", "Mushroom", "Fresh Jalapeno", "Jalapenos", "Ranch"], addons: [{ name: "Extra Cheese", price: 1 }, { name: "Add Bacon", price: 2 }] },
    { name: "Breakfast Burger", price: 12, description: "1/4 Pound of Fresh Angus Beef on a Sesame Seed Bun", variations: ["Fried Egg", "Bacon", "Potato", "Choice of Cheese", "Garlic Aioli"], addons: [] },
    { name: "Breakfast Taco", price: 6, variations: ["Sausage", "Steak", "Bacon", "Chorizo", "Chicken", "Potato", "Cheese", "Onion", "Bell Pepper", "Tomato", "Mushrooms", "Hot Sauce (red)", "Salsa Verde (green)", "Fresh Jalapeno", "Ketchup"], addons: [{ name: "Extra Meat", price: 2 }] },
    { name: "Loaded Omelet", price: 12, variations: ["Sausage", "Steak", "Bacon", "Ham", "Chorizo", "Chicken", "Onions", "Bell Pepper", "Tomato", "Mushrooms", "Potato", "Black Olives", "Fresh Jalapeno", "Cabbage", "Spinach", "Provolone", "Mozzarella", "Cheese Sauce", "Swiss", "Hot Sauce (red)", "Salsa Verde (green)", "Ketchup", "Ranch"], addons: [{ name: "Extras", price: 1 }] },
    { name: "Club Sandwich", price: 10, variations: ["Mayo", "Mustard", "Ranch"], addons: [] },
    { name: "Sub Club Sandwich", price: 12, variations: ["Mayo", "Mustard", "Ranch"], addons: [] },
    { name: "Crispy Chicken Sandwich", price: 12, variations: ["Lettuce", "Tomato", "Pickle", "Mustard", "Ketchup", "Mayo", "BBQ", "Ranch"], addons: [] },
    { name: "Bacon Grilled Cheese", price: 8, variations: ["American Bacon", "Canadian Bacon"], addons: [{ name: "Extra Bacon", price: 2 }] },
    { name: "Patty Melt", price: 12, variations: ["American", "Provolone", "Swiss", "Shredded Cheddar", "Sauteed Onion", "Mushrooms", "Jalapeno", "Mustard", "Ketchup", "Mayo", "BBQ-Sauce", "A1 Sauce", "Ranch"], addons: [{ name: "Add Bacon", price: 2 }] },
    { name: "BLT Sandwich", price: 8, variations: ["Mayo", "Mustard", "Ranch"], addons: [{ name: "Extra Cheese", price: 1 }, { name: "Extra Bacon", price: 2 }, { name: "Add Fried Egg", price: 2 }] },
    { name: "Chef Chop Salad", price: 12, variations: ["Ranch", "Thousand Island", "Italian", "Bleu Cheese", "Vinaigrette"], addons: [] },
    { name: "Taco Salad", price: 12, variations: ["Lettuce", "Tomato", "Cheeses", "Black Olives", "Cilantro", "Sour Cream", "Red Salsa", "Tortilla Strips"], addons: [] },
    { name: "Loaded Nachos", price: 12, variations: ["Steak", "Chicken", "Shrimp", "Bacon", "Hamburger", "Chorizo", "Cilantro", "Onions", "Lettuce", "Tomato", "Fresh Jalapeno", "Jalapeno", "Lime", "Mild Red Sauce", "Salsa Verde Hot (green)", "Sour Cream"], addons: [{ name: "Extra Meat", price: 2 }] },
    { name: "Loaded Hand Cut Fries", price: 11, description: "Includes Cheese Sauce and 1 Meat Choice", variations: ["Steak", "Chicken", "Hamburger", "Bacon", "Cilantro", "Onions", "Lettuce", "Tomato", "Jalapeno", "Ketchup", "Sour Cream", "Ranch"], addons: [{ name: "Extra Meat", price: 2 }] }
  ],
  sweets: [
    { name: "Churro (1)", price: 5, description: "Caramel filling with Cinnamon Sugar", variations: ["Strawberry", "Bavarian Cream"], addons: [{ name: "Whipped cream", price: 0 }, { name: "Berry sauce", price: 0 }] }
  ],
  drinks: [
    { 
      name: "DRINKS", 
      type: "dropdown",
      price: 3, 
      description: "Select your drink",
      variations: [
        { name: "Sprite", price: 3 },
        { name: "Ginger Ale", price: 3 },
        { name: "Dr. Pepper", price: 3 },
        { name: "Diet Dr. Pepper", price: 3 },
        { name: "Tonic", price: 3 },
        { name: "Club Soda", price: 3 },
        { name: "Orange Juice", price: 3 },
        { name: "Cranberry-Pineapple Juice", price: 3 },
        { name: "Red Bull", price: 5 },
        { name: "Sugar Free Red Bull", price: 5 },
        { name: "Bottled Water", price: 2 }
      ], 
      addons: [] 
    }
  ]
};

async function loadMenuData() {
  const saved = localStorage.getItem('clubEdenMenu');
  if (saved) return JSON.parse(saved);
  try {
    const res = await fetch('menu.json');
    return await res.json();
  } catch (e) {
    return defaultMenuData;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
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

function placeOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const table = document.getElementById('customer-table').value.trim();
  
  if (!name || !email || !table) {
    alert('Please fill in all fields (Name, Email, Table Number)');
    return;
  }
  
  if (cart.length === 0) {
    alert('Please add at least one item to your order');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.unitTotal * item.quantity), 0);
  
  const order = {
    id: 'ORD-' + Date.now().toString().slice(-6),
    customer: { name, email, table },
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
  
  closeCart();
  
  document.getElementById('confirmation-text').textContent = 
    `Order #${order.id} has been sent to the kitchen. We'll email you at ${email} when it's ready!`;
  document.getElementById('order-confirmation').classList.add('active');
  
  // Clear cart and form
  cart = [];
  updateCartCount();
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-email').value = '';
  document.getElementById('customer-table').value = '';
  
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
