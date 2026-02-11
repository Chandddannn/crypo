# Technical Documentation: CoinSwitch Virtual Trader

CoinSwitch is a high-fidelity virtual cryptocurrency trading platform built with **Next.js 16**, **React 19**, and **Tailwind CSS**. It provides users with real-time market data and a simulated trading environment.

## 1. Core Functionalities

### 📈 Market Watch (Dashboard)
- **Real-time Prices**: Live price updates via Binance WebSocket integration.
- **Price Animations**: Visual "flash" effects (green for up, red for down) using **Framer Motion** when prices change.
- **Dynamic Filtering**: Browse through popular cryptocurrencies with live performance metrics.

### 💼 Portfolio Management
- **Live Tracking**: Automatic calculation of Total Equity, Available Cash, and Unrealized P&L.
- **Position Overview**: Detailed list of held assets, including average buy price and current market value.
- **Trade History**: A comprehensive log of all past BUY and SELL orders.
- **Session Flashback**: A unique feature that shows a 1-second preview of the last logged-in session even after logout, before redirecting to login.

### 🔄 Trading Engine
- **Simulated Execution**: Buy and sell assets using virtual USD.
- **Trade Validation**: Prevents over-spending or selling more than what is held.
- **Realized P&L**: Automatically calculates profit/loss upon selling an asset.

### 👤 User Profile
- **Account Customization**: Users can update their display name and avatar URL.
- **Trading Performance**: Visual analytics of trading activity (Buy vs. Sell distribution).
- **Security Dashboard**: Placeholder interface for managing passwords and 2FA.

## 2. Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **State Management**: React Context API (`WalletContext`)
- **Styling**: Tailwind CSS with a "Glassmorphism" UI design.
- **Animations**: Framer Motion for price updates and UI transitions.
- **Charts**: Recharts 

### Data Flow & Persistence
1. **Market Data**: Fetched directly from Binance's WebSocket API (`wss://stream.binance.com/stream`).
2. **Local Storage (Client-Side Auth)**:
   - **Key**: `coinswitch_user`
   - **Format**: JSON object containing `UserProfile` (id, email, name, avatarUrl).
   - **Usage**: Used to identify the current active user and persist their login session across page refreshes.
3. **Server-Side JSON Storage (Wallet Data)**:
   - **File Path**: `data/wallets.json`
   - **Format**: A flat JSON object where keys are `userId` and values are wallet states.
   - **Structure**:
     ```json
     {
       "user-id-uuid": {
         "balanceUsd": 10000,
         "positions": {
           "bitcoin": { "assetId": "bitcoin", "quantity": 0.5, "avgBuyPriceUsd": 50000 }
         },
         "trades": [ ... ]
       }
     }
     ```
   - **Usage**: The [WalletContext.tsx](src/context/WalletContext.tsx) performs a `POST` request to `/api/wallet` whenever the wallet state changes (debounced by 1s), which then updates this JSON file on the server.

### Key Components
- **Header**: Main navigation and user profile access.
- **WalletProvider**: The "brain" of the app, managing all financial logic and data streams.
- **TradeHistory**: A reusable component for displaying transaction logs.

## 3. Design Philosophy
- **Light Theme Focus**: Optimized for a clean, modern light interface with high readability.
- **Glassmorphism**: Uses semi-transparent panels with backdrop-blur effects for a premium feel.
- **Autonomy**: Designed to work as a standalone "Virtual Terminal" with zero backend dependencies for the demo.

---
*Developed as a high-performance trading showcase.*
