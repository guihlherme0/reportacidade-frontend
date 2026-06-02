import { useEffect, useState } from 'react'
import Alert from '../components/Alert.jsx'
import BarList from '../components/BarList.jsx'
import StatCard from '../components/StatCard.jsx'
import { api } from '../services/api.js'

export default function DashboardPage() {
  const [resumo, setResumo] = useState(null)
  const [status, setStatus] = useState([])
  const [categorias, setCategorias] = useState([])
  const [bairros, setBairros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function carregarDashboard() {
    setLoading(true)
    setError('')

    try {
      const [resumoData, statusData, categoriasData, bairrosData] = await Promise.all([
        api.dashboardResumo(),
        api.dashboardStatus(),
        api.dashboardCategorias(),
        api.dashboardBairros(),
      ])

      setResumo(resumoData)
      setStatus(statusData)
      setCategorias(categoriasData)
      setBairros(bairrosData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDashboard()
  }, [])

  if (loading) {
    return <div className="card p-8 text-sm font-semibold text-nord-3">Carregando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-nord-10">Dashboard</p>
          <h2 className="mt-2 text-3xl font-black text-nord-0">Resumo das denúncias</h2>
        </div>
        <button type="button" onClick={carregarDashboard} className="btn-secondary self-start md:self-auto">
          <span className="icon" aria-hidden="true">↻</span>
          Atualizar
        </button>
      </div>

      <Alert type="error">{error}</Alert>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={resumo?.total_denuncias} hint="Registros da cidade" />
        <StatCard title="Pendentes" value={resumo?.pendentes} hint="Enviadas ou pendentes" />
        <StatCard title="Em análise" value={resumo?.em_analise} hint="Triagem da prefeitura" />
        <StatCard title="Resolvidas" value={resumo?.resolvidas} hint="Problemas finalizados" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Categoria mais reportada" value={resumo?.categoria_mais_reportada || '-'} />
        <StatCard title="Bairro mais reportado" value={resumo?.bairro_mais_reportado || '-'} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <BarList title="Por status" items={status} labelKey="status" />
        <BarList title="Por categoria" items={categorias} labelKey="categoria" />
        <BarList title="Por bairro" items={bairros} labelKey="bairro" />
      </section>
    </div>
  )
}