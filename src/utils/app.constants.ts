export const APP_CONSTANTS = {
  RETURNS: {
    NPS: {
      INTEREST_RATE: 0.0711, // 7.11%
      MAX_TAX_DEDUCTION: 200000,
      MAX_DEDUCTION_PERCENTAGE: 0.1, // 10%
    },
    INDEX: {
      INTEREST_RATE: 0.1449, // 14.49%
    },
    TAX_SLABS: [
      { limit: 700000, rate: 0 },
      { limit: 1000000, rate: 0.1 },
      { limit: 1200000, rate: 0.15 },
      { limit: 1500000, rate: 0.2 },
      { limit: Infinity, rate: 0.3 },
    ],
  },
};
