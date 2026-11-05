import { useState } from 'react'
import { DEFAULT_OPTIONS } from '../utils/pdfGenerator'
import { DOC_TYPES, DOC_TYPE_IDS } from '../utils/documents'
import { CASE_MODES } from '../utils/text'
import { FILENAME_FORMATS } from '../utils/records'
import LogoPicker from './LogoPicker'

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  )
}

export default function SettingsPanel({ options, onChange }) {
  const [open, setOpen] = useState(false)
  const set = (key) => (e) => onChange({ ...options, [key]: e.target.value })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-700">Textos y formato</span>
        <span className="text-xs text-slate-400">{open ? 'Ocultar ▲' : 'Editar ▼'}</span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 px-5 py-5">
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Textos</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título">
                <input className={inputClass} value={options.title} onChange={set('title')} />
              </Field>
              <Field label="Subtítulo">
                <input className={inputClass} value={options.subtitle} onChange={set('subtitle')} />
              </Field>
            </div>
            <Field label="Texto previo al nombre">
              <input className={inputClass} value={options.preText} onChange={set('preText')} />
            </Field>
            <Field label="Texto del cuerpo">
              <textarea rows={3} className={inputClass} value={options.bodyText} onChange={set('bodyText')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Fecha">
                <input className={inputClass} value={options.date} onChange={set('date')} />
              </Field>
              <Field label="Firma izquierda">
                <input className={inputClass} value={options.signatureLeft} onChange={set('signatureLeft')} />
              </Field>
              <Field label="Firma derecha">
                <input className={inputClass} value={options.signatureRight} onChange={set('signatureRight')} />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Datos</h3>

            <Field label="Nombre y apellido">
              <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
                {CASE_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onChange({ ...options, caseMode: m.id })}
                    className={`px-3 py-1.5 text-xs font-semibold transition ${
                      options.caseMode === m.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo de documento por defecto">
                <select className={inputClass} value={options.defaultDocType} onChange={set('defaultDocType')}>
                  <option value="auto">Automático (según el número)</option>
                  {DOC_TYPE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {DOC_TYPES[id].label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nombre de los archivos">
                <select className={inputClass} value={options.fileNameFormat} onChange={set('fileNameFormat')}>
                  {FILENAME_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={options.docDots}
                onChange={(e) => onChange({ ...options, docDots: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Mostrar el documento con puntos (12.345.678)
            </label>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Escudo / logo</h3>
            <LogoPicker options={options} onChange={onChange} />
          </section>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              onClick={() => onChange({ ...DEFAULT_OPTIONS })}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Restaurar valores por defecto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}