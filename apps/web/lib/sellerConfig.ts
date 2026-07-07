export interface SellerConfig {
  sellerEnabled: boolean;
  allowSellerRegistration: boolean;
  requireApproval: boolean;
  defaultCommissionRate: number;
  minOrderAmount: number;
  maxProductsPerSeller: number;
}

const DEFAULT_CONFIG: SellerConfig = {
  sellerEnabled: true,
  allowSellerRegistration: true,
  requireApproval: true,
  defaultCommissionRate: 10,
  minOrderAmount: 0,
  maxProductsPerSeller: 100,
};

export async function getSellerConfig(): Promise<SellerConfig> {
  return DEFAULT_CONFIG;
}

export function isSellerSystemEnabled(config: SellerConfig): boolean {
  return config.sellerEnabled;
}

export function canRegisterAsSeller(config: SellerConfig): boolean {
  return config.sellerEnabled && config.allowSellerRegistration;
}
