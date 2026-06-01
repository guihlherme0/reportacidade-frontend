import { useEffect, useState } from 'react'
import Alert from '../components/Alert.jsx'
import { Input } from '../components/Field.jsx'
import { api } from '../services/api.js'

export default function PerfilPage({ onUserUpdate }) {
  const [perfil, setPerfil] = useState(null)
  const [form, setForm] = useState({ nome: '', email: '' })
  const [senhaForm, setSenhaForm] = useState({ senha_atual: '', nova_senha: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  async function carregarPerfil() {
    setLoading(true)
    setError('')

    try {
      const data = await api.buscarPerfil()
      setPerfil(data)
      setForm({ nome: data.nome || '', email: data.email || '' })
      onUserUpdate(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPerfil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateSenhaField(field, value) {
    setSenhaForm((current) => ({ ...current, [field]: value }))
  }

  function validatePerfil() {
    if (!form.nome.trim()) return 'Informe o nome da conta.'
    if (!form.email.trim()) return 'Informe o e-mail da conta.'
    return ''
  }

  function validateSenha() {
    if (!senhaForm.senha_atual || !senhaForm.nova_senha) return 'Informe a senha atual e a nova senha.'
    if (senhaForm.nova_senha.length < 6) return 'A nova senha precisa ter pelo menos 6 caracteres.'
    if (senhaForm.senha_atual === senhaForm.nova_senha) return 'A nova senha deve ser diferente da senha atual.'
    return ''
  }

  async function salvarPerfil(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validatePerfil()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      const data = await api.atualizarPerfil({
        nome: form.nome.trim(),
        email: form.email.trim(),
      })
      setPerfil(data)
      onUserUpdate(data)
      setSuccess('Perfil atualizado.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function alterarSenha(event) {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    const validationError = validateSenha()
    if (validationError) {
      setPasswordError(validationError)
      return
    }

    setChangingPassword(true)

    try {
      await api.alterarSenha(senhaForm)
      setSenhaForm({ senha_atual: '', nova_senha: '' })
      setPasswordSuccess('Senha alterada.')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return <div className="card p-8 text-sm font-semibold text-nord-3">Carregando perfil...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-nord-10">Perfil</p>
        <h2 className="mt-2 text-3xl font-black text-nord-0">Dados da conta</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <form onSubmit={salvarPerfil} className="card space-y-4 p-6">
          <h3 className="text-xl font-black text-nord-0">Informações básicas</h3>
          <Input
            label="Nome"
            value={form.nome}
            onChange={(event) => updateField('nome', event.target.value)}
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            required
          />

          {perfil?.tipo === 'prefeitura' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Cidade" value={perfil.cidade || ''} disabled />
              <Input label="Estado" value={perfil.estado || ''} disabled />
            </div>
          ) : null}

          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>

          <button type="submit" disabled={saving} className="btn-primary">
            <span className="icon" aria-hidden="true">
              ✓
            </span>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        <form onSubmit={alterarSenha} className="card space-y-4 p-6">
          <h3 className="text-xl font-black text-nord-0">Alterar senha</h3>
          <Input
            label="Senha atual"
            type="password"
            value={senhaForm.senha_atual}
            onChange={(event) => updateSenhaField('senha_atual', event.target.value)}
            required
          />
          <Input
            label="Nova senha"
            type="password"
            value={senhaForm.nova_senha}
            onChange={(event) => updateSenhaField('nova_senha', event.target.value)}
            minLength={6}
            required
          />

          <Alert type="error">{passwordError}</Alert>
          <Alert type="success">{passwordSuccess}</Alert>

          <button type="submit" disabled={changingPassword} className="btn-secondary">
            <span className="icon" aria-hidden="true">
              ↻
            </span>
            {changingPassword ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
