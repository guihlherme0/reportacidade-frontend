import { useEffect, useState } from 'react'
import Layout from './components/Layout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AvaliacoesPage from './pages/AvaliacoesPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DetalhesDenuncia from './pages/DetalhesDenuncia.jsx'
import DenunciasPage from './pages/DenunciasPage.jsx'
import NovaDenunciaPage from './pages/NovaDenunciaPage.jsx'
import PerfilPage from './pages/PerfilPage.jsx'
import { api } from './services/api.js'

const pagePaths = {
  dashboard: '/dashboard',
  denuncias: '/denuncias',
  'nova-denuncia': '/nova-denuncia',
  perfil: '/perfil',
  avaliacoes: '/avaliacoes',
}

function parseStoredUser() {
  try {
    const value = localStorage.getItem('reporta_user')
    return value ? JSON.parse(value) : null
  } catch {
    localStorage.removeItem('reporta_user')
    return null
  }
}

function getPageFromPath(user) {
  if (/^\/denuncias\/[^/]+$/.test(window.location.pathname)) {
    return 'detalhes-denuncia'
  }

  const page = Object.entries(pagePaths).find(([, path]) => path === window.location.pathname)?.[0]

  if (page) return page
  return user?.tipo === 'prefeitura' ? 'dashboard' : 'denuncias'
}

function getDenunciaIdFromPath() {
  const match = window.location.pathname.match(/^\/denuncias\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('reporta_token'))
  const [user, setUser] = useState(() => parseStoredUser())
  const [page, setPageState] = useState(() => getPageFromPath(parseStoredUser()))
  const [denunciaId, setDenunciaId] = useState(() => getDenunciaIdFromPath())
  const [checkingSession, setCheckingSession] = useState(Boolean(token))

  useEffect(() => {
    async function validarSessao() {
      if (!token) {
        setCheckingSession(false)
        return
      }

      try {
        const data = await api.eu()
        saveUser(data.usuario)
      } catch {
        logout()
      } finally {
        setCheckingSession(false)
      }
    }

    validarSessao()
  }, [])

  useEffect(() => {
    function syncRoute() {
      setPageState(getPageFromPath(user))
      setDenunciaId(getDenunciaIdFromPath())
    }

    function handleUnauthorized() {
      logout()
    }

    window.addEventListener('popstate', syncRoute)
    window.addEventListener('reporta:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('reporta:unauthorized', handleUnauthorized)
    }
    
  }, [user?.tipo])

  useEffect(() => {
    if (!user) return

    if (user.tipo === 'usuario' && page === 'dashboard') {
      setPage('denuncias', { replace: true })
    }

    if (user.tipo === 'prefeitura' && page === 'nova-denuncia') {
      setPage('dashboard', { replace: true })
    }
    
  }, [page, user?.tipo])

  function saveUser(nextUser) {
    setUser(nextUser)
    localStorage.setItem('reporta_user', JSON.stringify(nextUser))
  }

  function setPage(nextPage, { replace = false, denunciaId: nextDenunciaId = null } = {}) {
    setPageState(nextPage)
    setDenunciaId(nextPage === 'detalhes-denuncia' ? nextDenunciaId : null)
    const path =
      nextPage === 'detalhes-denuncia' && nextDenunciaId
        ? `/denuncias/${encodeURIComponent(nextDenunciaId)}`
        : pagePaths[nextPage] || pagePaths.denuncias

    if (window.location.pathname !== path) {
      const action = replace ? 'replaceState' : 'pushState'
      window.history[action]({}, '', path)
    }
  }

  function handleAuth(nextToken, nextUser) {
    localStorage.setItem('reporta_token', nextToken)
    localStorage.setItem('reporta_user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
    setPage(nextUser?.tipo === 'prefeitura' ? 'dashboard' : 'denuncias', { replace: true })
  }

  function logout() {
    localStorage.removeItem('reporta_token')
    localStorage.removeItem('reporta_user')
    setToken(null)
    setUser(null)
    setPage('denuncias', { replace: true })
  }

  if (checkingSession) {
    return (
      <div className="page-shell flex items-center justify-center px-4">
        <div className="card p-8 text-sm font-semibold text-nord-3">Verificando sessão...</div>
      </div>
    )
  }

  if (!token || !user) {
    return <AuthPage onAuth={handleAuth} />
  }

  let content = null

  if (page === 'dashboard') {
    content = user.tipo === 'prefeitura' ? <DashboardPage /> : <DenunciasPage user={user} navigateToPage={setPage} />
  }

  if (page === 'denuncias') {
    content = <DenunciasPage user={user} navigateToPage={setPage} />
  }

  if (page === 'detalhes-denuncia') {
    content = denunciaId ? (
      <DetalhesDenuncia id={denunciaId} onBack={() => setPage('denuncias')} />
    ) : (
      <DenunciasPage user={user} navigateToPage={setPage} />
    )
  }

  if (page === 'nova-denuncia') {
    content = user.tipo === 'usuario' ? <NovaDenunciaPage setPage={setPage} /> : <DashboardPage />
  }

  if (page === 'perfil') {
    content = <PerfilPage onUserUpdate={saveUser} />
  }

  if (page === 'avaliacoes') {
    content = <AvaliacoesPage user={user} />
  }

  return (
    <Layout user={user} page={page === 'detalhes-denuncia' ? 'denuncias' : page} setPage={setPage} onLogout={logout}>
      {content}
    </Layout>
  )
}
