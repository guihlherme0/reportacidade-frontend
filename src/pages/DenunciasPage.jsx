import { useEffect, useMemo, useState } from 'react'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { Input, Select } from '../components/Field.jsx'
import { api } from '../services/api.js'
import { categoriaOptions, formatDate, statusClass, statusLabel, statusOptions } from '../utils/formatters.js'

const emptyFilters = {
  busca: '',
  cidade: '',
  status: '',
  categoria: '',
  bairro: '',
  ordenacao: 'recentes',
}

const pageSize = 6

export default function DenunciasPage({ user }) {
  const [denuncias, setDenuncias] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const serverFilters = useMemo(
    () => ({
      cidade: filters.cidade,
      status: filters.status,
      categoria: filters.categoria,
      bairro: filters.bairro,
    }),
    [filters.bairro, filters.categoria, filters.cidade, filters.status],
  )

  const denunciasFiltradas = useMemo(() => {
    const termo = filters.busca.trim().toLowerCase()
    const result = termo
      ? denuncias.filter((denuncia) =>
          [
            denuncia.id,
            denuncia.tipo_problema,
            denuncia.endereco,
            denuncia.descricao,
            denuncia.bairro,
            denuncia.cidade,
            denuncia.ponto_referencia,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(termo)),
        )
      : [...denuncias]

    return result.sort((a, b) => {
      if (filters.ordenacao === 'antigas') return new Date(a.data || 0) - new Date(b.data || 0)
      if (filters.ordenacao === 'status') return statusLabel(a.status).localeCompare(statusLabel(b.status), 'pt-BR')
      return new Date(b.data || 0) - new Date(a.data || 0)
    })
  }, [denuncias, filters.busca, filters.ordenacao])

  const totalPages = Math.max(Math.ceil(denunciasFiltradas.length / pageSize), 1)
  const visibleDenuncias = denunciasFiltradas.slice((page - 1) * pageSize, page * pageSize)

  async function carregarDenuncias(customFilters = serverFilters) {
    setLoading(true)
    setError('')

    try {
      const data = await api.listarDenuncias(customFilters)
      setDenuncias(data.denuncias || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialFilters = user?.tipo === 'prefeitura' && user?.cidade ? { ...emptyFilters, cidade: user.cidade } : emptyFilters
    setFilters(initialFilters)
    carregarDenuncias({
      cidade: initialFilters.cidade,
      status: initialFilters.status,
      categoria: initialFilters.categoria,
      bairro: initialFilters.bairro,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.tipo, user?.cidade])

  useEffect(() => {
    setPage(1)
  }, [filters.busca, filters.ordenacao, denuncias.length])

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  async function handleFilter(event) {
    event.preventDefault()
    await carregarDenuncias(serverFilters)
  }

  async function limparFiltros() {
    const nextFilters = user?.tipo === 'prefeitura' && user?.cidade ? { ...emptyFilters, cidade: user.cidade } : emptyFilters
    setFilters(nextFilters)
    await carregarDenuncias({
      cidade: nextFilters.cidade,
      status: nextFilters.status,
      categoria: nextFilters.categoria,
      bairro: nextFilters.bairro,
    })
  }

  async function alterarStatus(denuncia, status) {
    setUpdatingId(denuncia.id)
    setError('')
    setSuccess('')

    try {
      await api.atualizarStatus(denuncia.id, { status })
      setSuccess(`Status da denúncia #${denuncia.id} atualizado.`)
      await carregarDenuncias(serverFilters)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  async function excluirDenuncia(denuncia) {
    setUpdatingId(denuncia.id)
    setError('')
    setSuccess('')

    try {
      await api.excluirDenuncia(denuncia.id)
      setSuccess(`Denúncia #${denuncia.id} excluída.`)
      setPendingDelete(null)
      await carregarDenuncias(serverFilters)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-nord-10">Denúncias</p>
        <h2 className="mt-2 text-3xl font-black text-nord-0">Registros cadastrados</h2>
      </div>

      <form onSubmit={handleFilter} className="card grid gap-4 p-5 md:grid-cols-6 md:items-end">
        <Input
          label="Busca"
          value={filters.busca}
          onChange={(event) => updateFilter('busca', event.target.value)}
          placeholder="ID, endereço, descrição..."
        />
        <Input
          label="Cidade"
          value={filters.cidade}
          onChange={(event) => updateFilter('cidade', event.target.value)}
          placeholder="Ex: Quixadá"
        />
        <Select label="Status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
          <option value="">Todos</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </Select>
        <Select
          label="Categoria"
          value={filters.categoria}
          onChange={(event) => updateFilter('categoria', event.target.value)}
        >
          <option value="">Todas</option>
          {categoriaOptions.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </Select>
        <Input
          label="Bairro"
          value={filters.bairro}
          onChange={(event) => updateFilter('bairro', event.target.value)}
          placeholder="Ex: Centro"
        />
        <Select label="Ordenar" value={filters.ordenacao} onChange={(event) => updateFilter('ordenacao', event.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="antigas">Mais antigas</option>
          <option value="status">Status</option>
        </Select>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">
            <span className="icon" aria-hidden="true">
              ↻
            </span>
            Filtrar
          </button>
          <button type="button" onClick={limparFiltros} className="btn-secondary flex-1">
            Limpar
          </button>
        </div>
      </form>

      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>

      {loading ? (
        <LoadingList />
      ) : denunciasFiltradas.length === 0 ? (
        <EmptyState title="Nenhuma denúncia encontrada" description="Ajuste os filtros ou cadastre uma nova denúncia." />
      ) : (
        <>
          <div className="flex flex-col gap-2 text-sm text-nord-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Exibindo {visibleDenuncias.length} de {denunciasFiltradas.length} denúncia(s).
            </p>
            <p>
              Página {page} de {totalPages}
            </p>
          </div>

          <div className="grid gap-4">
          {visibleDenuncias.map((denuncia) => (
            <article key={denuncia.id} className="card p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge">#{denuncia.id}</span>
                    <span className={`badge ${statusClass(denuncia.status)}`}>{statusLabel(denuncia.status)}</span>
                    <span className="badge">{denuncia.tipo_problema}</span>
                  </div>
                  <h3 className="text-xl font-black text-nord-0">{denuncia.endereco}</h3>
                  <p className="max-w-3xl text-sm leading-6 text-nord-3">{denuncia.descricao}</p>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Info label="Bairro" value={denuncia.bairro} />
                    <Info label="Cidade" value={`${denuncia.cidade} - ${denuncia.estado}`} />
                    <Info label="Referência" value={denuncia.ponto_referencia || '-'} />
                    <Info label="Data" value={formatDate(denuncia.data)} />
                  </dl>
                </div>

                <div className="flex min-w-52 flex-col gap-2">
                  {user?.tipo === 'prefeitura' ? (
                    <Select
                      label="Alterar status"
                      value={denuncia.status}
                      disabled={updatingId === denuncia.id}
                      onChange={(event) => alterarStatus(denuncia, event.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </Select>
                  ) : null}

                  {user?.tipo === 'usuario' && denuncia.usuario_id === user.id ? (
                    <button
                      type="button"
                      disabled={updatingId === denuncia.id}
                      onClick={() => setPendingDelete(denuncia)}
                      className="rounded-lg border border-nord-11 bg-nord-11/10 px-4 py-3 text-sm font-bold text-nord-11 transition hover:bg-nord-11 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Excluir
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="btn-secondary">
              Anterior
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="btn-secondary"
            >
              Próxima
            </button>
          </div>
        </>
      )}

      <DeleteModal
        denuncia={pendingDelete}
        loading={updatingId === pendingDelete?.id}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => excluirDenuncia(pendingDelete)}
      />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="font-semibold text-nord-3">{label}</dt>
      <dd className="mt-1 font-bold text-nord-1">{value}</dd>
    </div>
  )
}

function LoadingList() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="card animate-pulse p-5">
          <div className="h-4 w-40 rounded bg-nord-4" />
          <div className="mt-4 h-5 w-2/3 rounded bg-nord-4" />
          <div className="mt-3 h-4 w-full max-w-3xl rounded bg-nord-5" />
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="h-10 rounded bg-nord-5" />
            <div className="h-10 rounded bg-nord-5" />
            <div className="h-10 rounded bg-nord-5" />
            <div className="h-10 rounded bg-nord-5" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DeleteModal({ denuncia, loading, onCancel, onConfirm }) {
  if (!denuncia) return null

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-nord-0/40 px-4">
      <div className="card max-w-md p-6 shadow-xl">
        <h3 className="text-xl font-black text-nord-0">Excluir denúncia #{denuncia.id}</h3>
        <p className="mt-3 text-sm leading-6 text-nord-3">
          Essa ação remove o registro da sua lista. Confirme somente se a denúncia foi criada por engano.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-nord-11 bg-nord-11 px-4 py-3 text-sm font-bold text-white transition hover:bg-nord-11/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
