# Club Eden - Email Notification Setup

## Quick Setup with EmailJS (Free)

EmailJS lets you send emails directly from the browser without a backend server.

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account (200 emails/month free)

### Step 2: Add Email Service
1. Click "Email Services" in the dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Connect your account
5. Note the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Click "Email Templates" in the dashboard
2. Click "Create New Template"
3. Use this template:

```
Subject: Your Club Eden Order #{{order_id}} is Ready!

Hi {{customer_name}},

Your order #{{order_id}} is ready for pickup at Table {{table}}.

Order Summary:
{{order_details}}

Total: ${{total}}

Thank you for choosing Club Eden!
```

4. Save and note the **Template ID** (e.g., `template_xyz789`)

### Step 4: Update kitchen.html

Add this script tag to the `<head>` section of `kitchen.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>
  emailjs.init("YOUR_PUBLIC_KEY"); // Get from Account > API Keys
</script>
```

Then update the `sendEmail` function:

```javascript
function sendEmail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.notified = true;
    saveOrders();
    loadOrders();
    
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      to_email: order.customer.email,
      customer_name: order.customer.name,
      order_id: order.id,
      table: order.customer.table,
      order_details: order.items.map(item => 
        `- ${item.name}${item.options.length > 0 ? ' (' + item.options.join(', ') + ')' : ''} - $${item.total}`
      ).join('\n'),
      total: order.total
    }).then(() => {
      alert('Email sent successfully!');
    }).catch((error) => {
      alert('Failed to send email: ' + error.text);
    });
  }
}
```

Replace:
- `YOUR_PUBLIC_KEY` - From EmailJS Account > API Keys
- `YOUR_SERVICE_ID` - From Step 2
- `YOUR_TEMPLATE_ID` - From Step 3

### Alternative: Use Your Own Email

If you prefer not to use EmailJS, you can:
1. Use a backend service (Node.js, Python, etc.)
2. Use services like SendGrid, Mailgun, or AWS SES
3. Use a simple mailto link (opens user's email client)

For mailto link, replace the sendEmail function with:

```javascript
function sendEmail(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.notified = true;
    saveOrders();
    loadOrders();
    
    const subject = encodeURIComponent(`Order #${order.id} Ready`);
    const body = encodeURIComponent(`Hi ${order.customer.name}!\n\nYour order is ready at Table ${order.customer.table}.\n\nTotal: $${order.total}`);
    
    window.open(`mailto:${order.customer.email}?subject=${subject}&body=${body}`);
  }
}
```
