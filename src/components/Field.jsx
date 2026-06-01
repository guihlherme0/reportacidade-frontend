export function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field" {...props} />
    </label>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field" {...props}>
        {children}
      </select>
    </label>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="field min-h-32 resize-y" {...props} />
    </label>
  )
}
