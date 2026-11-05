import { useEffect, useRef, useState } from 'react'
import { buildPreviewUrl } from '../utils/pdfGenerator'
import { resolveRecord } from '../utils/records'

export default function CertificatePreview({ record, options }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const lastUrl = useRef(null)

  useEffect(() => {
    if (!record) {
      setUrl(null)
      return
    }
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const next = await buildPreviewUrl(record, options)
        if (cancelled) {
          URL.revokeObjectURL(next)
          return
        }
        if (lastUrl.current) URL.revokeObjectURL(lastUrl.current)
        lastUrl.current = next
        setUrl(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [record, options])

  useEffect(
    () => () => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current)
    },
    []
  )

  const name = record ? resolveRecord(record, options).fullName : ''

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-700">Vista previa</h2>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Abrir en otra pestaña
          </a>
        )}
      </div>

      <div className="relative mx-auto aspect-[297/210] w-full max-w-[60dvh] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {url ? (
          <iframe
            title="Vista previa del certificado"
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
            Cargá un archivo para ver cómo queda el certificado.
          </div>
        )}
        {loading && (
          <div className="absolute right-2 top-2 h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        )}
      </div>

      {name && <p className="mt-2 truncate text-xs text-slate-500">Mostrando: {name}</p>}
    </div>
  )
}