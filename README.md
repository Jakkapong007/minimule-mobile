# miniMule Mobile

A React Native / Expo mobile app for **miniMule** — a sticker store combined with a social feed where users can discover, share, and order custom stickers.

## Features

- **Shop** — Browse products, view product details, manage cart, apply promo codes, track orders
- **Social Feed** — For You and Showcase tabs, image posts, voting, post detail view
- **Search** — Full-text product search with recent search history
- **Create Post** — Upload designs, pick categories, toggle visibility, flag as sticker design
- **Profile** — Avatar, post grid, order history, account settings
- **Notifications** — Order updates, promotions, vote alerts, system messages
- **Address Management** — Add, remove, and set default shipping addresses
- **Payment Methods** — Add, remove, and set default payment methods (credit card, PromptPay, bank transfer)
- **Auth** — Login and registration with JWT session persistence

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Language | TypeScript |
| Navigation | React Navigation v7 (bottom tabs + nested stacks) |
| GraphQL client | Apollo Client v4 |
| Auth storage | AsyncStorage |
| Styling | StyleSheet (custom red/black theme — primary `#E31837`) |

## Backend

The mobile app connects to the **minimule-backend** Go GraphQL API.  
Source: [minimule-backend](https://github.com/jakka/minimule-backend)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (iOS or Android)

### Install

```bash
npm install
```

### Configure API URL

Copy `.env` and set your backend URL:

```bash
# .env (local dev)
EXPO_PUBLIC_API_URL=http://localhost:8080/graphql

# .env.production (deployed backend)
EXPO_PUBLIC_API_URL=https://your-app.up.railway.app/graphql
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go. For a deployed backend (e.g. Railway.io), update `EXPO_PUBLIC_API_URL` — the phone only needs internet access, not LAN access to your dev machine.

## Project Structure

```
src/
├── components/       # Shared UI components (Button, Input, etc.)
├── context/          # AuthContext — user session, token management
├── graphql/          # Apollo client, queries, mutations, hooks wrapper
├── navigation/       # Root navigator, tab navigator, stack navigators
└── screens/
    ├── auth/         # Login, Register
    ├── feed/         # FeedScreen, PostDetailScreen
    ├── shop/         # Shop, ProductDetail, Cart, Orders, OrderDetail
    ├── search/       # SearchScreen
    ├── create/       # CreatePostScreen
    ├── notifications/# NotificationsScreen
    └── profile/      # Profile, AddressManagement, PaymentMethods
```
