export default function BarList({ title, items, labelKey }) {
  const max = Math.max(...(items || []).map((item) => item.total), 1)

  return (
    <section className="card p-5">
      <h2 className="text-lg font-black text-nord-0">{title}</h2>
      <div className="mt-5 space-y-4">
        {(items || []).length === 0 ? (
          <p className="text-sm text-nord-3">Nenhum dado disponível.</p>
        ) : (
          items.map((item) => (
            <div key={`${labelKey}-${item[labelKey]}`}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-nord-1">{item[labelKey]}</span>
                <span className="text-nord-3">{item.total}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-nord-4">
                <div
                  className="h-full rounded-full bg-nord-10"
                  style={{ width: `${Math.max((item.total / max) * 100, 6)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}