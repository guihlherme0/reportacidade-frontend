export function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function statusLabel(status) {
  const labels = {
    ENVIADA: 'Enviada',
    PENDENTE: 'Pendente',
    EM_ANALISE: 'Em análise',
    EM_ANDAMENTO: 'Em andamento',
    RESOLVIDA: 'Resolvida',
    REJEITADA: 'Rejeitada',
    CANCELADA: 'Cancelada',
  }

  return labels[status] || status || '-'
}

export function statusClass(status) {
  const styles = {
    ENVIADA: 'border-nord-8 bg-nord-8/15 text-nord-1',
    PENDENTE: 'border-nord-13 bg-nord-13/25 text-nord-1',
    EM_ANALISE: 'border-nord-10 bg-nord-10/15 text-nord-1',
    EM_ANDAMENTO: 'border-nord-15 bg-nord-15/15 text-nord-1',
    RESOLVIDA: 'border-nord-14 bg-nord-14/20 text-nord-1',
    REJEITADA: 'border-nord-11 bg-nord-11/15 text-nord-1',
    CANCELADA: 'border-nord-3 bg-nord-3/10 text-nord-1',
  }

  return styles[status] || 'border-nord-4 bg-nord-5 text-nord-1'
}

export const statusOptions = [
  'ENVIADA',
  'PENDENTE',
  'EM_ANALISE',
  'EM_ANDAMENTO',
  'RESOLVIDA',
  'REJEITADA',
]

export const statusAlteracaoOptions = [
  'EM_ANALISE',
  'EM_ANDAMENTO',
  'RESOLVIDA',
  'REJEITADA',
]

export const categoriaOptions = [
  'Buraco',
  'Iluminação',
  'Lixo',
  'Água e esgoto',
  'Sinalização',
  'Calçada',
  'Árvore',
  'Outro',
]
