import os

files = [
    r'C:\Open Code Project\app.js',
    r'C:\Open Code Project\deploy\app.js',
    r'C:\Open Code Project\menu.json',
    r'C:\Open Code Project\deploy\menu.json'
]

for filepath in files:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Hide price for dropdowns
    old_price = '<div class="menu-item-price">$${item.price}</div>'
    new_price = "${item.type !== 'dropdown' ? `<div class=\"menu-item-price\">$${item.price}</div>` : ''}"
    content = content.replace(old_price, new_price)

    # 2. Update wording
    content = content.replace('Select your drink from the list below', 'Select your drink')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
