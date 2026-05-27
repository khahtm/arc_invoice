import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { arcMainnet, arcTestnet } from './chains/arc';
import { sepolia, baseSepolia, arbitrumSepolia, polygonAmoy, optimismSepolia } from 'viem/chains';

export const config = createConfig({
  chains: [arcTestnet, arcMainnet, sepolia, baseSepolia, arbitrumSepolia, polygonAmoy, optimismSepolia],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(),
    [arcMainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [optimismSepolia.id]: http(),
  },
  ssr: true,
});
