const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const REQUEST_TIMEOUT = 15000

function getToken() {
  return localStorage.getItem('reporta_token')
}

function createTimeoutController() {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  return { controller, timeoutId }
}

function dispatchUnauthorized() {
  window.dispatchEvent(new CustomEvent('reporta:unauthorized'))
}

async function request(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const hasBody = options.body !== undefined

  const { controller, timeoutId } = createTimeoutController()

  const headers = {
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : null

    if (!response.ok) {
      const message =
        data?.erro ||
        data?.msg ||
        data?.message ||
        'Erro ao conectar com o servidor.'

      if (response.status === 401) {
        dispatchUnauthorized()
      }

      throw Object.assign(new Error(message), {
        status: response.status,
        data,
      })
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('O servidor demorou para responder. Tente novamente.')
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
      )
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function requestBlob(path, options = {}) {
  const token = getToken()
  const { controller, timeoutId } = createTimeoutController()

  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      let message = 'Erro ao carregar arquivo.'
      let data = null

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        data = await response.json()
        message = data?.erro || data?.msg || data?.message || message
      }

      if (response.status === 401) {
        dispatchUnauthorized()
      }

      throw Object.assign(new Error(message), {
        status: response.status,
        data,
      })
    }

    return response.blob()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('O servidor demorou para responder. Tente novamente.')
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
      )
    }

    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function buildQuery(filters) {
  const params = new URLSearchParams()

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value).trim())
    }
  })

  const query = params.toString()

  return query ? `?${query}` : ''
}

export const api = {
  login(tipo, dados) {
    const prefix = tipo === 'prefeitura' ? 'prefeituras' : 'usuarios'

    return request(`/api/auth/${prefix}/login`, {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },

  cadastro(tipo, dados) {
    const prefix = tipo === 'prefeitura' ? 'prefeituras' : 'usuarios'

    return request(`/api/auth/${prefix}/cadastro`, {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },

  eu() {
    return request('/api/auth/eu')
  },

  listarDenuncias(filters = {}) {
    return request(`/api/denuncias/listar${buildQuery(filters)}`)
  },

  async buscarDenuncia(id) {
    try {
      return await request(`/api/denuncias/buscar/${id}`)
    } catch (error) {
      const rotaNaoEncontrada =
        error.status === 404 &&
        String(error.message || '').toLowerCase().includes('rota')

      if (!rotaNaoEncontrada) {
        throw error
      }

      const data = await this.listarDenuncias()
      const denuncia = (data.denuncias || []).find((item) => String(item.id) === String(id))

      if (!denuncia) {
        throw new Error('Denúncia não encontrada.')
      }

      return { denuncia }
    }
  },

  criarDenuncia(dados) {
    const isFormData = dados instanceof FormData

    return request('/api/denuncias/criar', {
      method: 'POST',
      body: isFormData ? dados : JSON.stringify(dados),
    })
  },

  buscarImagemDenuncia(id) {
    return requestBlob(`/api/denuncias/${id}/imagem`)
  },

  atualizarStatus(id, dados) {
    return request(`/api/denuncias/atualizar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    })
  },

  excluirDenuncia(id) {
    return request(`/api/denuncias/excluir/${id}`, {
      method: 'DELETE',
    })
  },

  dashboardResumo() {
    return request('/api/dashboard/resumo')
  },

  dashboardStatus() {
    return request('/api/dashboard/status')
  },

  dashboardCategorias() {
    return request('/api/dashboard/categorias')
  },

  dashboardBairros() {
    return request('/api/dashboard/bairros')
  },

  buscarPerfil() {
    return request('/api/perfil/')
  },

  atualizarPerfil(dados) {
    return request('/api/perfil/atualizar', {
      method: 'PUT',
      body: JSON.stringify(dados),
    })
  },

  alterarSenha(dados) {
    return request('/api/perfil/senha', {
      method: 'PATCH',
      body: JSON.stringify(dados),
    })
  },

  listarPrefeiturasAvaliacao() {
    return request('/api/avaliacoes/prefeituras')
  },

  criarAvaliacao(dados) {
    return request('/api/avaliacoes/criar', {
      method: 'POST',
      body: JSON.stringify(dados),
    })
  },

  minhasAvaliacoes() {
    return request('/api/avaliacoes/minhas')
  },

  avaliacoesMinhaPrefeitura() {
    return request('/api/avaliacoes/minha-prefeitura')
  },

  resumoAvaliacoesMinhaPrefeitura() {
    return request('/api/avaliacoes/minha-prefeitura/resumo')
  },

  resumoAvaliacoesPrefeitura(prefeituraId) {
    return request(`/api/avaliacoes/resumo/${prefeituraId}`)
  },
}
