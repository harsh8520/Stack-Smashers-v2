# Fix MongoDB URI - URGENT

## Problem Found

Your MongoDB URI has errors:

**Current (WRONG):**
```
mongodb+srv://contentapp:KwxdJau32UAWeSZb MONGOBD@content-quality-cluster.sgzocmz.mongodb.net/?appName=content-quality-cluster
```

**Issues:**
1. ❌ Space and extra text in password: `KwxdJau32UAWeSZb MONGOBD`
2. ❌ Missing database name
3. ❌ Missing required parameters

**Correct Format:**
```
mongodb+srv://contentapp:KwxdJau32UAWeSZb@content-quality-cluster.sgzocmz.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority&appName=content-quality-cluster
```

---

## Quick Fix (Choose One Method)

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project: `content-lens-ai`

2. **Update Environment Variable**
   - Go to: Settings → Environment Variables
   - Find `MONGODB_URI`
   - Click the **⋯** (three dots) → Edit
   - Replace with:
   ```
   mongodb+srv://contentapp:KwxdJau32UAWeSZb@content-quality-cluster.sgzocmz.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority&appName=content-quality-cluster
   ```
   - Make sure it's selected for: Production, Preview, Development
   - Click Save

3. **Redeploy**
   - Go to Deployments tab
   - Click on latest deployment
   - Click **⋯** → Redeploy
   - Or run in terminal:
   ```bash
   vercel --prod
   ```

### Method 2: Via Vercel CLI

```bash
# Remove old variable
vercel env rm MONGODB_URI

# When prompted, select all environments (Production, Preview, Development)

# Add new variable
vercel env add MONGODB_URI

# When prompted:
# - Value: mongodb+srv://contentapp:KwxdJau32UAWeSZb@content-quality-cluster.sgzocmz.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority&appName=content-quality-cluster
# - Environments: Select all (Production, Preview, Development)

# Redeploy
vercel --prod
```

---

## Verify the Fix

### Step 1: Check Environment Variable

```bash
vercel env pull .env.check
```

Then check `.env.check` file - the MONGODB_URI should look correct (no spaces in password).

### Step 2: Test Signup in Postman

**Request:**
- Method: `POST`
- URL: `https://content-lens-ai.vercel.app/api/auth/signup`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Expected Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  }
}
```

### Step 3: Check Logs

```bash
vercel logs
```

Should NOT see MongoDB connection errors anymore.

---

## Why This Happened

The MongoDB URI likely got corrupted when:
1. Copy-pasting from MongoDB Atlas
2. Adding extra text accidentally
3. Not including the database name

---

## Correct MongoDB URI Format

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

**Parts:**
- `USERNAME`: Your MongoDB database username (contentapp)
- `PASSWORD`: Your database password (NO SPACES!)
- `CLUSTER`: Your cluster address (content-quality-cluster.sgzocmz)
- `DATABASE`: Database name (content_quality_reviewer)
- `retryWrites=true&w=majority`: Required parameters

---

## If Password Has Special Characters

If your password contains special characters like `@`, `#`, `$`, etc., you need to URL encode them:

| Character | Encoded |
|-----------|---------|
| @         | %40     |
| #         | %23     |
| $         | %24     |
| %         | %25     |
| ^         | %5E     |
| &         | %26     |
| +         | %2B     |
| =         | %3D     |

**Example:**
- Password: `MyP@ss#123`
- Encoded: `MyP%40ss%23123`
- URI: `mongodb+srv://user:MyP%40ss%23123@cluster.mongodb.net/db`

Your current password `KwxdJau32UAWeSZb` has no special characters, so no encoding needed.

---

## After Fixing

Once you've updated the MONGODB_URI and redeployed:

1. ✅ Signup should work
2. ✅ Login should work
3. ✅ Content analysis should work
4. ✅ History should work

Test all endpoints in Postman using the guide: [POSTMAN_API_GUIDE.md](./POSTMAN_API_GUIDE.md)

---

## Still Having Issues?

### Check MongoDB Atlas

1. **Go to MongoDB Atlas Dashboard**
   - [https://cloud.mongodb.com/](https://cloud.mongodb.com/)

2. **Verify Cluster is Running**
   - Should see green "Active" status

3. **Check Network Access**
   - Left sidebar → Network Access
   - Should have entry: `0.0.0.0/0` (Allow access from anywhere)

4. **Check Database User**
   - Left sidebar → Database Access
   - User `contentapp` should exist
   - Should have "Read and write to any database" privilege

5. **Get Fresh Connection String**
   - Go to Database → Click "Connect"
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with actual password
   - Add `/content_quality_reviewer` after `.net/`
   - Add `?retryWrites=true&w=majority` at the end

---

## Need Help?

If you're still getting errors after fixing:

1. Check Vercel logs: `vercel logs`
2. Verify MongoDB Atlas cluster is active
3. Test connection string with MongoDB Compass
4. Check [TROUBLESHOOTING_LOGIN.md](./TROUBLESHOOTING_LOGIN.md)

---

**IMPORTANT:** After updating MONGODB_URI, you MUST redeploy for changes to take effect!

```bash
vercel --prod
```

---

**Last Updated:** March 2026
