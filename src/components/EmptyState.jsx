export default function EmptyState({ title, description }) {
  return (
    <div className="card p-10 text-center">
      <h3 className="text-lg font-bold text-nord-0">{title}</h3>
      {description ? <p className="mt-2 text-sm text-nord-3">{description}</p> : null}
    </div>
  )
}
