import { useEffect, useMemo, useState } from 'react'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import StatCard from '../components/StatCard.jsx'
import { Select, Textarea } from '../components/Field.jsx'
import { api } from '../services/api.js'
import { formatDate } from '../utils/formatters.js'

const emptyForm = {
  prefeitura_id: '',
  nota: '10',
  comentario: '',
}

function prefeituraLabel(prefeitura) {
  if (!prefeitura) return '-'

  const local = [prefeitura.cidade, prefeitura.estado].filter(Boolean).join(' - ')
  return local ? `${prefeitura.nome} · ${local}` : prefeitura.nome
}

function NotaBadge({ nota }) {
  return (
    <span className="badge border-nord-13 bg-nord-13/25 text-nord-1">
      Nota {nota}/10
    </span>
  )
}

export default function AvaliacoesPage({ user }) {
  if (user?.tipo === 'prefeitura') {
    return <AvaliacoesPrefeitura />
  }

  return <AvaliacoesCidadao />
}

function AvaliacoesCidadao() {
  const [prefeituras, setPrefeituras] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [resumo, setResumo] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const avaliacaoAtual = useMemo(
    () => avaliacoes.find((avaliacao) => String(avaliacao.prefeitura_id) === String(form.prefeitura_id)),
    [avaliacoes, form.prefeitura_id],
  )

  async function carregarDados() {
    setLoading(true)
    setError('')

    try {
      const [prefeiturasData, minhasData] = await Promise.all([
        api.listarPrefeiturasAvaliacao(),
        api.minhasAvaliacoes(),
      ])

      const listaPrefeituras = prefeiturasData.prefeituras || []
      const listaAvaliacoes = minhasData.avaliacoes || []

      setPrefeituras(listaPrefeituras)
      setAvaliacoes(listaAvaliacoes)

      const primeiraPrefeituraId = listaPrefeituras[0]?.id ? String(listaPrefeituras[0].id) : ''

      if (primeiraPrefeituraId) {
        selecionarPrefeitura(primeiraPrefeituraId, listaAvaliacoes)
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar avaliações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function carregarResumo(prefeituraId) {
    if (!prefeituraId) {
      setResumo(null)
      return
    }

    try {
      const data = await api.resumoAvaliacoesPrefeitura(prefeituraId)
      setResumo(data)
    } catch {
      setResumo(null)
    }
  }

  function selecionarPrefeitura(prefeituraId, baseAvaliacoes = avaliacoes) {
    const avaliacaoExistente = baseAvaliacoes.find(
      (avaliacao) => String(avaliacao.prefeitura_id) === String(prefeituraId),
    )

    setForm({
      prefeitura_id: prefeituraId,
      nota: avaliacaoExistente ? String(avaliacaoExistente.nota) : '10',
      comentario: avaliacaoExistente?.comentario || '',
    })

    carregarResumo(prefeituraId)
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validar() {
    if (!form.prefeitura_id) return 'Selecione uma prefeitura.'

    const nota = Number(form.nota)

    if (!Number.isInteger(nota) || nota < 0 || nota > 10) {
      return 'A nota deve ser um número inteiro de 0 a 10.'
    }

    if (form.comentario.trim().length > 1000) {
      return 'O comentário deve ter no máximo 1000 caracteres.'
    }

    return ''
  }

  async function enviarAvaliacao(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validar()

    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      const data = await api.criarAvaliacao({
        prefeitura_id: Number(form.prefeitura_id),
        nota: Number(form.nota),
        comentario: form.comentario.trim(),
      })

      setSuccess(data.mensagem || 'Avaliação salva com sucesso.')

      const minhasData = await api.minhasAvaliacoes()
      setAvaliacoes(minhasData.avaliacoes || [])
      await carregarResumo(form.prefeitura_id)
    } catch (err) {
      setError(err.message || 'Erro ao salvar avaliação.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card p-8 text-sm font-semibold text-nord-3">Carregando avaliações...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-nord-10">Avaliações</p>
          <h2 className="mt-2 text-3xl font-black text-nord-0">Avaliar prefeitura</h2>
        </div>
      </div>

      <Alert type="error">{error}</Alert>
      <Alert type="success">{success}</Alert>

      {prefeituras.length === 0 ? (
        <EmptyState title="Nenhuma prefeitura cadastrada" description="Cadastre uma prefeitura para permitir avaliações." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <form onSubmit={enviarAvaliacao} className="card space-y-4 p-6">
            <div>
              <h3 className="text-xl font-black text-nord-0">Sua avaliação</h3>
              <p className="mt-1 text-sm text-nord-3">
                Cada cidadão pode manter uma avaliação por prefeitura. Enviar novamente atualiza a nota e o comentário.
              </p>
            </div>

            <Select
              label="Prefeitura"
              value={form.prefeitura_id}
              onChange={(event) => selecionarPrefeitura(event.target.value)}
              required
            >
              <option value="">Selecione</option>
              {prefeituras.map((prefeitura) => (
                <option key={prefeitura.id} value={prefeitura.id}>
                  {prefeituraLabel(prefeitura)}
                </option>
              ))}
            </Select>

            <Select
              label="Nota"
              value={form.nota}
              onChange={(event) => updateField('nota', event.target.value)}
              required
            >
              {Array.from({ length: 11 }, (_, index) => (
                <option key={index} value={index}>
                  {index}
                </option>
              ))}
            </Select>

            <Textarea
              label="Comentário"
              value={form.comentario}
              onChange={(event) => updateField('comentario', event.target.value)}
              maxLength={1000}
              placeholder="Explique sua avaliação. Esse campo é opcional."
            />

            {avaliacaoAtual ? (
              <Alert type="info">
                Você já avaliou esta prefeitura. Ao salvar, sua avaliação anterior será atualizada.
              </Alert>
            ) : null}

            <button type="submit" disabled={saving} className="btn-primary">
              <span className="icon" aria-hidden="true">★</span>
              {saving ? 'Salvando...' : 'Salvar avaliação'}
            </button>
          </form>

          <aside className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard title="Média da prefeitura" value={resumo ? `${resumo.media_nota}/10` : '-'} />
              <StatCard title="Total de avaliações" value={resumo?.total_avaliacoes ?? 0} />
            </div>

            <section className="card p-6">
              <h3 className="text-xl font-black text-nord-0">Minhas avaliações</h3>

              {avaliacoes.length === 0 ? (
                <p className="mt-3 text-sm text-nord-3">Você ainda não avaliou nenhuma prefeitura.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {avaliacoes.map((avaliacao) => (
                    <article key={avaliacao.id} className="rounded-lg border border-nord-4 bg-nord-6 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-nord-0">{avaliacao.prefeitura_nome}</p>
                          <p className="text-xs text-nord-3">
                            {avaliacao.prefeitura_cidade} - {avaliacao.prefeitura_estado} · {formatDate(avaliacao.data)}
                          </p>
                        </div>
                        <NotaBadge nota={avaliacao.nota} />
                      </div>

                      {avaliacao.comentario ? (
                        <p className="mt-3 text-sm leading-6 text-nord-1">{avaliacao.comentario}</p>
                      ) : (
                        <p className="mt-3 text-sm text-nord-3">Sem comentário.</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}

function AvaliacoesPrefeitura() {
  const [resumo, setResumo] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function carregarAvaliacoes() {
    setLoading(true)
    setError('')

    try {
      const [resumoData, avaliacoesData] = await Promise.all([
        api.resumoAvaliacoesMinhaPrefeitura(),
        api.avaliacoesMinhaPrefeitura(),
      ])

      setResumo(resumoData)
      setAvaliacoes(avaliacoesData.avaliacoes || [])
    } catch (err) {
      setError(err.message || 'Erro ao carregar avaliações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarAvaliacoes()
  }, [])

  if (loading) {
    return <div className="card p-8 text-sm font-semibold text-nord-3">Carregando avaliações...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-nord-10">Avaliações</p>
          <h2 className="mt-2 text-3xl font-black text-nord-0">Opinião dos cidadãos</h2>
        </div>

        <button type="button" onClick={carregarAvaliacoes} className="btn-secondary self-start md:self-auto">
          <span className="icon" aria-hidden="true">↻</span>
          Atualizar
        </button>
      </div>

      <Alert type="error">{error}</Alert>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Média geral" value={`${resumo?.media_nota ?? 0}/10`} hint="Nota média recebida" />
        <StatCard title="Total de avaliações" value={resumo?.total_avaliacoes ?? 0} hint="Cidadãos que avaliaram" />
        <StatCard title="Cidade" value={resumo?.prefeitura?.cidade || '-'} hint={resumo?.prefeitura?.estado || ''} />
      </section>

      <section className="card p-6">
        <h3 className="text-xl font-black text-nord-0">Comentários recebidos</h3>

        {avaliacoes.length === 0 ? (
          <p className="mt-3 text-sm text-nord-3">Sua prefeitura ainda não recebeu avaliações.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {avaliacoes.map((avaliacao) => (
              <article key={avaliacao.id} className="rounded-lg border border-nord-4 bg-nord-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-nord-0">{avaliacao.usuario_nome || 'Cidadão'}</p>
                    <p className="text-xs text-nord-3">{formatDate(avaliacao.data)}</p>
                  </div>
                  <NotaBadge nota={avaliacao.nota} />
                </div>

                {avaliacao.comentario ? (
                  <p className="mt-3 text-sm leading-6 text-nord-1">{avaliacao.comentario}</p>
                ) : (
                  <p className="mt-3 text-sm text-nord-3">Sem comentário.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
