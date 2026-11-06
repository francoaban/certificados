import { useEffect, useMemo, useState } from 'react'
import FileUploader from './components/FileUploader'
import DataTable from './components/DataTable'
import SettingsPanel from './components/SettingsPanel'
import CertificatePreview from './components/CertificatePreview'
import { readWorkbook, parseSheet, downloadTemplate } from './utils/excelParser'
import { effectiveDocType, validateDocument } from './utils/documents'
import {
  DEFAULT_OPTIONS,
  generateCertificate,
  generateBulkPdf,
  generateZip,
} from './utils/pdfGenerator'
import useInstallPrompt from './hooks/useInstallPrompt'

const STORAGE_KEY = 'certificados:options:v1'

function loadOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...DEFAULT_OPTIONS, ...saved }
  } catch {
    return { ...DEFAULT_OPTIONS }
  }
}

export default function App() {
  const { canInstall, install, online } = useInstallPrompt()
  const [workbook, setWorkbook] = useState(null)
  const [sheetName, setSheetName] = useState('')
  const [records, setRecords] = useState([])
  const [fileName, setFileName] = useState('')
  const [columns, setColumns] = useState(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatingId, setGeneratingId] = useState(null)
  const [options, setOptions] = useState(loadOptions)
  const [selected, setSelected] = useState(new Set())
  const [previewId, setPreviewId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(null)

  // Guarda la configuración (la fecha solo si el usuario la cambió)
  useEffect(() => {
    try {
      const { date, ...rest } = options
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(date === DEFAULT_OPTIONS.date ? rest : options)
      )
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [options])

  const loadSheet = (wb, name) => {
    const result = parseSheet(wb, name)
    setRecords(result.records)
    setColumns(result.columns)
    setUsedFallback(result.usedFallback)
    setSelected(new Set())
    setPreviewId(result.records[0]?.id ?? null)
  }

  const handleFile = async (file) => {
    setLoading(true)
    setError('')
    try {
      const wb = await readWorkbook(file)
      const first = wb.SheetNames[0]
      loadSheet(wb, first)
      setWorkbook(wb)
      setSheetName(first)
      setFileName(file.name)
    } catch (err) {
      setRecords([])
      setWorkbook(null)
      setError(err.message || 'No se pudo leer el archivo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSheetChange = (name) => {
    try {
      loadSheet(workbook, name)
      setSheetName(name)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const updateRecord = (id, patch) =>
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectMany = (ids, checked) =>
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })

  // Documentos inválidos y duplicados
  const { defaultDocType } = options
  const issues = useMemo(() => {
    const map = new Map()
    const counts = new Map()
    const keyOf = (r) => `${effectiveDocType(r, { defaultDocType })}:${r.docNumber}`
    records.forEach((r) => {
      if (r.docNumber) counts.set(keyOf(r), (counts.get(keyOf(r)) || 0) + 1)
    })
    records.forEach((r) => {
      const check = validateDocument(r.docNumber, effectiveDocType(r, { defaultDocType }))
      const duplicate = !!r.docNumber && counts.get(keyOf(r)) > 1
      if (!check.valid || duplicate) {
        map.set(r.id, { invalid: check.valid ? null : check.message, duplicate })
      }
    })
    return map
  }, [records, defaultDocType])

  const invalidCount = [...issues.values()].filter((i) => i.invalid).length
  const duplicateCount = [...issues.values()].filter((i) => i.duplicate).length

  const previewRecord = records.find((r) => r.id === previewId) || records[0] || null

  // Lote = seleccionados; si no hay ninguno, todos
  const batch = selected.size > 0 ? records.filter((r) => selected.has(r.id)) : records
  const batchLabel = selected.size > 0 ? `seleccionados (${batch.length})` : `todos (${batch.length})`

  const handleGenerate = async (record) => {
    setGeneratingId(record.id)
    try {
      await generateCertificate(record, options)
    } finally {
      setGeneratingId(null)
    }
  }

  const runBatch = async (fn) => {
    setBusy(true)
    setError('')
    try {
      await fn()
    } catch (err) {
      setError(err.message || 'Ocurrió un error al generar los certificados.')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const handleZip = () =>
    runBatch(() => generateZip(batch, options, (done, total) => setProgress({ done, total })))
  const handleSinglePdf = () => runBatch(() => generateBulkPdf(batch, options))

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <header className="relative mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            Generador de certificados
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Subí una planilla con nombres y apellidos (documento opcional) y descargá los certificados en PDF.
          </p>
          {canInstall && (
            <button
              onClick={install}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Instalar aplicación
            </button>
          )}
        </header>

        {!online && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            Sin conexión a internet. La aplicación sigue funcionando en este dispositivo.
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] 2xl:gap-8">
          <main className="min-w-0 space-y-5">
            <div className="space-y-2">
              <FileUploader onFile={handleFile} loading={loading} />
              <div className="px-1">
                <button
                  onClick={downloadTemplate}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60 inline-flex items-center gap-1"
                >
                  <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                  <span>Descargar planilla de ejemplo</span>
                </button>
              </div>
            </div>

            <SettingsPanel options={options} onChange={setOptions} />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {usedFallback && records.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No se detectaron encabezados «Nombre» / «Apellido». Se usaron las primeras columnas del
                archivo; revisá que los datos sean correctos.
              </div>
            )}

            {(invalidCount > 0 || duplicateCount > 0) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {invalidCount > 0 && (
                  <span>
                    <strong>{invalidCount}</strong> documento(s) con formato dudoso (en rojo).{' '}
                  </span>
                )}
                {duplicateCount > 0 && (
                  <span>
                    <strong>{duplicateCount}</strong> fila(s) con documento repetido (en ámbar).{' '}
                  </span>
                )}
                Podés corregirlos directo en la tabla; igual se pueden generar.
              </div>
            )}

            {records.length > 0 && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                  <span>
                    <span className="font-semibold">{fileName}</span> · {records.length} registros
                  </span>
                  {workbook && workbook.SheetNames.length > 1 && (
                    <select
                      value={sheetName}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      title="Hoja del archivo"
                    >
                      {workbook.SheetNames.map((n) => (
                        <option key={n} value={n}>
                          Hoja: {n}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {columns && (
                  <p className="text-xs text-slate-400">
                    Columnas: Nombre «{columns.nameKey}»
                    {columns.lastKey ? ` · Apellido «${columns.lastKey}»` : ''}
                    {columns.docKey ? ` · Documento «${columns.docKey}»` : ' · sin columna de documento'}
                    {columns.docTypeKey ? ` · Tipo «${columns.docTypeKey}»` : ''}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleZip}
                    disabled={busy}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    Descargar ZIP · {batchLabel}
                  </button>
                  <button
                    onClick={handleSinglePdf}
                    disabled={busy}
                    className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-wait disabled:opacity-60 inline-flex items-center gap-1"
                  >
                    <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                    <span>Descargar un solo PDF · {batchLabel}</span>
                  </button>
                  {selected.size > 0 && (
                    <button
                      onClick={() => setSelected(new Set())}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Limpiar selección
                    </button>
                  )}
                </div>

                {busy && (
                  <div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: progress ? `${(progress.done / progress.total) * 100}%` : '100%' }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {progress ? `Generando ${progress.done} de ${progress.total}…` : 'Generando archivo…'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DataTable
              records={records}
              options={options}
              issues={issues}
              selected={selected}
              onToggle={toggle}
              onSelectMany={selectMany}
              onUpdate={updateRecord}
              onGenerate={handleGenerate}
              generatingId={generatingId}
              previewId={previewRecord?.id ?? null}
              onPreview={setPreviewId}
            />
          </main>

          <aside className="min-w-0 xl:sticky xl:top-6">
            <CertificatePreview record={previewRecord} options={options} />
          </aside>
        </div>
      </div>
    </div>
  )
}