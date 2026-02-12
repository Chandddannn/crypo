# Quick Setup Guide

## 1. MongoDB Setup (5 minutes)
1. Go to https://mongodb.com/cloud/atlas/register
2. Create FREE cluster (M0)
3. Get connection string

## 2. Configure
Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://RINKU:RINKULOVESCHANDAN@cyprocat.mwb1ye9.mongodb.net/coinswitch?retryWrites=true&w=majority&appName=CYPROCAT
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## 3. Run
```bash
npm run dev
```

## Admin Dashboard
- URL: http://localhost:3000/admin
- Password: admin123 (change in production!)

## Deploy
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

Done! ✅
