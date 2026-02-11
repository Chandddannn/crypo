# Deployment Guide: Running CoinSwitch on Other Devices

This guide provides instructions on how to set up and run the **CoinSwitch Virtual Trader** on different machines or access it from other devices in your network.

## 1. Prerequisites
Before you begin, ensure you have the following installed on the target device:
- **Node.js** (v18.0.0 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Git** (to clone the repository)

## 2. Local Setup
If you are moving the project to a new computer:

1. **Clone/Copy the Project**:
   ```bash
   git clone <your-repo-url>
   # OR copy the project folder manually
   cd crypo
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Ensure any required `.env.local` files are copied over. Currently, the app uses public Binance WebSockets, so no specific API keys are strictly required for the demo.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

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

## 4. Production Deployment
To run the app in a production-ready state (faster and more stable):

1. **Build the Project**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm run start
   ```

## 5. Hosting on the Cloud (Recommended)
For permanent access from anywhere in the world, consider these free/low-cost options:
- **Vercel** (Best for Next.js): Simply connect your GitHub repo to [Vercel](https://vercel.com).
- **Netlify**: Similar to Vercel, supports Next.js builds.
- **Railway/Render**: Good for full-stack deployments.

---
*Note: Ensure your firewall allows incoming connections on port 3000 if accessing via local network.*
