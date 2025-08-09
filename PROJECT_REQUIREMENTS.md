# Conviction Markets - Project Requirements Document

## 🎯 Project Overview

**Conviction Markets** is a decentralized prediction market platform where users create and bet on Yes/No questions about various topics. Users can stake their conviction on outcomes they believe will happen, creating a gamified way to settle debates and predictions. The platform combines social betting with blockchain technology to create engaging prediction markets.

## 🏗️ Architecture Overview

### Core Components
- **Frontend**: React + TypeScript + Vite application
- **Smart Contracts**: Solidity contracts for market creation and betting
- **Database**: Firebase Firestore for off-chain data and social features
- **Wallet Integration**: RainbowKit + Wagmi for Web3 connectivity
- **Styling**: Tailwind CSS with custom design system

### Technology Stack
- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **TypeScript**: 5.8.3
- **Styling**: Tailwind CSS 4.1.8
- **Web3**: Ethers.js 5.8.0, Wagmi 2.15.6, RainbowKit 2.2.8
- **Database**: Firebase 11.9.1
- **Blockchain**: Ethereum-based (with TEN Protocol integration)
- **Development**: Hardhat 2.25.0

## 🎨 Design System & Branding

### Color Palette
- **Primary Mint**: `#2de3b6` (mint-500, mint-600, mint-700)
- **Primary Orange**: `#ff7a1a` (orange-500, orange-600)
- **Mint Variations**: mint-50, mint-100, mint-200, mint-300, mint-400, mint-500, mint-600, mint-700
- **Orange Variations**: orange-50, orange-100, orange-200, orange-300, orange-400, orange-500, orange-600
- **Background**: Gray gradients and white backgrounds
- **Text**: Gray-700 for body text, mint-700 for headings

### UI Components
- **Cards**: Rounded corners (rounded-2xl), shadow-xl, backdrop-blur effects with `border-mint-100`
- **Buttons**: Orange primary buttons (`bg-orange-500 hover:bg-orange-600`) with mint text accents
- **Modals**: Centered overlays with backdrop blur and `border-mint-200`
- **Icons**: React Icons with `text-mint-500` and `text-orange-500` styling
- **Input Fields**: `border-mint-300` with `focus:ring-mint-400` and `focus:ring-orange-400`
- **Status Badges**: `bg-mint-50`, `bg-orange-50`, `text-mint-700`, `text-orange-700`

## 🔐 Core Features

### 1. Prediction Market Creation

#### Market Creation Flow
- **Creator interface**: Simple form for market setup with title, description, and duration
- **Stake configuration**: Platform fee (0.02 ETH) + minimum bet amount (0.001 ETH minimum)
- **Duration settings**: 10 minutes to 30 days range with categorized options
- **Market metadata**: Title, description, Yes/No options, expiry time

#### Market States
- **Active**: Open for betting, within expiry time
- **Expired**: Betting closed, awaiting resolution by creator
- **Resolved**: Results revealed, winners can claim prizes

### 2. Betting System

#### Betting Mechanism
- **Fixed stake betting**: All users bet the same amount set by market creator
- **Yes/No options**: Simple binary prediction markets
- **Real-time updates**: Live bet count and market status
- **Confidential voting**: Encrypted vote submission using TEN Protocol

#### Prize Distribution
- **Winner determination**: Majority vote wins (Yes or No)
- **Proportional rewards**: Winners split prize pool based on stake
- **Tie handling**: Refund mechanism for tied votes
- **Claim system**: One-time prize claiming with verification

### 3. Social Features

#### Activity Feed
- **Real-time updates**: Market creation, betting, resolution events
- **User activity tracking**: Comprehensive activity history
- **Grouped activities**: Batched similar activities for better UX
- **Time-based display**: "X minutes/hours/days ago" timestamps

#### Comments System
- **Market discussions**: Comment threads for each market
- **User engagement**: Community discussion around predictions
- **Real-time updates**: Live comment updates

#### Leaderboard
- **User rankings**: Based on number of markets participated in
- **Performance metrics**: Most active users highlighted
- **Community recognition**: Top performers with medals and badges

### 4. User Interface Components

#### Landing Page
- **Hero section**: Compelling introduction with action buttons
- **Feature highlights**: Social betting, community aspects
- **Example conversations**: Chat bubbles showing market scenarios
- **How it works**: 4-step process explanation

#### Market Display
- **Market cards**: Comprehensive market information display
- **Progress bars**: Visual representation of Yes/No distribution
- **Status badges**: Active, Expired, Resolved states
- **Action buttons**: Bet, claim, share, comment

#### Navigation
- **Tab-based navigation**: Markets, Activities, Leaderboard
- **Responsive design**: Mobile-friendly interface
- **Wallet integration**: Connect button in header

## 📱 User Experience Features

### 1. Wallet Integration
- **Multi-wallet support**: MetaMask, Rainbow, and other wallets
- **Connection status**: Real-time wallet state management
- **Transaction handling**: Gas estimation and confirmation flows
- **Error handling**: User-friendly error messages

### 2. Real-time Updates
- **Live market data**: Real-time bet counts and status
- **Activity notifications**: New markets, bets, resolutions
- **Auto-refresh**: Automatic data updates
- **Firebase integration**: Real-time database updates

### 3. Mobile Responsiveness
- **Responsive design**: Works on all screen sizes
- **Touch-friendly**: Optimized for mobile interaction
- **Progressive Web App**: PWA capabilities
- **Offline support**: Basic offline functionality

## 🔧 Technical Requirements

### 1. Smart Contract Requirements

#### BeliefMarket Contract
```solidity
// Core functionality
- createBet(string betId, uint256 voteStake, uint256 duration)
- vote(string betId, encryptedWeight, voteType, proof)
- requestTallyReveal(string betId)
- claimPrize(string betId)
- claimRefund(string betId)

// View functions
- getBet(string betId)
- getDecryptionRequestId(string betId)
- getRevealStatus(string betId)
- hasUserClaimed(string betId, address user)
```

#### TEN Protocol Integration
- **Encrypted betting**: Vote data encrypted before blockchain submission
- **Zero-knowledge proofs**: Vote validation without revealing choices
- **Oracle integration**: Decryption service for result revelation
- **Signature verification**: Cryptographic proof validation

### 2. Frontend Requirements

#### State Management
- **React hooks**: Custom hooks for contract interaction
- **Context providers**: Global state management
- **Local storage**: User preferences and session data
- **Real-time sync**: Firebase integration for live updates

#### Performance Requirements
- **Fast loading**: < 3 seconds initial load time
- **Smooth interactions**: 60fps animations and transitions
- **Efficient updates**: Optimized re-rendering
- **Bundle optimization**: Code splitting and lazy loading

### 3. Database Schema

#### Markets Collection
```typescript
interface ConvictionMarket {
  id: string;
  betId: string;
  title: string;
  description: string;
  creator: string;
  minBet: number;
  expiresAt: number;
  status: MarketStatus;
  options: [string, string];
  createdAt: number;
}
```

#### Votes Collection
```typescript
interface ConvictionVote {
  id: string;
  marketId: string;
  user: string;
  option: 'yes' | 'no';
  amount: number;
  createdAt: number;
}
```

#### Comments Collection
- **Thread-based comments**: Hierarchical comment structure
- **User attribution**: Comment author tracking
- **Moderation flags**: Content moderation system

### 4. Security Requirements

#### Privacy Protection
- **Client-side encryption**: All sensitive data encrypted before submission
- **No data leakage**: Zero information about individual votes until resolution
- **Audit trail**: Cryptographic proofs for verification
- **Access controls**: Proper permission management

#### Smart Contract Security
- **Reentrancy protection**: Secure state management
- **Input validation**: Comprehensive parameter checking
- **Access controls**: Owner-only functions properly protected
- **Emergency stops**: Circuit breaker functionality

## 🚀 Deployment Requirements

### 1. Environment Configuration
- **Environment variables**: API keys, contract addresses, network configs
- **Network support**: Multiple blockchain network support
- **Configuration management**: Environment-specific settings

### 2. Build & Deployment
- **Build optimization**: Minified and optimized production builds
- **CDN integration**: Static asset delivery optimization
- **SSL/TLS**: Secure HTTPS connections
- **Error monitoring**: Production error tracking

### 3. Monitoring & Analytics
- **Performance monitoring**: Real-time application performance
- **Error tracking**: Comprehensive error reporting
- **User analytics**: Privacy-preserving usage metrics
- **Contract monitoring**: Blockchain event tracking

## 📊 Success Metrics

### 1. User Engagement
- **Daily active users**: Target user engagement metrics
- **Market creation rate**: New markets per day
- **Betting participation**: Percentage of users who bet
- **Retention rate**: User return frequency

### 2. Technical Performance
- **Transaction success rate**: > 95% successful transactions
- **Load times**: < 3 seconds for all pages
- **Uptime**: > 99.9% availability
- **Error rate**: < 1% error rate

### 3. Social Features
- **Comment engagement**: Average comments per market
- **Activity feed usage**: Daily active users viewing feed
- **Leaderboard participation**: Users checking rankings
- **Community growth**: New users joining platform

## 🔄 Future Enhancements

### 1. Advanced Features
- **Multi-option markets**: Beyond Yes/No to multiple choices
- **Time-series predictions**: Markets with continuous outcomes
- **DAO integration**: Community-governed market creation
- **Cross-chain support**: Multi-blockchain compatibility

### 2. Social Features
- **User profiles**: Detailed user statistics and history
- **Market categories**: Organized market browsing
- **Advanced analytics**: Market performance insights
- **Community features**: Groups and private markets

### 3. Technical Improvements
- **Layer 2 scaling**: Optimistic rollups for cost reduction
- **Advanced privacy**: TEN Protocol privacy improvements
- **Mobile app**: Native mobile application
- **API access**: Public API for third-party integrations

## 📋 Development Guidelines

### 1. Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Comprehensive code linting
- **Testing**: Unit and integration test coverage
- **Documentation**: Inline code documentation

### 2. Git Workflow
- **Feature branches**: Branch-based development
- **Code reviews**: Mandatory peer review process
- **CI/CD**: Automated testing and deployment
- **Version control**: Semantic versioning

### 3. Security Practices
- **Regular audits**: Third-party security audits
- **Dependency updates**: Automated vulnerability scanning
- **Access controls**: Principle of least privilege
- **Incident response**: Security incident procedures

---

*This document serves as the comprehensive requirements specification for the Conviction Markets platform, ensuring all stakeholders have a clear understanding of the project scope, features, and technical requirements.*
