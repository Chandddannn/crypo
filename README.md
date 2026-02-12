# CoinSwitch Virtual Trader - Setup & Deployment Guide

**CoinSwitch** is a production-ready cryptocurrency trading platform with **MongoDB database integration** for persistent user data and transaction history.

---

## 🎉 What's New: MongoDB Integration

✅ **Persistent Database Storage** - User accounts and trades are saved to MongoDB  
✅ **Production Ready** - Deploy to Vercel/Netlify with MongoDB Atlas (FREE tier)  
✅ **Admin Dashboard** - Manage users at `/admin`  
✅ **Automatic Backups** - MongoDB Atlas handles everything  
✅ **Scalable** - Handles thousands of users effortlessly  

**Quick Start:** See `MONGODB_QUICKSTART.md` for 5-minute setup  
**Full Guide:** See `MONGODB_SETUP.md` for complete documentation

---

## 📋 Table of Contents

1. [Quick Setup with MongoDB](#1-quick-setup-with-mongodb)
2. [Local Development Setup](#2-local-development-setup)
3. [Accessing from Other Devices](#3-accessing-from-other-devices-mobiletablets)
4. [Production Deployment](#4-production-deployment)
5. [Admin Dashboard](#5-admin-dashboard)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Quick Setup with MongoDB

### Step 1: Create MongoDB Database (FREE - 5 mins)
1. Go to **[MongoDB Atlas](https://mongodb.com/cloud/atlas/register)**
2. Sign up (no credit card required)
3. Create a **FREE M0 cluster** (512MB)
4. Get your connection string

### Step 2: Configure Environment
Create `.env.local` in project root:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coinswitch?retryWrites=true&w=majority
```

### Step 3: Install & Run
```bash
npm install
npm run dev
```

**Done!** Open `http://localhost:3000` and your data will persist to MongoDB.

📚 **Need detailed instructions?** Check `MONGODB_SETUP.md`

---

## 2. Local Development Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Git** (to clone the repository)
- **MongoDB Atlas account** (free)

### Installation Steps
If you are moving the project to a new computer:

1. **Clone/Copy the Project**:
   ```bash
   git clone <your-repo-url>
   # OR copy the project folder manually
   cd crypo
   ```

2. **Create MongoDB Database**:
   - Follow Step 1 above to create MongoDB Atlas cluster
   - Copy your connection string

3. **Configure Environment Variables**:
   ```bash
   # Create .env.local file
   echo "MONGODB_URI=your_connection_string_here" > .env.local
   ```

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

6. **Verify MongoDB Connection**:
   - Create a new account
   - Make some trades
   - Check MongoDB Atlas → Browse Collections
   - You should see `users` and `wallets` collections

---

## 3. Accessing from Other Devices (Mobile/Tablets)
To view the app on a mobile phone or another device within the **same Wi-Fi network**:

1. **Find your Local IP Address**:
   - **Windows**: Open PowerShell and type `ipconfig`. Look for `IPv4 Address` (e.g., `192.168.1.15`).
   - **Mac/Linux**: Open terminal and type `ifconfig` or `hostname -I`.

2. **Start Next.js on All Interfaces**:
   Run the dev server with the `-H` flag:
   ```bash
   npx next dev -H 0.0.0.0
   ```

3. **Access on Other Device**:
   Open the browser on your phone/tablet and enter:
   `http://<YOUR_IP_ADDRESS>:3000`
   *(Example: http://192.168.1.15:3000)*

---

## 4. Production Deployment

### Option A: Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable:
     - **Key**: `MONGODB_URI`
     - **Value**: Your MongoDB connection string
   - Click "Deploy"

3. **Done!** Your app is live with persistent database.

### Option B: Manual Production Build

1. **Build the Project**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm run start
   ```

### Other Hosting Options
- **Netlify**: Supports Next.js with MongoDB
- **Railway/Render**: Good for full-stack deployments
- **AWS/Google Cloud**: For enterprise deployments

---

## 5. Admin Dashboard

Access the admin panel at: **`/admin`**

### Features:
- 👥 View all registered users
- 💰 Monitor total platform balance
- 📊 Track trading statistics
- 🔍 View detailed user data
- 🗑️ Delete users (with confirmation)

### 🔒 Security Warning:
The admin dashboard is currently **NOT password-protected**. 

**For production**, add authentication:
- Use environment variable for admin password
- Implement proper auth (NextAuth.js recommended)
- Or remove the admin route entirely

---

## 6. Troubleshooting

### "MONGODB_URI is not defined"
**Solution**: Create `.env.local` file with your MongoDB connection string

### "Connection refused" or MongoDB errors
**Solution**: 
1. Check MongoDB Atlas → Network Access → Add your IP (`0.0.0.0/0` for all)
2. Verify username/password in connection string
3. Ensure database name is included in URI

### Admin dashboard is empty
**Solution**: Register a new user first, then refresh admin page

### Data not persisting
**Solution**: Check browser console for API errors. Verify MongoDB URI is correct.

---

## 📁 Project Structure

```
crypo/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/
│   │   │   ├── auth/           # Login/Register (MongoDB)
│   │   │   ├── wallet/         # Wallet management (MongoDB)
│   │   │   └── admin/          # Admin API routes
│   │   ├── portfolio/          # User portfolio page
│   │   └── profile/            # User profile page
│   ├── components/             # React components
│   ├── context/                # React Context (WalletContext)
│   ├── lib/
│   │   └── mongodb.ts          # MongoDB connection
│   ├── models/
│   │   ├── User.ts             # User schema
│   │   └── Wallet.ts           # Wallet schema
│   └── utils/                  # Helper functions
├── .env.local                  # Environment variables (create this)
├── MONGODB_SETUP.md            # Detailed MongoDB guide
└── MONGODB_QUICKSTART.md       # Quick reference guide
```

---

## 🚀 Features

- **Real-time Market Data** - Live prices via Binance WebSocket
- **Virtual Trading** - Practice with $10,000 starting balance
- **Portfolio Management** - Track positions and P&L
- **Trade History** - Complete transaction log
- **User Accounts** - Persistent login with MongoDB
- **Admin Dashboard** - Manage users and monitor platform
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Production Ready** - Built with Next.js 16 and MongoDB

---

## 📚 Documentation

- **`MONGODB_SETUP.md`** - Complete MongoDB integration guide
- **`MONGODB_QUICKSTART.md`** - Quick reference for MongoDB features
- **`WORKING.md`** - Technical architecture documentation
- **`CONTEXT_API.md`** - Context API implementation details

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Database**: MongoDB Atlas (via Mongoose)
- **Real-time Data**: Binance WebSocket API
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)

---

## 📞 Support

**Issues?** Check the troubleshooting section above or review `MONGODB_SETUP.md`

**Everything working?** 🎉 You're ready to trade!

---

*Note: Ensure your firewall allows incoming connections on port 3000 if accessing via local network.*

**Last Updated**: February 2024 - MongoDB Integration v1.0
