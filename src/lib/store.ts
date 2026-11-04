import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  addDaysISO,
  daysBetween,
  daysLate,
  formatRupiah,
  generateAccessCode,
  generateLoanId,
  lateFeeFor,
  todayISO,
} from './format'
import { buildSeedState } from './seed'
import { hasConflict } from './availability'
import type {
  AppNotification,
  Compartment,
  ConditionEvent,
  Loan,
  NotificationKind,
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
  notifications: AppNotification[]
  session: SessionUser | null
  adminAuthed: boolean
  toasts: Toast[]

  setSession: (user: SessionUser | null) => void
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: number) => void

  notify: (kind: NotificationKind, title: string, body: string, loanId?: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  syncDueReminders: () => void

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
  addTool: (input: Omit<Tool, 'id' | 'status' | 'compartmentId' | 'history'>) => void
  removeTool: (toolId: string) => void
  resetDemo: () => void
}

let toastSeq = 0
let notifSeq = 0

function freshSeed() {
  return buildSeedState()
}

function condEvent(
  condition: ToolCondition | '',
  note: string,
  source: ConditionEvent['source'],
  loanId?: string,
): ConditionEvent {
  return { at: new Date().toISOString(), condition, note, source, loanId }
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

      notify: (kind, title, body, loanId) => {
        const n: AppNotification = {
          id: `NTF-${Date.now().toString().slice(-6)}-${++notifSeq}`,
          kind,
          title,
          body,
          createdAt: new Date().toISOString(),
          loanId,
          read: false,
        }
        set((s) => ({ notifications: [n, ...s.notifications] }))
      },
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),

      syncDueReminders: () => {
        const { loans, tools, notifications } = get()
        const today = todayISO()
        const nameOf = (id: string) => tools.find((t) => t.id === id)?.name ?? id
        const reminders: AppNotification[] = []
        for (const l of loans) {
          if (l.status !== 'Aktif' && l.status !== 'Terlambat') continue
          const already = notifications.some(
            (n) => n.loanId === l.id && n.kind === 'pengingat-jatuh-tempo',
          )
          if (already) continue
          const dueIn = daysBetween(today, l.dueDate.slice(0, 10))
          if (dueIn > 2) continue
          reminders.push({
            id: `NTF-${l.id}-remind`,
            kind: 'pengingat-jatuh-tempo',
            title: dueIn < 0 ? 'Lewat jatuh tempo' : 'Segera jatuh tempo',
            body:
              dueIn < 0
                ? `${nameOf(l.toolId)} sudah melewati jatuh tempo (${l.dueDate}). Kembalikan untuk menghentikan denda.`
                : `Kembalikan ${nameOf(l.toolId)} paling lambat ${l.dueDate}${dueIn === 0 ? ' (hari ini)' : ''}.`,
            createdAt: new Date().toISOString(),
            loanId: l.id,
            read: false,
          })
        }
        if (reminders.length > 0) {
          set((s) => ({ notifications: [...reminders, ...s.notifications] }))
        }
      },

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
        if (hasConflict(get().loans, tool.id, draft.startDate, draft.durationDays)) {
          get().pushToast('Tanggal terpilih sudah dipesan. Cek kalender ketersediaan.', 'error')
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
        const accessCode = generateAccessCode()
        set((s) => ({
          loans: s.loans.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  status: 'Aktif',
                  accessCode,
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
        const toolName =
          get().tools.find((t) => t.id === loan.toolId)?.name ?? loan.toolId
        get().notify(
          'siap-diambil',
          'Loker siap dibuka',
          `${toolName} · kode akses ${accessCode}. Ambil sebelum ${loan.dueDate}.`,
          loanId,
        )
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
          tools: s.tools.map((t): Tool =>
            t.id === loan.toolId
              ? {
                  ...t,
                  condition,
                  status: cleanReturn ? 'Tersedia' : 'Tidak tersedia',
                  history: [
                    ...t.history,
                    condEvent(
                      condition,
                      notes || (cleanReturn ? 'Pengembalian terverifikasi sensor.' : 'Perlu pemeriksaan admin.'),
                      cleanReturn ? 'sistem' : 'peminjam',
                      loanId,
                    ),
                  ],
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
        const toolName =
          get().tools.find((t) => t.id === loan.toolId)?.name ?? loan.toolId
        get().notify(
          cleanReturn ? 'deposit-kembali' : 'deposit-ditahan',
          cleanReturn ? 'Pengembalian diterima' : 'Menunggu verifikasi',
          cleanReturn
            ? late > 0
              ? `${toolName} kembali terlambat. Denda ${formatRupiah(lateFee)} dipotong, deposit ${formatRupiah(depositReturned)} kembali.`
              : `${toolName} kembali tepat waktu. Deposit ${formatRupiah(depositReturned)} dikembalikan penuh.`
            : `${toolName} perlu diperiksa manual. Deposit ditahan sementara.`,
          loanId,
        )
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
        const depositReturned = refundDeposit
          ? Math.max(0, loan.deposit - loan.lateFee)
          : 0
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
                    depositReturned,
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
                  history: [
                    ...t.history,
                    condEvent(
                      condition,
                      notes || `Verifikasi admin · deposit ${refundDeposit ? 'dikembalikan' : 'ditahan'}.`,
                      'admin',
                      loanId,
                    ),
                  ],
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
        const toolName =
          get().tools.find((t) => t.id === loan.toolId)?.name ?? loan.toolId
        get().notify(
          refundDeposit ? 'deposit-kembali' : 'deposit-ditahan',
          refundDeposit ? 'Verifikasi selesai' : 'Deposit ditahan',
          refundDeposit
            ? `${toolName} lulus pemeriksaan. Deposit ${formatRupiah(depositReturned)} dikembalikan.`
            : `${toolName} dinyatakan ${condition}. Deposit ditahan${notes ? ` · ${notes}` : ''}.`,
          loanId,
        )
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
          tools: s.tools.map((t) => {
            if (t.id !== toolId) return t
            const next = { ...t, ...patch }
            if (patch.condition && patch.condition !== t.condition) {
              next.history = [
                ...t.history,
                condEvent(patch.condition, 'Kondisi diperbarui admin.', 'admin'),
              ]
            }
            return next
          }),
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
          history: [
            condEvent(input.condition || 'Baik', 'Masuk inventaris, lolos inspection awal.', 'sistem'),
          ],
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
      name: 'slt-store-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        stations: s.stations,
        compartments: s.compartments,
        tools: s.tools,
        loans: s.loans,
        notifications: s.notifications,
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
