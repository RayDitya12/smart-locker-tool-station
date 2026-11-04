import type {
  AppNotification,
  Compartment,
  Loan,
  LoanStatus,
  PaymentMethod,
  Station,
  Tool,
  ToolCondition,
} from './types'

function dayISO(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)
}

function stampISO(offsetDays: number, hour: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, (hour * 13) % 60, 0, 0)
  return d.toISOString()
}

export const seedStations: Station[] = [
  {
    id: 'ST-01',
    name: 'Stasiun Kos Mandiri Raya',
    location: 'Kawasan kos Jl. Mandiri Raya (dekat pos jaga)',
    description:
      'Titik loker utama di kawasan kos padat. Terang, diawasi, dan mudah dijangkau penghuni.',
    compartmentCount: 9,
  },
  {
    id: 'ST-02',
    name: 'Stasiun Minimarket Kampus',
    location: 'Minimarket 24 jam, gerbang belakang kampus',
    description:
      'Menempel di minimarket 24 jam sehingga akses tetap aman kapan pun, termasuk malam hari.',
    compartmentCount: 6,
  },
]

interface ToolSeed {
  id: string
  name: string
  icon: string
  category: string
  description: string
  pricePerDay: number
  deposit: number
  size: 'S' | 'M' | 'L'
  stationId: string
}

const toolSeeds: ToolSeed[] = [
  {
    id: 'A01',
    name: 'Obeng Set',
    icon: '🪛',
    category: 'Perkakas',
    description: 'Set obeng plus & minus untuk perakitan dan perawatan ringan.',
    pricePerDay: 5000,
    deposit: 20000,
    size: 'S',
    stationId: 'ST-01',
  },
  {
    id: 'A02',
    name: 'Tang Kombinasi',
    icon: '🗜️',
    category: 'Perkakas',
    description: 'Tang serbaguna untuk menjepit, memutar, dan memotong kabel.',
    pricePerDay: 5000,
    deposit: 20000,
    size: 'S',
    stationId: 'ST-01',
  },
  {
    id: 'A03',
    name: 'Palu Kecil',
    icon: '🔨',
    category: 'Perkakas',
    description: 'Palu 300 gr untuk pekerjaan perakitan sederhana.',
    pricePerDay: 4000,
    deposit: 15000,
    size: 'S',
    stationId: 'ST-01',
  },
  {
    id: 'A04',
    name: 'Kunci Pas Set',
    icon: '🔧',
    category: 'Perkakas',
    description: 'Set kunci pas & ring 8-19 mm untuk mengencangkan baut.',
    pricePerDay: 6000,
    deposit: 25000,
    size: 'M',
    stationId: 'ST-01',
  },
  {
    id: 'A05',
    name: 'Meteran 5 m',
    icon: '📏',
    category: 'Perkakas',
    description: 'Meteran tarik 5 meter untuk mengukur perabot & ruangan.',
    pricePerDay: 3000,
    deposit: 10000,
    size: 'S',
    stationId: 'ST-01',
  },
  {
    id: 'A06',
    name: 'Bor Listrik Kecil',
    icon: '🛠️',
    category: 'Elektronik',
    description: 'Bor cordless + mata bor untuk merakit perabot pribadi.',
    pricePerDay: 15000,
    deposit: 75000,
    size: 'L',
    stationId: 'ST-01',
  },
  {
    id: 'A07',
    name: 'Tangga Lipat Mini',
    icon: '🪜',
    category: 'Perkakas',
    description: 'Tangga lipat 3 langkah, ringkas untuk jangkauan tinggi.',
    pricePerDay: 12000,
    deposit: 60000,
    size: 'L',
    stationId: 'ST-01',
  },
  {
    id: 'B01',
    name: 'Setrika',
    icon: '🧺',
    category: 'Rumah Tangga',
    description: 'Setrika listrik untuk kebutuhan harian anak kost.',
    pricePerDay: 8000,
    deposit: 40000,
    size: 'M',
    stationId: 'ST-02',
  },
  {
    id: 'B02',
    name: 'Vacuum Portabel',
    icon: '🧹',
    category: 'Kebersihan',
    description: 'Vacuum cleaner genggam untuk membersihkan kamar kos.',
    pricePerDay: 12000,
    deposit: 60000,
    size: 'M',
    stationId: 'ST-02',
  },
  {
    id: 'B03',
    name: 'Rice Cooker Kecil',
    icon: '🍚',
    category: 'Rumah Tangga',
    description: 'Rice cooker 0,6 L untuk memasak nasi di kamar.',
    pricePerDay: 10000,
    deposit: 50000,
    size: 'M',
    stationId: 'ST-02',
  },
]

function buildCompartments(): Compartment[] {
  const compartments: Compartment[] = []
  const sizeOf = new Map(toolSeeds.map((t) => [t.id, t.size]))

  for (const station of seedStations) {
    const prefix = station.id === 'ST-01' ? 'A' : 'B'
    const stationTools = toolSeeds.filter((t) => t.stationId === station.id)
    for (let i = 0; i < station.compartmentCount; i++) {
      const label = `${prefix}${i + 1}`
      const tool = stationTools[i]
      compartments.push({
        id: `${station.id}-${label}`,
        label,
        stationId: station.id,
        size: tool ? sizeOf.get(tool.id) ?? 'M' : 'M',
        status: tool ? 'Terisi' : 'Kosong',
        toolId: tool ? tool.id : null,
      })
    }
  }
  return compartments
}

export function buildSeedCompartments(): Compartment[] {
  return buildCompartments()
}

export function buildSeedTools(): Tool[] {
  const compartments = buildCompartments()
  return toolSeeds.map((t) => {
    const comp = compartments.find((c) => c.toolId === t.id)
    return {
      id: t.id,
      name: t.name,
      icon: t.icon,
      category: t.category,
      description: t.description,
      condition: 'Baik',
      status: 'Tersedia',
      stationId: t.stationId,
      compartmentId: comp ? comp.id : null,
      pricePerDay: t.pricePerDay,
      deposit: t.deposit,
      history: [
        {
          at: stampISO(-31, 9),
          condition: 'Baik',
          note: 'Masuk inventaris, lolos inspection awal.',
          source: 'sistem',
        },
      ],
    } satisfies Tool
  })
}

interface HistorySeed {
  toolId: string
  name: string
  studentId: string
  dayAgo: number
  hour: number
  durationDays: number
  status: LoanStatus
  method: PaymentMethod
  lateDays?: number
  condition?: ToolCondition
}

const historySeeds: HistorySeed[] = [
  { toolId: 'A06', name: 'Dimas Prayoga', studentId: '2101054', dayAgo: 20, hour: 10, durationDays: 3, status: 'Selesai', method: 'GoPay' },
  { toolId: 'B01', name: 'Siti Nurhaliza', studentId: '2102088', dayAgo: 18, hour: 19, durationDays: 2, status: 'Selesai', method: 'OVO' },
  { toolId: 'A01', name: 'Bayu Anggara', studentId: '2003112', dayAgo: 15, hour: 8, durationDays: 4, status: 'Selesai', method: 'Dana' },
  { toolId: 'A07', name: 'Putri Ayu', studentId: '2104021', dayAgo: 12, hour: 14, durationDays: 1, status: 'Selesai', method: 'ShopeePay' },
  { toolId: 'A04', name: 'Rizky Maulana', studentId: '2005190', dayAgo: 10, hour: 21, durationDays: 5, status: 'Selesai', method: 'GoPay' },
  { toolId: 'B03', name: 'Nadia Safitri', studentId: '2106077', dayAgo: 8, hour: 12, durationDays: 2, status: 'Selesai', method: 'OVO' },
  { toolId: 'A03', name: 'Fajar Nugroho', studentId: '2007033', dayAgo: 6, hour: 16, durationDays: 3, status: 'Selesai', method: 'Dana' },
  { toolId: 'B02', name: 'Intan Permata', studentId: '2108045', dayAgo: 9, hour: 9, durationDays: 3, status: 'Selesai', method: 'GoPay', lateDays: 2 },
  { toolId: 'A05', name: 'Yoga Pratama', studentId: '2009118', dayAgo: 7, hour: 13, durationDays: 3, status: 'Selesai', method: 'ShopeePay', lateDays: 3 },
  { toolId: 'A02', name: 'Maya Sari', studentId: '2110052', dayAgo: 4, hour: 10, durationDays: 3, status: 'Menunggu verifikasi', method: 'OVO', condition: 'Perlu diperiksa' },
  { toolId: 'A06', name: 'Andi Laksana', studentId: '2011009', dayAgo: 2, hour: 15, durationDays: 4, status: 'Aktif', method: 'GoPay' },
  { toolId: 'B01', name: 'Rina Wati', studentId: '2112063', dayAgo: 6, hour: 20, durationDays: 3, status: 'Terlambat', method: 'Dana' },
]

const personas: Record<string, string> = {
  A06: 'bor-listrik',
  B01: 'setrika',
}

function reservationLoan(compartments: Compartment[]): Loan {
  const tool = toolSeeds.find((t) => t.id === 'A03')!
  const comp = compartments.find((c) => c.toolId === 'A03')!
  const start = dayISO(4)
  const duration = 3
  return {
    id: 'TRX-199004',
    userName: 'Gilang Ramadhan',
    studentId: '2113077',
    contact: 'gilang.r@mail.ac.id',
    identityVerified: true,
    toolId: tool.id,
    stationId: tool.stationId,
    compartmentId: comp.id,
    accessCode: '',
    startDate: start,
    dueDate: dayISO(4 + duration),
    durationDays: duration,
    rentalFee: tool.pricePerDay * duration,
    deposit: tool.deposit,
    lateFee: 0,
    status: 'Menunggu pembayaran',
    payment: null,
    returnInfo: null,
    createdAt: stampISO(0, 10),
  }
}

export function buildSeedLoans(): Loan[] {
  const tools = buildSeedTools()
  const compartments = buildCompartments()
  const toolById = new Map(tools.map((t) => [t.id, t]))

  const loans: Loan[] = historySeeds.map((h, i) => {
    const tool = toolById.get(h.toolId)!
    const comp = compartments.find((c) => c.toolId === h.toolId)!
    const startDate = dayISO(-h.dayAgo)
    const dueDate = dayISO(-h.dayAgo + h.durationDays)
    const rentalFee = tool.pricePerDay * h.durationDays
    const lateDays = h.lateDays ?? 0
    const perDay = tool.pricePerDay
    const lateFee = Math.min(tool.deposit, lateDays * perDay)
    const isPending = h.status === 'Menunggu verifikasi'
    const isOut = h.status === 'Aktif' || h.status === 'Terlambat'
    const depositReturned = isOut || isPending
      ? 0
      : Math.max(0, tool.deposit - lateFee)

    const id = `TRX-${(100000 + i * 137).toString().slice(-6)}`
    return {
      id,
      userName: h.name,
      studentId: h.studentId,
      contact: `${personas[h.toolId] ?? 'kost-' + h.studentId.toLowerCase()}@mail.ac.id`,
      identityVerified: true,
      toolId: tool.id,
      stationId: tool.stationId,
      compartmentId: comp.id,
      accessCode: isOut ? String(200000 + i * 431).slice(0, 6) : '',
      startDate,
      dueDate,
      durationDays: h.durationDays,
      rentalFee,
      deposit: tool.deposit,
      lateFee,
      status: h.status,
      payment: {
        method: h.method,
        rentalFee,
        deposit: tool.deposit,
        total: rentalFee + tool.deposit,
        paidAt: stampISO(-h.dayAgo, h.hour),
        status: !isOut && !isPending && depositReturned > 0 ? 'Dikembalikan' : 'Berhasil',
      },
      returnInfo: isOut
        ? null
        : {
            returnedAt: stampISO(-(h.dayAgo - h.durationDays - lateDays), (h.hour + 5) % 24),
            sensor: i % 2 === 0 ? 'RFID' : 'Sensor berat',
            sensorVerified: true,
            condition: h.condition ?? 'Baik',
            depositRefunded: !isPending && depositReturned > 0,
            depositReturned,
            notes: lateDays > 0
              ? `Terlambat ${lateDays} hari, denda dipotong dari deposit.`
              : isPending
                ? 'Kondisi alat perlu diperiksa manual oleh pengelola.'
                : '',
          },
      createdAt: stampISO(-h.dayAgo, h.hour),
    } satisfies Loan
  })

  loans.push(reservationLoan(compartments))
  return loans
}

export interface SeedState {
  stations: Station[]
  compartments: Compartment[]
  tools: Tool[]
  loans: Loan[]
  notifications: AppNotification[]
}

export function buildSeedNotifications(loans: Loan[], tools: Tool[]): AppNotification[] {
  const nameOf = (id: string) => tools.find((t) => t.id === id)?.name ?? id
  const list: AppNotification[] = []

  for (const l of loans) {
    if (l.status === 'Aktif') {
      list.push({
        id: `NTF-${l.id}-ready`,
        kind: 'siap-diambil',
        title: 'Loker siap dibuka',
        body: `${nameOf(l.toolId)} · kode akses ${l.accessCode}. Ambil sebelum ${l.dueDate}.`,
        createdAt: l.payment?.paidAt ?? l.createdAt,
        loanId: l.id,
        read: true,
      })
    } else if (l.status === 'Terlambat') {
      list.push({
        id: `NTF-${l.id}-late`,
        kind: 'terlambat',
        title: 'Melewati jatuh tempo',
        body: `${nameOf(l.toolId)} belum kembali. Denda berjalan dipotong dari deposit.`,
        createdAt: l.dueDate,
        loanId: l.id,
        read: false,
      })
    } else if (l.status === 'Menunggu verifikasi') {
      list.push({
        id: `NTF-${l.id}-verif`,
        kind: 'deposit-ditahan',
        title: 'Menunggu verifikasi pengelola',
        body: `${nameOf(l.toolId)} perlu diperiksa. Deposit ditahan sementara.`,
        createdAt: l.returnInfo?.returnedAt ?? l.createdAt,
        loanId: l.id,
        read: false,
      })
    } else if (l.status === 'Selesai') {
      const returned = l.returnInfo?.depositReturned ?? 0
      list.push({
        id: `NTF-${l.id}-done`,
        kind: returned > 0 ? 'deposit-kembali' : 'deposit-ditahan',
        title: returned > 0 ? 'Deposit dikembalikan' : 'Deposit dipotong denda',
        body:
          returned > 0
            ? `${nameOf(l.toolId)} kembali tepat waktu. Deposit Rp ${returned.toLocaleString('id-ID')} dikembalikan${l.lateFee > 0 ? ` (denda Rp ${l.lateFee.toLocaleString('id-ID')})` : ''}.`
            : `${nameOf(l.toolId)} kembali dengan catatan. Sebagian deposit ditahan.`,
        createdAt: l.returnInfo?.returnedAt ?? l.createdAt,
        loanId: l.id,
        read: true,
      })
    }
  }

  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function buildSeedState(): SeedState {
  const stations = JSON.parse(JSON.stringify(seedStations)) as Station[]
  const compartments = buildCompartments()
  const tools = buildSeedTools()
  const loans = buildSeedLoans()

  const historyFor = (toolId: string) => tools.find((t) => t.id === toolId)?.history

  for (const loan of loans) {
    const tool = tools.find((t) => t.id === loan.toolId)
    const comp = compartments.find((c) => c.id === loan.compartmentId)
    if (!tool || !comp) continue

    if (loan.returnInfo) {
      const condition = loan.returnInfo.condition || 'Baik'
      historyFor(tool.id)?.push({
        at: loan.returnInfo.returnedAt,
        condition,
        note: loan.returnInfo.notes || 'Pengembalian terverifikasi sensor.',
        source: condition === 'Baik' ? 'sistem' : 'peminjam',
        loanId: loan.id,
      })
    }

    if (loan.status === 'Aktif' || loan.status === 'Terlambat') {
      tool.status = 'Dipinjam'
      comp.status = 'Kosong'
      comp.toolId = null
    } else if (loan.status === 'Menunggu verifikasi') {
      tool.status = 'Tidak tersedia'
      tool.condition = loan.returnInfo?.condition || 'Perlu diperiksa'
      comp.status = 'Perlu diperiksa'
    }
  }

  const notifications = buildSeedNotifications(loans, tools)

  return { stations, compartments, tools, loans, notifications }
}
