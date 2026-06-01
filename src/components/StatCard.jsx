export default function StatCard({ title, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-nord-3">{title}</p>
      <strong className="mt-2 block text-3xl font-black text-nord-0">{value ?? 0}</strong>
      {hint ? <p className="mt-2 text-sm text-nord-3">{hint}</p> : null}
    </div>
  )
}
