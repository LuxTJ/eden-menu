import os

def update_app_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update renderMenuItems to handle dropdown
    old_variations_block = '''${item.variations && item.variations.length > 0 ? `
              <div class="option-group">
                <div class="option-label">Need extras?</div>
                ${item.variations.map((v, i) => `
                  <label class="option-checkbox">
                    <input type="checkbox" name="${itemId}-var-${i}" value="${v}" onchange="updateTotal('${itemId}', ${item.price})">
                    <span>${v}</span>
                  </label>
                `).join('')}
              </div>
            ` : ''}'''
    
    new_variations_block = '''${item.variations && item.variations.length > 0 ? `
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
            ` : ''}'''
    
    content = content.replace(old_variations_block, new_variations_block)

    # 2. Update updateTotal function
    old_update_total = '''function updateTotal(itemId, basePrice) {
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
}'''
    
    new_update_total = '''function updateTotal(itemId, basePrice) {
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
}'''
    content = content.replace(old_update_total, new_update_total)

    # 3. Update addToCart function
    old_add_to_cart = '''function addToCart(itemId, itemName, basePrice) {
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
  
  // Visual feedback
  const btn = item.querySelector('.add-to-cart-btn');
  const originalText = btn.textContent;
  btn.textContent = 'Added!';
  btn.style.background = '#28a745';
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 1000);
}'''
    
    new_add_to_cart = '''function addToCart(itemId, itemName, basePrice) {
  const item = document.querySelector(`[data-id="${itemId}"]`);
  const select = item.querySelector('select.drink-select');
  
  let finalName = itemName;
  let itemTotal = basePrice;
  let selectedOptions = [];

  if (select) {
    const [name, price] = select.value.split('|');
    finalName = name;
    itemTotal = parseFloat(price);
  } else {
    const checkboxes = item.querySelectorAll('input[type="checkbox"]:checked');
    selectedOptions = Array.from(checkboxes).map(cb => cb.value);
    let unitTotal = basePrice;
    checkboxes.forEach(cb => unitTotal += parseFloat(cb.dataset.price || 0));
    itemTotal = unitTotal;
  }

  const qty = parseInt(document.getElementById(`qty-${itemId}`).innerText) || 1;
  cart.push({ name: finalName, options: selectedOptions, unitTotal: itemTotal, quantity: qty });
  document.getElementById(`qty-${itemId}`).innerText = 1; // reset
  
  // Visual feedback
  const btn = item.querySelector('.add-to-cart-btn');
  const originalText = btn.textContent;
  btn.textContent = 'Added!';
  btn.style.background = '#28a745';
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 1000);
}'''
    content = content.replace(old_add_to_cart, new_add_to_cart)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_app_js(r'C:\Open Code Project\app.js')
update_app_js(r'C:\Open Code Project\deploy\app.js')
print("JS updated for dropdown drinks")
