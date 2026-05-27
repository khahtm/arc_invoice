export const tourSteps = [
  {
    target: '[data-tour="header-logo"]',
    content: 'Welcome to ArcInvoice! Let us show you around the platform.',
    title: 'Welcome',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="tab-nav"]',
    content: 'Navigate between Dashboard, Deals, Analytics, and Settings from here.',
    title: 'Navigation',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="new-deal-btn"]',
    content: 'Create a new escrow deal with milestone-based payments. Share the link with your client to get started.',
    title: 'Create Deals',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="connect-wallet"]',
    content: 'Your connected wallet. All payments are received directly to this address in USDC.',
    title: 'Your Wallet',
    placement: 'bottom-end' as const,
  },
  {
    target: '[data-tour="stat-cards"]',
    content: 'Track your active deals, earnings, pending payments, and completed deals at a glance.',
    title: 'Stats Overview',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="deals-list"]',
    content: 'Your active deals appear here. Click any deal to view milestones, deliver work, or release payments.',
    title: 'Active Deals',
    placement: 'top' as const,
  },
  {
    target: '[data-tour="help-btn"]',
    content: 'You can replay this tour anytime by clicking here. Happy building!',
    title: 'Need Help?',
    placement: 'bottom-end' as const,
  },
];
