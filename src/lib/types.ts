export type ToolCondition =
  | 'Baik'
  | 'Perlu diperiksa'
  | 'Rusak'
  | 'Dalam perbaikan'

export type ToolStatus = 'Tersedia' | 'Dipinjam' | 'Tidak tersedia'

export type CompartmentStatus =
  | 'Terisi'
  | 'Kosong'
  | 'Terkunci'
  | 'Perlu diperiksa'

export type CompartmentSize = 'S' | 'M' | 'L'

export type PaymentMethod = 'GoPay' | 'OVO' | 'Dana' | 'ShopeePay'

export type LoanStatus =
  | 'Menunggu pembayaran'
  | 'Aktif'
  | 'Menunggu verifikasi'
  | 'Selesai'
  | 'Terlambat'
  | 'Dibatalkan'

export type SensorKind = 'RFID' | 'Sensor berat'

export interface Station {
  id: string
  name: string
  location: string
  description: string
  compartmentCount: number
}

export interface Compartment {
  id: string
  label: string
  stationId: string
  size: CompartmentSize
  status: CompartmentStatus
  toolId: string | null
}

export interface ConditionEvent {
  at: string
  condition: ToolCondition | ''
  note: string
  source: 'sistem' | 'peminjam' | 'admin'
  loanId?: string
}

export interface Tool {
  id: string
  name: string
  icon: string
  category: string
  description: string
  condition: ToolCondition
  status: ToolStatus
  stationId: string
  compartmentId: string | null
  pricePerDay: number
  deposit: number
  history: ConditionEvent[]
}

export type NotificationKind =
  | 'siap-diambil'
  | 'pengingat-jatuh-tempo'
  | 'terlambat'
  | 'deposit-kembali'
  | 'deposit-ditahan'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: string
  loanId?: string
  read: boolean
}

export interface ReturnInfo {
  returnedAt: string
  sensor: SensorKind
  sensorVerified: boolean
  condition: ToolCondition | ''
  depositRefunded: boolean
  depositReturned: number
  notes: string
}

export interface Payment {
  method: PaymentMethod
  rentalFee: number
  deposit: number
  total: number
  paidAt: string
  status: 'Berhasil' | 'Dikembalikan'
}

export interface Loan {
  id: string
  userName: string
  studentId: string
  contact: string
  identityVerified: boolean
  toolId: string
  stationId: string
  compartmentId: string
  accessCode: string
  startDate: string
  dueDate: string
  durationDays: number
  rentalFee: number
  deposit: number
  lateFee: number
  status: LoanStatus
  payment: Payment | null
  returnInfo: ReturnInfo | null
  createdAt: string
}

export interface SessionUser {
  name: string
  studentId: string
  contact: string
}
