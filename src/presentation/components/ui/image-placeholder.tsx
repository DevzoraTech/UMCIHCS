export function ImagePlaceholder({ label, portrait = false }: { label: string; portrait?: boolean }) {
  return <div className={`image-placeholder ${portrait ? "portrait-placeholder" : ""}`} role="img" aria-label={`${label} — photograph to be added`}><svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><rect x="14" y="14" width="52" height="52" rx="2" stroke="currentColor" /><circle cx="31" cy="31" r="5" stroke="currentColor" /><path d="m14 55 16-16 12 12 9-8 15 15" stroke="currentColor" /></svg><span>{label}</span><small>Photography coming soon</small></div>;
}
