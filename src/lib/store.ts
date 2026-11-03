import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  addDaysISO,
  daysLate,
  formatRupiah,
  generateAccessCode,
  generateLoanId,
  lateFeeFor,
} from './format'
import { buildSeedState } from './seed'
import type {
  Compartment,
  Loan,
  PaymentMethod,
  SensorKind,
  SessionUser,
  Station,
  Tool,
  ToolCondition,
} from './types'

export type ToastTone = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

export interface LoanDraft {
  userName: string
  studentId: string
  contact: string
  toolId: string
  startDate: string
  durationDays: number
}

export const ADMIN_PIN = '2024'

interface StoreState {
  stations: Station[]
  compartments: Compartment[]
  tools: Tool[]
  loans: Loan[]
  session: SessionUser | null
  adminAuthed: boolean
  toasts: Toast[]

  setSession: (user: SessionUser | null) => void
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: number) => void

  requestLoan: (draft: LoanDraft) => string | null
  payLoan: (loanId: string, method: PaymentMethod) => boolean
  cancelLoan: (loanId: string) => void
  submitReturn: (
    loanId: string,
    sensor: SensorKind,
    condition: ToolCondition,
    notes: string,
  ) => void
  resolveReturn: (
    loanId: string,
    condition: ToolCondition,
    refundDeposit: boolean,
    notes: string,
  ) => void

  adminLogin: (pin: string) => boolean
  adminLogout: () => void
  updateTool: (toolId: string, patch: Partial<Tool>) => void
  addTool: (input: Omit<Tool, 'id' | 'status' | 'compartmentId'>) => void
  removeTool: (toolId: string) => void
  resetDemo: () => void
}

let toastSeq = 0

function freshSeed() {
  return buildSeedState()
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...freshSeed(),
      session: null,
      adminAuthed: false,
      toasts: [],

      setSession: (user) => set({ session: user }),

      pushToast: (message, tone = 'info') => {
        const id = ++toastSeq
        set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
        setTimeout(() => get().dismissToast(id), 3600)
      },
      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      requestLoan: (draft) => {
        const tool = get().tools.find((t) => t.id === draft.toolId)
        if (!tool || tool.status !== 'Tersedia') {
          get().pushToast('Alat tidak tersedia. Pilih alat lain.', 'error')
          return null
        }
        if (!tool.compartmentId) {
          get().pushToast('Alat belum punya kompartemen.', 'error')
          return null
        }
        const rentalFee = tool.pricePerDay * draft.durationDays
        const loan: Loan = {
          id: generateLoanId(),
          userName: draft.userName,
          studentId: draft.studentId,
          contact: draft.contact,
          identityVerified: true,
          toolId: tool.id,
          stationId: tool.stationId,
          compartmentId: tool.compartmentId,
          accessCode: '',
          startDate: draft.startDate,
          dueDate: addDaysISO(draft.startDate, draft.durationDays),
          durationDays: draft.durationDays,
          rentalFee,
          deposit: tool.deposit,
          lateFee: 0,
          status: 'Menunggu pembayaran',
          payment: null,
          returnInfo: null,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          loans: [loan, ...s.loans],
          session: {
            name: draft.userName,
            studentId: draft.studentId,
            contact: draft.contact,
          },
        }))
        return loan.id
      },

      payLoan: (loanId, method) => {
        const loan = get().loans.find((l) => l.id === loanId)
        if (!loan || loan.status !== 'Menunggu pembayaran') return false
        const total = loan.rentalFee + loan.deposit
        set((s) => ({
          loans: s.loans.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  status: 'Aktif',
                  accessCode: generateAccessCode(),
                  payment: {
                    method,
                    rentalFee: l.rentalFee,
                    deposit: l.deposit,
                    total,
                    paidAt: new Date().toISOString(),
                    status: 'Berhasil',
                  },
                }
              : l,
          ),
          tools: s.tools.map((t) =>
            t.id === loan.toolId ? { ...t, status: 'Dipinjam' } : t,
          ),
          compartments: s.compartments.map((c) =>
            c.id === loan.compartmentId ? { ...c, status: 'Kosong' } : c,
          ),
        }))
        get().pushToast('Pembayaran berhasil. Kode akses loker diterbitkan.', 'success')
        return true
      },

      cancelLoan: (loanId) => {
        const loan = get().loans.find((l) => l.id === loanId)
        if (!loan) return
        if (loan.status === 'Selesai' || loan.status === 'Dibatalkan') return
        set((s) => ({
          loans: s.loans.map((l) =>
            l.id === loanId ? { ...l, status: 'Dibatalkan' } : l,
          ),
          tools: s.tools.map((t) =>
            t.id === loan.toolId && loan.status !== 'Menunggu pembayaran'
              ? { ...t, status: 'Tersedia' }
              : t,
          ),
          compartments: s.compartments.map((c) =>
            c.id === loan.compartmentId && loan.status !== 'Menunggu pembayaran'
              ? { ...c, status: 'Terisi', toolId: loan.toolId }
              : c,
          ),
        }))
        get().pushToast('Transaksi dibatalkan.', 'info')
      },

      submitReturn: (loanId, sensor, condition, notes) => {
        const loan = get().loans.find((l) => l.id === loanId)
        if (!loan) return
        const late = daysLate(loan.dueDate)
        const lateFee = lateFeeFor(loan, late)
        const cleanReturn = condition === 'Baik'
        const depositReturned = cleanReturn
          ? Math.max(0, loan.deposit - lateFee)
          : 0
        set((s) => ({
          loans: s.loans.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  lateFee,
                  status: cleanReturn ? 'Selesai' : 'Menunggu verifikasi',
                  returnInfo: {
                    returnedAt: new Date().toISOString(),
                    sensor,
                    sensorVerified: true,
                    condition,
                    depositRefunded: cleanReturn,
                    depositReturned,
                    notes,
                  },
                  payment: cleanReturn && l.payment
                    ? { ...l.payment, status: 'Dikembalikan' }
                    : l.payment,
                }
              : l,
          ),
          tools: s.tools.map((t) =>
            t.id === loan.toolId
              ? {
                  ...t,
                  condition,
                  status: cleanReturn ? 'Tersedia' : 'Tidak tersedia',
                }
              : t,
          ),
          compartments: s.compartments.map((c) =>
            c.id === loan.compartmentId
              ? {
                  ...c,
                  toolId: loan.toolId,
                  status: cleanReturn ? 'Terisi' : 'Perlu diperiksa',
                }
              : c,
          ),
        }))
        get().pushToast(
          cleanReturn
            ? late > 0
              ? `Terlambat ${late} hari · denda ${formatRupiah(lateFee)} dipotong dari deposit.`
              : 'Alat terverifikasi sensor. Deposit dikembalikan penuh.'
            : 'Pengembalian diteruskan ke admin untuk verifikasi.',
          cleanReturn ? 'success' : 'info',
        )
      },

      resolveReturn: (loanId, condition, refundDeposit, notes) => {
        const loan = get().loans.find((l) => l.id === loanId)
        if (!loan || loan.status !== 'Menunggu verifikasi') return
        set((s) => ({
          loans: s.loans.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  status: 'Selesai',
                  returnInfo: {
                    returnedAt: l.returnInfo?.returnedAt ?? new Date().toISOString(),
                    sensor: l.returnInfo?.sensor ?? 'RFID',
                    sensorVerified: true,
                    condition,
                    depositRefunded: refundDeposit,
                    depositReturned: refundDeposit
                      ? Math.max(0, l.deposit - l.lateFee)
                      : 0,
                    notes: notes || l.returnInfo?.notes || '',
                  },
                  payment:
                    refundDeposit && l.payment
                      ? { ...l.payment, status: 'Dikembalikan' }
                      : l.payment,
                }
              : l,
          ),
          tools: s.tools.map((t): Tool =>
            t.id === loan.toolId
              ? {
                  ...t,
                  condition,
                  status: condition === 'Baik' ? 'Tersedia' : 'Tidak tersedia',
                }
              : t,
          ),
          compartments: s.compartments.map((c): Compartment =>
            c.id === loan.compartmentId
              ? {
                  ...c,
                  toolId: loan.toolId,
                  status: condition === 'Baik' ? 'Terisi' : 'Perlu diperiksa',
                }
              : c,
          ),
        }))
        get().pushToast(
          refundDeposit
            ? 'Verifikasi selesai. Deposit dikembalikan.'
            : 'Verifikasi selesai. Deposit ditahan.',
          'success',
        )
      },

      adminLogin: (pin) => {
        if (pin === ADMIN_PIN) {
          set({ adminAuthed: true })
          get().pushToast('Masuk sebagai pengelola.', 'success')
          return true
        }
        get().pushToast('PIN pengelola salah.', 'error')
        return false
      },
      adminLogout: () => set({ adminAuthed: false }),

      updateTool: (toolId, patch) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === toolId ? { ...t, ...patch } : t)),
        })),

      addTool: (input) => {
        const station = get().stations.find((st) => st.id === input.stationId)
        if (!station) return
        const freeComp = get().compartments.find(
          (c) => c.stationId === input.stationId && c.status === 'Kosong' && !c.toolId,
        )
        const id = `T${Date.now().toString().slice(-5)}`
        const tool: Tool = {
          ...input,
          id,
          status: 'Tersedia',
          compartmentId: freeComp ? freeComp.id : null,
        }
        set((s) => ({
          tools: [...s.tools, tool],
          compartments: freeComp
            ? s.compartments.map((c) =>
                c.id === freeComp.id
                  ? { ...c, status: 'Terisi', toolId: id }
                  : c,
              )
            : s.compartments,
        }))
        get().pushToast('Alat baru ditambahkan ke inventaris.', 'success')
      },

      removeTool: (toolId) => {
        const tool = get().tools.find((t) => t.id === toolId)
        if (!tool) return
        if (tool.status === 'Dipinjam') {
          get().pushToast('Alat sedang dipinjam, tidak bisa dihapus.', 'error')
          return
        }
        set((s) => ({
          tools: s.tools.filter((t) => t.id !== toolId),
          compartments: s.compartments.map((c) =>
            c.toolId === toolId ? { ...c, status: 'Kosong', toolId: null } : c,
          ),
        }))
        get().pushToast('Alat dihapus dari inventaris.', 'info')
      },

      resetDemo: () => {
        set({ ...freshSeed(), adminAuthed: get().adminAuthed })
        get().pushToast('Data demo dikembalikan ke awal.', 'info')
      },
    }),
    {
      name: 'slt-store-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        stations: s.stations,
        compartments: s.compartments,
        tools: s.tools,
        loans: s.loans,
        session: s.session,
        adminAuthed: s.adminAuthed,
      }),
    },
  ),
)

export function toolOf(state: StoreState, id: string): Tool | undefined {
  return state.tools.find((t) => t.id === id)
}

export function compartmentOf(
  state: StoreState,
  id: string,
): Compartment | undefined {
  return state.compartments.find((c) => c.id === id)
}

export function stationOf(
  state: StoreState,
  id: string,
): Station | undefined {
  return state.stations.find((s) => s.id === id)
}
