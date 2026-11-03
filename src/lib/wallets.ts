import type { PaymentMethod } from './types'

export interface WalletOption {
  id: PaymentMethod
  label: string
  color: string
  note: string
}

export const wallets: WalletOption[] = [
  { id: 'GoPay', label: 'GoPay', color: '#00aed6', note: 'Saldo & GoPay Coins' },
  { id: 'OVO', label: 'OVO', color: '#4c3494', note: 'OVO Cash' },
  { id: 'Dana', label: 'Dana', color: '#108ee9', note: 'Saldo Dana' },
  { id: 'ShopeePay', label: 'ShopeePay', color: '#ee4d2d', note: 'Saldo ShopeePay' },
]

export const durations = [1, 2, 3, 5, 7]
