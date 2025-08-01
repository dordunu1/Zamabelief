import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaBook, FaArrowLeft, FaSearch } from 'react-icons/fa';

// Documentation content - we'll import the markdown files
const docsContent = {
  welcome: {
    title: "Welcome to Conviction Markets",
    content: `
# Welcome to Conviction Markets

Welcome to the official documentation for **Conviction Markets**—a next-generation, privacy-aware platform for opinion markets, takes, and beliefs built on ZAMA FHEVM.

## What is Conviction Markets?
Conviction Markets is a decentralized application (DApp) that serves as a marketplace for opinions, takes, and beliefs. It's where communities can stake their conviction on real-world outcomes, debates, and predictions with complete privacy. By leveraging advanced cryptography and smart contract technology, Conviction Markets creates a fair, transparent, and scalable platform for settling disagreements and aggregating collective wisdom.

## Who is it for?
- Communities looking to settle debates and disagreements
- People who want to stake their beliefs on real-world outcomes
- Anyone with strong opinions and takes they want to back with conviction
- Crypto enthusiasts and traders seeking opinion-based markets
- Blockchain developers and privacy advocates
- Anyone interested in decentralized, privacy-preserving opinion markets

---

Ready to get started? Explore the docs or jump right into creating your first opinion market!
    `
  },
  overview: {
    title: "Overview",
    content: `
# Overview

## What are Opinion Markets?
Opinion markets are platforms where communities can stake their beliefs, takes, and convictions on real-world outcomes, debates, and predictions. They aggregate collective wisdom and individual conviction to settle disagreements and forecast outcomes.

## Why Conviction-Based Opinion Markets?
Traditional opinion platforms often suffer from manipulation, lack of privacy, and poor incentive alignment. Conviction Markets introduces a new paradigm where users stake their beliefs (conviction) and outcomes are determined by the weight of conviction, not just popularity or loud voices.

## Key Features
- **Privacy-aware opinion staking** (powered by ZAMA FHEVM)
- **On-chain resolution and payouts**
- **Claim-based rewards and refunds**
- **Proportional payout logic**
- **No mass distribution—scalable for any number of users**
- **Modern, user-friendly interface**

## Supported Networks
- Ethereum Sepolia Testnet (initial deployment)
- More EVM-compatible networks coming soon!

---

Learn more about the problems Conviction Markets solves in the next section.
    `
  },
  architecture: {
    title: "Architecture",
    content: `
# Architecture

## System Overview
Conviction Markets is built on a modern, privacy-first architecture that leverages ZAMA FHEVM for encrypted voting and Ethereum for decentralized execution.

## Core Components

### 1. Frontend (React + TypeScript)
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Wallet Integration**: Seamless connection with MetaMask and other Web3 wallets
- **Real-time Updates**: Live market data and activity feeds

### 2. Smart Contracts (Solidity)
- **BeliefMarket Contract**: Core prediction market logic
- **FHE Integration**: Encrypted bet processing
- **Reward Distribution**: Automated payout calculations

### 3. Backend Services
- **Firebase**: User authentication and data storage
- **Real-time Database**: Live market updates

## Privacy Architecture

### FHE Implementation
- **Client-side Encryption**: Bets encrypted in user's browser
- **On-chain Processing**: Encrypted bets processed on blockchain
- **Zero-knowledge Proofs**: Verifiable results without revealing individual bets

### Data Flow
1. User creates encrypted bet locally
2. Encrypted bet sent to smart contract
3. Contract processes encrypted data
4. Results revealed after market closes
5. Rewards distributed automatically

## Security Features
- **End-to-end Encryption**: All sensitive data encrypted
- **Smart Contract Audits**: Regular security reviews
- **Decentralized Storage**: No single point of failure
- **Immutable Records**: All transactions on blockchain

## Scalability Considerations
- **Layer 2 Integration**: Support for high-throughput networks
- **Batch Processing**: Efficient handling of large markets
- **Modular Design**: Easy to extend and upgrade
    `
  },
  "usage-guide": {
    title: "Usage Guide",
    content: `
# Usage Guide

## Getting Started

### 1. Connect Your Wallet
- Click "Connect Wallet" in the top right
- Choose your preferred wallet (MetaMask recommended)
- Ensure you're connected to Ethereum Sepolia testnet

### 2. Browse Markets
- Navigate to the Markets tab
- View active prediction markets
- See current betting amounts and participant counts

### 3. Place Your Bet
- Click "Place Bet" on any active market
- Choose "Yes" or "No" for your prediction
- Confirm your bet amount (set by market creator)
- Wait for transaction confirmation

### 4. Market Resolution
- Markets automatically resolve after expiration
- Market creator can trigger resolution manually
- Results are calculated on-chain
- Winners can claim their rewards

## Creating Markets

### Market Creation Process
1. Click "Create Market" from the home page
2. Fill in market details:
   - Title: Clear, specific question
   - Description: Detailed explanation
   - Expiration: When the market closes
   - Minimum Bet: Required stake amount
3. Confirm creation and pay gas fees
4. Market becomes active immediately

### Best Practices
- **Clear Questions**: Make outcomes unambiguous
- **Reasonable Timelines**: Allow enough time for resolution
- **Appropriate Stakes**: Set minimum bets that encourage participation
- **Detailed Descriptions**: Provide context and criteria

## Betting Strategies

### Understanding Conviction
- **Higher Stakes**: Indicate stronger conviction
- **Early Betting**: Can influence market direction
- **Diversification**: Spread bets across multiple markets

### Risk Management
- **Start Small**: Begin with smaller bets
- **Research Markets**: Understand the underlying question
- **Monitor Activity**: Watch for market developments

## Claiming Rewards

### When Markets Resolve
- **Winners**: Can claim proportional rewards
- **Losers**: Lose their stake
- **Ties**: Participants get refunds

### Claim Process
1. Navigate to resolved markets
2. Click "Claim" button
3. Confirm transaction
4. Rewards sent to your wallet

## Troubleshooting

### Common Issues
- **Transaction Failures**: Check gas fees and network
- **Wallet Connection**: Ensure wallet is connected and on correct network
- **Market Not Loading**: Refresh page or check network status

### Getting Help
- Check the FAQ section
- Review error messages carefully
- Ensure you're on the correct network (Sepolia testnet)
    `
  },
  faq: {
    title: "FAQ",
    content: `
# Frequently Asked Questions

## General Questions

### What is Conviction Markets?
Conviction Markets is a decentralized prediction market platform that uses encrypted betting to ensure privacy and fairness. Users can create and participate in markets about real-world events.

### How is it different from other prediction markets?
- **Privacy**: Your bets are encrypted and private
- **Conviction-based**: Rewards based on stake amount, not just vote count
- **On-chain**: All results and payouts are transparent and immutable
- **Scalable**: No limits on number of participants

### Is it safe to use?
Yes! All transactions are on the blockchain, making them transparent and immutable. Your betting choices are encrypted for privacy, and smart contracts handle all payouts automatically.

## Technical Questions

### Which networks are supported?
Currently, we support Ethereum Sepolia testnet. Mainnet and additional networks will be added soon.

### What wallets can I use?
Any Web3-compatible wallet works, including:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Trust Wallet

### How does the encryption work?
We use ZAMA FHEVM (Fully Homomorphic Encryption) to encrypt your bets locally in your browser. The encrypted data is sent to the blockchain, where it's processed without revealing individual choices.

## Betting Questions

### How much should I bet?
Start with smaller amounts to learn the platform. Bet amounts are set by market creators and represent your conviction level.

### Can I change my bet?
No, once placed, bets cannot be changed or withdrawn. This ensures market integrity.

### What happens if a market doesn't resolve?
If a market creator doesn't resolve within a reasonable time, the market will be automatically resolved by a backend oracle system. This ensures all markets are settled fairly and participants receive their rewards.

## Rewards and Payouts

### How are rewards calculated?
Rewards are distributed proportionally based on your stake in the winning outcome. The more you bet on the correct outcome, the more you earn.

### When can I claim rewards?
You can claim rewards immediately after a market resolves. There's no time limit on claiming.

### What if there's a tie?
In case of a tie, all participants receive refunds of their original stake amounts.

## Troubleshooting

### My transaction failed
- Check your gas fees
- Ensure you have enough ETH for gas
- Verify you're on the correct network (Sepolia testnet)
- Try refreshing the page

### I can't connect my wallet
- Make sure your wallet is installed and unlocked
- Check that you're on the correct network
- Try disconnecting and reconnecting
- Clear your browser cache if needed

### The page isn't loading
- Check your internet connection
- Try refreshing the page
- Clear your browser cache
- Check if the service is experiencing issues
    `
  },
  problem: {
    title: "The Problem",
    content: `
# The Problem

## Current Prediction Market Limitations

### Privacy Concerns
Traditional prediction markets expose individual voting patterns, making users vulnerable to:
- **Social Pressure**: Fear of judgment from peers
- **Manipulation**: Targeted influence based on known positions
- **Discrimination**: Potential bias based on voting history

### Scalability Issues
Existing platforms struggle with:
- **Centralized Bottlenecks**: Single servers can't handle large opinion markets
- **Slow Processing**: Delays in opinion aggregation and resolution
- **Limited Participation**: Barriers to entry for casual users

### Trust and Transparency
Users face challenges with:
- **Centralized Control**: Single points of failure
- **Opaque Processes**: Lack of verifiable fairness
- **Dispute Resolution**: Difficult to challenge outcomes

### Market Manipulation
Current systems are vulnerable to:
- **Whale Dominance**: Large players can sway outcomes
- **Sybil Attacks**: Multiple fake accounts
- **Front-running**: Exploiting known vote patterns

## Why This Matters

### For Communities
- **Reduced Participation**: Privacy concerns limit engagement
- **Biased Outcomes**: Social pressure affects results
- **Trust Issues**: Doubts about fairness and transparency

### For Developers
- **Complex Implementation**: Difficult to build secure systems
- **High Costs**: Expensive to deploy and maintain
- **Limited Innovation**: Constrained by existing limitations

### For Users
- **Privacy Risks**: Personal choices exposed
- **High Barriers**: Complex setup and high costs
- **Poor Experience**: Slow, unreliable platforms

## The Solution

Conviction Markets addresses these problems through:
- **FHE Encryption**: Complete privacy for individual bets
- **On-chain Resolution**: Transparent and immutable outcomes
- **Scalable Architecture**: Efficient processing for any number of users
- **Fair Distribution**: Proportional rewards based on conviction
    `
  },
  solution: {
    title: "The Solution",
    content: `
# The Solution

## Conviction Markets Approach

### Privacy-First Design
- **FHE Encryption**: All bets encrypted locally before submission
- **Zero-Knowledge**: No individual choices revealed during processing
- **On-chain Privacy**: Encrypted data processed on blockchain
- **Verifiable Results**: Outcomes provably fair without exposing individuals

### Scalable Architecture
- **Efficient Processing**: Batch operations for large markets
- **Layer 2 Ready**: Support for high-throughput networks
- **Modular Design**: Easy to extend and upgrade
- **Cost Effective**: Optimized for minimal gas usage

### Fair and Transparent
- **Conviction-Based**: Rewards proportional to stake amount
- **Immutable Records**: All transactions on blockchain
- **Automated Payouts**: Smart contracts handle distribution
- **No Central Authority**: Truly decentralized operation

## Key Innovations

### FHE Integration
- **Client-side Encryption**: Bets encrypted in user's browser
- **Homomorphic Processing**: Encrypted data processed without decryption
- **Secure Reveal**: Results only revealed after market closes
- **Mathematical Guarantees**: Privacy and fairness mathematically proven

### Smart Contract Design
- **Gas Optimized**: Efficient contract execution
- **Upgradeable**: Can be improved without breaking existing markets
- **Secure**: Regular audits and security reviews
- **Interoperable**: Works with existing DeFi ecosystem

### User Experience
- **Simple Interface**: Easy to use for non-technical users
- **Real-time Updates**: Live market data and activity
- **Mobile Friendly**: Works on all devices
- **Wallet Integration**: Seamless connection with existing wallets

## Benefits

### For Users
- **Complete Privacy**: No one can see your individual choices
- **Fair Rewards**: Proportional to your conviction level
- **Easy Participation**: Simple interface and low barriers
- **Trustworthy**: Transparent and verifiable results

### For Communities
- **Higher Participation**: Privacy encourages engagement
- **Better Outcomes**: Collective wisdom without social bias
- **Reduced Manipulation**: Encrypted voting prevents targeting
- **Scalable**: Works for communities of any size

### For Developers
- **Open Source**: Full transparency and community contribution
- **Extensible**: Easy to build on and customize
- **Well Documented**: Comprehensive guides and examples
- **Active Community**: Support and collaboration opportunities

## Future Vision

### Expansion Plans
- **Multiple Networks**: Support for various blockchains
- **Advanced Features**: More sophisticated market types
- **Integration**: Partnerships with other DeFi protocols
- **Governance**: Community-driven development decisions

### Long-term Goals
- **Mass Adoption**: Prediction markets for everyone
- **Real-world Impact**: Influence on decision-making processes
- **Financial Inclusion**: Access to prediction markets worldwide
- **Innovation Hub**: Platform for new prediction market innovations
    `
  },
  roadmap: {
    title: "Roadmap",
    content: `
# Development Roadmap

## Phase 1: Foundation (July 2025) ✅
- [x] Core smart contract development
- [x] FHE integration with ZAMA
- [x] Basic frontend interface
- [x] Ethereum Sepolia testnet deployment
- [x] Initial security audits

## Phase 2: Enhancement (August-September 2025) 🚧
- [ ] Advanced market types
- [ ] Enhanced UI/UX improvements
- [ ] Additional wallet integrations
- [ ] Performance optimizations

## Phase 3: Expansion (October-December 2025) 📋
- [ ] Mainnet deployment
- [ ] Layer 2 network support
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Community governance features

## Phase 4: Scale (Q1 2026) 📋
- [ ] Multi-chain support
- [ ] Institutional features
- [ ] Advanced privacy features
- [ ] Mobile-first redesign
- [ ] Enterprise partnerships

## Phase 5: Ecosystem (Q2-Q4 2026) 📋
- [ ] Prediction market SDK
- [ ] White-label solutions
- [ ] Cross-chain interoperability
- [ ] AI-powered market insights
- [ ] Global expansion

## Technical Milestones

### Smart Contract Development
- [x] Core prediction market logic
- [x] FHE bet processing
- [x] Reward distribution system
- [ ] Advanced market types
- [ ] Governance mechanisms

### Frontend Development
- [x] Basic market interface
- [x] Wallet integration
- [x] Real-time updates
- [ ] Advanced analytics
- [ ] Mobile optimization

### Infrastructure
- [x] Ethereum testnet deployment
- [x] Basic monitoring
- [ ] Layer 2 integration
- [ ] Multi-chain support
- [ ] Enterprise-grade infrastructure

## Community Goals

### User Adoption
- [ ] 1,000 active users
- [ ] 10,000 markets created
- [ ] $1M total volume
- [ ] 100,000 total participants
- [ ] Global community presence

### Developer Ecosystem
- [ ] Open source release
- [ ] Developer documentation
- [ ] SDK and tools
- [ ] Community contributions
- [ ] Third-party integrations

### Governance
- [ ] Community token launch
- [ ] DAO governance structure
- [ ] Proposal and voting system
- [ ] Treasury management
- [ ] Decentralized development

## Success Metrics

### Technical Metrics
- **Uptime**: 99.9% availability
- **Transaction Speed**: <5 second confirmation
- **Gas Efficiency**: <50% reduction in costs
- **Security**: Zero critical vulnerabilities

### User Metrics
- **Active Users**: Monthly growth targets
- **Market Creation**: Daily new markets
- **Participation Rate**: Percentage of users betting
- **User Retention**: Long-term engagement

### Financial Metrics
- **Total Volume**: Transaction volume growth
- **Revenue**: Platform fee collection
- **Market Capitalization**: Token value appreciation
- **Partnerships**: Strategic collaborations

## Risk Mitigation

### Technical Risks
- **Smart Contract Security**: Regular audits and testing
- **Scalability Issues**: Layer 2 and optimization solutions
- **Privacy Vulnerabilities**: Continuous FHE improvements
- **Network Dependencies**: Multi-chain strategy

### Market Risks
- **Regulatory Changes**: Legal compliance framework
- **Competition**: Unique value proposition focus
- **User Adoption**: Community building and education
- **Economic Factors**: Diversified revenue streams

### Operational Risks
- **Team Continuity**: Knowledge documentation and backup
- **Funding**: Sustainable business model
- **Partnerships**: Multiple collaboration options
- **Community Management**: Transparent communication
    `
  },
  references: {
    title: "References",
    content: `
# References

## Technical Documentation

### ZAMA FHEVM
- **Official Documentation**: [docs.zama.ai](https://docs.zama.ai)
- **GitHub Repository**: [github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)
- **Research Papers**: [zama.ai/research](https://zama.ai/research)

### Ethereum Development
- **Solidity Documentation**: [docs.soliditylang.org](https://docs.soliditylang.org)
- **Ethereum Developer Portal**: [ethereum.org/developers](https://ethereum.org/developers)
- **Hardhat Framework**: [hardhat.org](https://hardhat.org)

### React and Frontend
- **React Documentation**: [react.dev](https://react.dev)
- **TypeScript Handbook**: [typescriptlang.org/docs](https://typescriptlang.org/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
    `
  }
};

const Docs: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Default to welcome if no docId
  const currentDoc = docId ? docsContent[docId as keyof typeof docsContent] : docsContent.welcome;
  
  // Navigation items
  const navItems = [
    { id: 'welcome', title: 'Welcome', icon: '🏠' },
    { id: 'overview', title: 'Overview', icon: '📋' },
    { id: 'problem', title: 'The Problem', icon: '❓' },
    { id: 'solution', title: 'The Solution', icon: '💡' },
    { id: 'architecture', title: 'Architecture', icon: '🏗️' },
    { id: 'usage-guide', title: 'Usage Guide', icon: '📖' },
    { id: 'faq', title: 'FAQ', icon: '❓' },
    { id: 'roadmap', title: 'Roadmap', icon: '🗺️' },
    { id: 'references', title: 'References', icon: '📚' }
  ];

  // Filter nav items based on search
  const filteredNavItems = navItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simple markdown to HTML conversion
  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-mint-700 mb-4">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-mint-700 mb-3 mt-6">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold text-gray-700 mb-2 mt-4">{line.substring(4)}</h3>;
        }
        
        // Lists
        if (line.startsWith('- ')) {
          const content = line.substring(2);
          
          // Handle both links and bold text in list items
          if (content.includes('[') && content.includes('](') && content.includes(')')) {
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let match;
            let lastIndex = 0;
            const parts = [];
            
            while ((match = linkRegex.exec(content)) !== null) {
              const [fullMatch, text, url] = match;
              // Add text before the link (process bold text in this part)
              if (match.index > lastIndex) {
                const beforeText = content.substring(lastIndex, match.index);
                if (beforeText.includes('**')) {
                  const boldParts = beforeText.split('**');
                  parts.push(
                    boldParts.map((part, i) => 
                      i % 2 === 1 ? <strong key={`bold-${i}`} className="font-bold">{part}</strong> : part
                    )
                  );
                } else {
                  parts.push(beforeText);
                }
              }
              // Add the link
              parts.push(
                <a key={parts.length} href={url} className="text-mint-600 hover:text-orange-500 underline" target="_blank" rel="noopener noreferrer">
                  {text}
                </a>
              );
              lastIndex = match.index + fullMatch.length;
            }
            
            // Add remaining text after last link (process bold text in this part too)
            if (lastIndex < content.length) {
              const afterText = content.substring(lastIndex);
              if (afterText.includes('**')) {
                const boldParts = afterText.split('**');
                parts.push(
                  boldParts.map((part, i) => 
                    i % 2 === 1 ? <strong key={`bold-after-${i}`} className="font-bold">{part}</strong> : part
                  )
                );
              } else {
                parts.push(afterText);
              }
            }
            
            return (
              <li key={index} className="ml-4 mb-1 text-gray-700">
                {parts}
              </li>
            );
          }
          
          // Handle only bold text in list items (no links)
          if (content.includes('**')) {
            const parts = content.split('**');
            return (
              <li key={index} className="ml-4 mb-1 text-gray-700">
                {parts.map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                )}
              </li>
            );
          }
          
          return <li key={index} className="ml-4 mb-1 text-gray-700">{content}</li>;
        }
        if (line.startsWith('  - ')) {
          const content = line.substring(4);
          if (content.includes('**')) {
            const parts = content.split('**');
            return (
              <li key={index} className="ml-8 mb-1 text-gray-700">
                {parts.map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
                )}
              </li>
            );
          }
          return <li key={index} className="ml-8 mb-1 text-gray-700">{content}</li>;
        }
        
        // Links - improved regex to catch more link formats
        if (line.includes('[') && line.includes('](') && line.includes(')')) {
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          let match;
          let lastIndex = 0;
          const parts = [];
          
          while ((match = linkRegex.exec(line)) !== null) {
            const [fullMatch, text, url] = match;
            // Add text before the link
            if (match.index > lastIndex) {
              parts.push(line.substring(lastIndex, match.index));
            }
            // Add the link
            parts.push(
              <a key={parts.length} href={url} className="text-mint-600 hover:text-orange-500 underline" target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            );
            lastIndex = match.index + fullMatch.length;
          }
          
          // Add remaining text after last link
          if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
          }
          
          if (parts.length > 0) {
            return (
              <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                {parts}
              </p>
            );
          }
        }
        
        // If no links were processed, continue to other checks
        
        // Bold text
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={index} className="mb-3 text-gray-700 leading-relaxed">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
              )}
            </p>
          );
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <div key={index} className="mb-2"></div>;
        }
        
        // Regular paragraphs
        if (line.trim()) {
          return <p key={index} className="mb-3 text-gray-700 leading-relaxed">{line}</p>;
        }
        
        return null;
      });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-mint-600 hover:text-orange-500 transition">
            <FaArrowLeft className="text-lg" />
            <span>Back to App</span>
          </Link>
          <div className="flex items-center gap-2">
            <FaBook className="text-2xl text-orange-500" />
            <h1 className="text-3xl font-bold text-mint-700">Documentation</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <nav className="space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/docs/${item.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    docId === item.id || (!docId && item.id === 'welcome')
                      ? 'bg-mint-100 text-mint-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-mint-600'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg p-8 h-[calc(100vh-200px)] overflow-y-auto">
            <div className="prose prose-lg max-w-none">
              {renderMarkdown(currentDoc.content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs; 