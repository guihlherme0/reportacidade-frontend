const usuarioLinks = [
  { id: 'denuncias', label: 'Denúncias', icon: '▦' },
  { id: 'nova-denuncia', label: 'Nova denúncia', icon: '+' },
  { id: 'perfil', label: 'Perfil', icon: '◉' },
]

const prefeituraLinks = [
  { id: 'dashboard', label: 'Dashboard', icon: '↗' },
  { id: 'denuncias', label: 'Denúncias', icon: '▦' },
  { id: 'perfil', label: 'Perfil', icon: '◉' },
]

export default function Layout({ user, page, setPage, onLogout, children }) {
  const links = user?.tipo === 'prefeitura' ? prefeituraLinks : usuarioLinks

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-10 border-b border-nord-4 bg-nord-6/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <button type="button" onClick={() => setPage(user?.tipo === 'prefeitura' ? 'dashboard' : 'denuncias')} className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-nord-10">Reporta Cidade</p>
            <h1 className="text-2xl font-black text-nord-0">Painel de denúncias urbanas</h1>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => setPage(link.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  page === link.id
                    ? 'bg-nord-10 text-white'
                    : 'border border-nord-4 bg-nord-5 text-nord-1 hover:bg-nord-4'
                }`}
              >
                <span className="icon" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </button>
            ))}
            <button type="button" onClick={onLogout} className="btn-secondary py-2">
              <span className="icon" aria-hidden="true">
                ↩
              </span>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-2 rounded-lg border border-nord-4 bg-nord-5 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-nord-3">Conta atual</p>
            <p className="font-bold text-nord-0">{user?.nome || 'Usuário'}</p>
          </div>
          <span className="badge self-start md:self-auto">
            {user?.tipo === 'prefeitura' ? `Prefeitura${user?.cidade ? ` · ${user.cidade}` : ''}` : 'Cidadão'}
          </span>
        </div>
        {children}
      </main>
    </div>
  )
}
