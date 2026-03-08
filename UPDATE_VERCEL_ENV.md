# Update Vercel Production Environment Variables

## ✅ MongoDB Connection Works Locally!

I tested the MongoDB connection and it works perfectly. The issue is that your **Production** environment variables in Vercel might not be updated yet.

---

## Fix: Update Production Environment Variables

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - [https://vercel.com/harshs-projects-4fa333de/content-lens-ai/settings/environment-variables](https://vercel.com/harshs-projects-4fa333de/content-lens-ai/settings/environment-variables)

2. **Check MONGODB_URI**
   - Find `MONGODB_URI` in the list
   - Click the **⋯** (three dots) next to it
   - Click **Edit**

3. **Verify it's set for Production**
   - Make sure **Production** checkbox is checked
   - Value should be:
   ```
   mongodb+srv://contentapp:KwxdJau32UAWeSZb@content-quality-cluster.sgzocmz.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority&appName=content-quality-cluster
   ```
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **⋯** → **Redeploy**
   - **IMPORTANT:** Make sure "Use existing Build Cache" is **UNCHECKED**

### Method 2: Via CLI

```bash
# Remove old MONGODB_URI from production
vercel env rm MONGODB_URI production

# Add new MONGODB_URI to production
vercel env add MONGODB_URI production

# When prompted, paste:
mongodb+srv://contentapp:KwxdJau32UAWeSZb@content-quality-cluster.sgzocmz.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority&appName=content-quality-cluster

# Redeploy to production
vercel --prod --force
```

---

## Test After Update

### In Postman:

**Signup Request:**
```
POST https://content-lens-ai.vercel.app/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  }
}
```

---

## Verify Environment Variables

Run this command to check all environments:

```bash
vercel env ls
```

You should see `MONGODB_URI` listed for:
- ✅ Development
- ✅ Preview  
- ✅ Production

---

## Check Deployment Logs

After redeploying, check logs:

```bash
vercel logs
```

Or in Vercel Dashboard:
1. Go to **Deployments**
2. Click on latest deployment
3. Click **Functions** tab
4. Click on `/api/auth/signup`
5. View logs

Should NOT see MongoDB connection errors.

---

## Why This Happens

When you update environment variables in Vercel:
1. Changes apply to NEW deployments only
2. Existing deployments use OLD environment variables
3. You MUST redeploy for changes to take effect

---

## Force Redeploy

If normal redeploy doesn't work, force a fresh build:

```bash
vercel --prod --force
```

This will:
- Clear build cache
- Rebuild everything
- Use latest environment variables

---

## Still Not Working?

### Check These:

1. **MongoDB Atlas Network Access**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Network Access → Should have `0.0.0.0/0`

2. **MongoDB Atlas Cluster Status**
   - Database → Should show "Active" (green)

3. **Database User**
   - Database Access → User `contentapp` should exist
   - Should have "Read and write to any database"

4. **Connection String**
   - Get fresh connection string from MongoDB Atlas
   - Database → Connect → Connect your application
   - Copy and update in Vercel

---

## Test Locally First

Before testing on Vercel, test locally:

```bash
# Update .env.development.local with correct MONGODB_URI
# Then run:
vercel dev

# In another terminal, test with curl:
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"local@test.com","password":"testpass123"}'
```

Should work locally (we already tested this and it works!).

---

## Summary

1. ✅ MongoDB connection works (tested locally)
2. ✅ MongoDB URI is correct
3. ❌ Production environment variables need update
4. ❌ Need to redeploy after updating

**Action Required:**
1. Update MONGODB_URI in Vercel Production environment
2. Redeploy with `vercel --prod --force`
3. Test signup in Postman

---

**Last Updated:** March 2026
