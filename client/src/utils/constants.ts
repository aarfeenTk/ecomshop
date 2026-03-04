export const ORDER_STATUSES = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
} as const;

export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'Bank Transfer',
  CASH_ON_DELIVERY: 'Cash on Delivery'
} as const;

export const FILTER_OPTIONS = {
  ALL: 'all'
} as const;
