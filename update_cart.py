import os

def update_app_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update renderMenuItems HTML to include quantity selector
    old_button_html = '<button class="add-to-cart-btn" onclick="addToCart(\'${itemId}\', \'${item.name}\', ${item.price})">Add to Order</button>'
    new_button_html = '''<div class="quantity-control">
            <button type="button" class="qty-btn" onclick="changeQty('${itemId}', -1, ${item.price})">-</button>
            <span class="qty-display" id="qty-${itemId}">1</span>
            <button type="button" class="qty-btn" onclick="changeQty('${itemId}', 1, ${item.price})">+</button>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart('${itemId}', '${item.name}', ${item.price})">Add to Order</button>'''
    content = content.replace(old_button_html, new_button_html)

    # 2. Add changeQty function before addToCart
    change_qty_func = '''
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

'''
    content = content.replace('function addToCart(', change_qty_func + 'function addToCart(')

    # 3. Update addToCart to handle quantity
    old_add = '  cart.push({ name: itemName, options: selectedOptions, total: itemTotal });'
    new_add = '''  const qty = parseInt(document.getElementById(`qty-${itemId}`).innerText) || 1;
  cart.push({ name: itemName, options: selectedOptions, unitTotal: itemTotal, quantity: qty });
  document.getElementById(`qty-${itemId}`).innerText = 1; // reset'''
    content = content.replace(old_add, new_add)

    # 4. Update showCart to display quantity
    old_show = '''      <div class="cart-item">
        <div class="cart-item-name">${item.name}</div>
        ${item.options.length > 0 ? `<div class="cart-item-options">${item.options.join(', ')}</div>` : ''}
        <div class="cart-item-total">$${item.total}</div>
        <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
      </div>'''
    new_show = '''      <div class="cart-item">
        <div class="cart-item-header">
            <div class="cart-item-name">${item.name} <span class="cart-qty-badge">x${item.quantity}</span></div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
        ${item.options.length > 0 ? `<div class="cart-item-options">${item.options.join(', ')}</div>` : ''}
        <div class="cart-item-total">$${(item.unitTotal * item.quantity).toFixed(2)}</div>
      </div>'''
    content = content.replace(old_show, new_show)

    # 5. Update placeOrder total calculation
    old_total_calc = 'const total = cart.reduce((sum, item) => sum + item.total, 0);'
    new_total_calc = 'const total = cart.reduce((sum, item) => sum + (item.unitTotal * item.quantity), 0);'
    content = content.replace(old_total_calc, new_total_calc)

    # 6. Update placeOrder items mapping for kitchen
    old_items = '    items: cart,'
    new_items = '''    items: cart.map(item => ({
        name: item.name,
        options: item.options,
        quantity: item.quantity,
        total: item.unitTotal * item.quantity
    })),'''
    content = content.replace(old_items, new_items)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_app_js(r'C:\Open Code Project\app.js')
update_app_js(r'C:\Open Code Project\deploy\app.js')
print("JS updated")
