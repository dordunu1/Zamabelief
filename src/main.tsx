import { createRoot } from 'react-dom/client'
import './index.css'
import App, { ErrorBoundary } from './App.tsx'
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig, } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { sepolia } from 'wagmi/chains';
import { BrowserRouter } from 'react-router-dom';

const config = getDefaultConfig({
  appName: 'Belief Market',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [sepolia],
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <WagmiConfig config={config}>
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: '#000000',
          accentColorForeground: '#ffffff',
          borderRadius: 'medium',
        })}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig>
  </QueryClientProvider>
  </ErrorBoundary>
);
