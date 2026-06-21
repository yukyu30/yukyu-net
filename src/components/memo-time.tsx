const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

export function formatMemoTime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return dateFormatter.format(d)
}

export function MemoTime({
  iso,
  className
}: {
  iso: string
  className?: string
}) {
  return (
    <time className={className} dateTime={iso}>
      {formatMemoTime(iso)}
    </time>
  )
}
