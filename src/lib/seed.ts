import type { Compartment, Station, Tool } from './types'

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
    } satisfies Tool
  })
}
