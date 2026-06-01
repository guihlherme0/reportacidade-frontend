import { useEffect, useState } from 'react'
import Alert from '../components/Alert.jsx'
import { Input, Select, Textarea } from '../components/Field.jsx'
import { api } from '../services/api.js'
import { categoriaOptions } from '../utils/formatters.js'

const emptyForm = {
  tipo_problema: '',
  descricao: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
  ponto_referencia: '',
  foto_filename: '',
}

export default function NovaDenunciaPage({ setPage }) {
  const [form, setForm] = useState(emptyForm)
  const [fotoPreview, setFotoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    }
  }, [fotoPreview])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleFotoChange(event) {
    const file = event.target.files?.[0]

    if (fotoPreview) URL.revokeObjectURL(fotoPreview)

    if (!file) {
      setFotoPreview('')
      updateField('foto_filename', '')
      return
    }

    setFotoPreview(URL.createObjectURL(file))
    updateField('foto_filename', file.name)
  }

  function validateForm() {
    const requiredFields = ['tipo_problema', 'descricao', 'endereco', 'bairro', 'cidade', 'estado']
    const hasEmptyRequired = requiredFields.some((field) => !form[field].trim())

    if (hasEmptyRequired) return 'Preencha todos os campos obrigatórios.'
    if (form.estado.trim().length !== 2) return 'Informe o estado com 2 letras, como CE.'
    if (form.descricao.trim().length < 15) return 'Descreva o problema com pelo menos 15 caracteres.'

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      await api.criarDenuncia({
        ...form,
        tipo_problema: form.tipo_problema.trim(),
        descricao: form.descricao.trim(),
        endereco: form.endereco.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase(),
        ponto_referencia: form.ponto_referencia.trim(),
        foto_filename: form.foto_filename.trim(),
      })
      setSuccess('Denúncia cadastrada com sucesso.')
      setForm(emptyForm)
      setFotoPreview('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-nord-10">Nova denúncia</p>
          <h2 className="mt-2 text-3xl font-black text-nord-0">Cadastrar problema urbano</h2>
        </div>
        <button type="button" onClick={() => setPage('denuncias')} className="btn-secondary self-start md:self-auto">
          Ver denúncias
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 md:grid-cols-2">
        <Select
          label="Tipo de problema"
          value={form.tipo_problema}
          onChange={(event) => updateField('tipo_problema', event.target.value)}
          required
        >
          <option value="">Selecione</option>
          {categoriaOptions.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </Select>
        <Input
          label="Endereço"
          value={form.endereco}
          onChange={(event) => updateField('endereco', event.target.value)}
          placeholder="Rua, número ou local aproximado"
          required
        />
        <Input
          label="Bairro"
          value={form.bairro}
          onChange={(event) => updateField('bairro', event.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Cidade"
            value={form.cidade}
            onChange={(event) => updateField('cidade', event.target.value)}
            required
          />
          <Input
            label="Estado"
            value={form.estado}
            onChange={(event) => updateField('estado', event.target.value.toUpperCase().slice(0, 2))}
            placeholder="CE"
            maxLength={2}
            required
          />
        </div>
        <Input
          label="Ponto de referência"
          value={form.ponto_referencia}
          onChange={(event) => updateField('ponto_referencia', event.target.value)}
          placeholder="Opcional"
        />
        <label className="block">
          <span className="label">Foto</span>
          <input className="field" type="file" accept="image/*" onChange={handleFotoChange} />
          {fotoPreview ? (
            <img
              src={fotoPreview}
              alt="Prévia da denúncia"
              className="mt-3 aspect-video w-full rounded-lg border border-nord-4 object-cover"
            />
          ) : null}
        </label>
        <div className="md:col-span-2">
          <Textarea
            label="Descrição"
            value={form.descricao}
            onChange={(event) => updateField('descricao', event.target.value)}
            placeholder="Descreva o problema com detalhes."
            required
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>
          <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
            <span className="icon" aria-hidden="true">
              +
            </span>
            {loading ? 'Cadastrando...' : 'Cadastrar denúncia'}
          </button>
        </div>
      </form>
    </div>
  )
}
