export default function Alert({ type = 'info', children }) {
  if (!children) return null

  const styles = {
    info: 'border-nord-8 bg-nord-8/10 text-nord-1',
    success: 'border-nord-14 bg-nord-14/10 text-nord-1',
    error: 'border-nord-11 bg-nord-11/10 text-nord-1',
    warning: 'border-nord-13 bg-nord-13/20 text-nord-1',
  }

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      {children}
    </div>
  )
}