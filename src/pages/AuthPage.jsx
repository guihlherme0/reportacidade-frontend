import { useState } from 'react'
import Alert from '../components/Alert.jsx'
import { Input, Select } from '../components/Field.jsx'
import { api } from '../services/api.js'

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  estado: '',
  cidade: '',
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [tipo, setTipo] = useState('usuario')
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCadastro = mode === 'cadastro'
  const isPrefeitura = tipo === 'prefeitura'

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isCadastro) {
        const payload = {
          nome: form.nome,
          email: form.email,
          senha: form.senha,
        }

        if (isPrefeitura) {
          payload.estado = form.estado
          payload.cidade = form.cidade
        }

        await api.cadastro(tipo, payload)
        setSuccess('Cadastro criado. Faça login para continuar.')
        setMode('login')
        setForm((current) => ({ ...emptyForm, email: current.email }))
        return
      }

      const data = await api.login(tipo, {
        email: form.email,
        senha: form.senha,
      })

      onAuth(data.access_token, data.usuario)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <span className="badge">Frontend React + Vite + Tailwind</span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-nord-10">Reporta Cidade</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-nord-0 md:text-6xl">
              Registre e acompanhe problemas urbanos.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-nord-3">
            Interface simples para cidadãos enviarem denúncias e para prefeituras acompanharem status,
            categorias e bairros com maior número de registros.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Denúncias', 'Dashboard', 'Perfil'].map((item) => (
              <div key={item} className="rounded-lg border border-nord-4 bg-nord-5 p-4">
                <p className="font-bold text-nord-1">{item}</p>
                <p className="mt-1 text-sm text-nord-3">Módulo integrado ao backend Flask.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6 md:p-8">
          <div className="mb-6 flex rounded-lg bg-nord-5 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-bold ${mode === 'login' ? 'bg-white text-nord-0 shadow' : 'text-nord-3'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('cadastro')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-bold ${mode === 'cadastro' ? 'bg-white text-nord-0 shadow' : 'text-nord-3'}`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Select label="Tipo de conta" value={tipo} onChange={(event) => setTipo(event.target.value)}>
              <option value="usuario">Cidadão</option>
              <option value="prefeitura">Prefeitura</option>
            </Select>

            {isCadastro ? (
              <Input
                label="Nome"
                value={form.nome}
                onChange={(event) => updateField('nome', event.target.value)}
                placeholder="Seu nome ou nome da prefeitura"
                required
              />
            ) : null}

            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="email@exemplo.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={form.senha}
              onChange={(event) => updateField('senha', event.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />

            {isCadastro && isPrefeitura ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Estado"
                  value={form.estado}
                  onChange={(event) => updateField('estado', event.target.value.toUpperCase().slice(0, 2))}
                  placeholder="CE"
                  maxLength={2}
                  required
                />
                <Input
                  label="Cidade"
                  value={form.cidade}
                  onChange={(event) => updateField('cidade', event.target.value)}
                  placeholder="Quixadá"
                  required
                />
              </div>
            ) : null}

            <Alert type="error">{error}</Alert>
            <Alert type="success">{success}</Alert>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <span className="icon" aria-hidden="true">
                {isCadastro ? '+' : '→'}
              </span>
              {loading ? 'Enviando...' : isCadastro ? 'Criar conta' : 'Entrar'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}