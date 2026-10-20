# Create Admin User Scripts

This directory contains scripts to create Admin/Super Admin users for the SaleBySale platform.

## Quick Start (Recommended)

### Option 1: Simple Script (Easiest)

1. **Edit the admin details** in `createAdminSimple.js`:
   ```javascript
   const adminConfig = {
     name: "Super Admin",
     email: "admin@salebysale.com",
     phone: "+919999999999",
     password: "Admin@123",
   };
   ```

2. **Run the script:**
   ```bash
   cd salebysale-backend
   node scripts/createAdminSimple.js
   ```

3. **Login to admin panel:**
   - URL: http://localhost:5174/login
   - Email: admin@salebysale.com
   - Password: Admin@123

---

### Option 2: Interactive Script

Run the script and it will prompt you for details:

```bash
cd salebysale-backend
node scripts/createAdmin.js
```

You'll be asked to enter:
- Admin Name
- Admin Email
- Admin Phone
- Admin Password

Press Enter to use default values.

---

### Option 3: Command Line Arguments

Create admin directly with command line:

```bash
cd salebysale-backend
node scripts/createAdmin.js admin@example.com "SecurePass123" "Admin Name"
```

---

## Admin Roles

### Admin Role
- Full access to admin panel (http://localhost:5174)
- Can view all orders, buyers, and suppliers
- Can approve/reject KYC
- Can arrange deliveries
- Can manage disputes
- Can view wholesaler identities (hidden from buyers)

### Permissions
- Role: `admin`
- KYC Status: `verified` (auto-approved)
- Account Status: `active`
- Verified: `true`

---

## Creating Multiple Admins

You can create multiple admin users with different emails:

**Admin 1 (Super Admin):**
```javascript
name: "Super Admin"
email: "superadmin@salebysale.com"
password: "SuperAdmin@123"
```

**Admin 2 (Operations Manager):**
```javascript
name: "Operations Manager"
email: "operations@salebysale.com"
password: "Operations@123"
```

**Admin 3 (Support Manager):**
```javascript
name: "Support Manager"
email: "support@salebysale.com"
password: "Support@123"
```

Just edit `createAdminSimple.js` with new details and run it again.

---

## Troubleshooting

### Error: "Admin already exists"
The email is already registered. Either:
1. Use a different email
2. Delete the existing admin from database
3. Use the existing admin credentials to login

### Error: "Cannot connect to database"
Make sure:
1. MongoDB is running
2. `.env` file has correct `MONGO_URI`
3. Backend dependencies are installed (`npm install`)

### Error: "bcryptjs not found"
Install dependencies:
```bash
cd salebysale-backend
npm install
```

---

## Default Admin Credentials

After running `createAdminSimple.js` without changes:

```
Email:    admin@salebysale.com
Password: Admin@123
URL:      http://localhost:5174/login
```

**⚠️ IMPORTANT:** Change these credentials in production!

---

## Security Best Practices

1. **Use strong passwords** (minimum 8 characters, mix of letters, numbers, symbols)
2. **Change default password** after first login
3. **Don't share admin credentials**
4. **Use different passwords** for each admin
5. **Keep admin emails private**

---

## What Happens After Creation?

1. ✅ Admin user created in database
2. ✅ Password automatically hashed (bcrypt)
3. ✅ Account auto-verified (KYC approved)
4. ✅ Active status enabled
5. ✅ Ready to login immediately

---

## Need Help?

Check if backend is running:
```bash
cd salebysale-backend
npm start
```

Check if admin exists:
```bash
# Using MongoDB shell
mongo
use salebysale
db.users.find({ role: "admin" })
```

Delete an admin (if needed):
```bash
# Using MongoDB shell
db.users.deleteOne({ email: "admin@salebysale.com" })
```
