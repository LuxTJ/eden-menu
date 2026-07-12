import os

def patch_app_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the price rendering logic to hide it for dropdowns
    old_price_html = '<div class="menu-item-price">$${item.price}</div>'
    new_price_html = "${item.type !== 'dropdown' ? `<div class=\"menu-item-price\">$${item.price}</div>` : ''}"
    
    # We need to be careful to only replace the one inside renderMenuItems
    # The string is unique enough in the template literal context.
    content = content.replace(old_price_html, new_price_html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_app_js(r'C:\Open Code Project\app.js')
patch_app_js(r'C:\Open Code Project\deploy\app.js')
print("Patched app.js to hide price for dropdowns")
