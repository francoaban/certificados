import { useState } from 'react'
import { DEFAULT_OPTIONS } from '../utils/pdfGenerator'
import { CERTIFICATE_STYLES } from '../certificates/styles/index'
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

function OptionalLocationField({ label, checked, value, onToggle, onChange, placeholder }) {
  const isEnabled = checked ?? true

  return (
    <div className={`rounded-xl border p-3 transition ${isEnabled ? 'border-indigo-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
      <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={onToggle}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
        />
      </label>
      <Field label="Detalle">
        <input
          className={`${inputClass} ${!isEnabled ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={!isEnabled}
        />
      </Field>
    </div>
  )
}

export default function SettingsPanel({ options, onChange }) {
  const [openText, setOpenText] = useState(false)
  const [openStyle, setOpenStyle] = useState(false)
  const set = (key) => (e) => onChange({ ...options, [key]: e.target.value })
  const setChecked = (key) => (e) => onChange({ ...options, [key]: e.target.checked })

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => setOpenText(!openText)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-sm font-semibold text-slate-700">Editar Textos del Certificado</span>
          <span className="text-xs text-slate-400">{openText ? 'Ocultar ▲' : 'Editar ▼'}</span>
        </button>

        {openText && (
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-700">Ubicación del certificado</h4>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                    Opcional
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <OptionalLocationField
                    label="Ciudad / localidad"
                    checked={options.showCity ?? true}
                    value={options.city}
                    onToggle={setChecked('showCity')}
                    onChange={set('city')}
                    placeholder="San Salvador de Jujuy"
                  />
                  <OptionalLocationField
                    label="Provincia / estado"
                    checked={options.showProvince ?? false}
                    value={options.province}
                    onToggle={setChecked('showProvince')}
                    onChange={set('province')}
                    placeholder="Jujuy"
                  />
                  <OptionalLocationField
                    label="País / región"
                    checked={options.showCountry ?? false}
                    value={options.country}
                    onToggle={setChecked('showCountry')}
                    onChange={set('country')}
                    placeholder="Argentina"
                  />
                </div>
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
                      className={`px-3 py-1.5 text-xs font-semibold transition ${options.caseMode === m.id
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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => setOpenStyle(!openStyle)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-sm font-semibold text-slate-700">Cambiar estilo del Certificado</span>
          <span className="text-xs text-slate-400">{openStyle ? 'Ocultar ▲' : 'Editar ▼'}</span>
        </button>

        {openStyle && (
          <div className="space-y-5 border-t border-slate-100 px-5 py-5">
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Diseño</h3>
              <Field label="Estilo del certificado">
                <select className={inputClass} value={options.style} onChange={set('style')}>
                  {CERTIFICATE_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="text-xs text-slate-400">
                {CERTIFICATE_STYLES.find((style) => style.id === options.style)?.description}
              </p>
              <div className="space-y-3 rounded-xl border border-slate-100 p-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={options.showImageBackground}
                    onChange={setChecked('showImageBackground')}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  Usar imagen de fondo personalizada
                </label>
                <Field label="URL o data URL de la imagen">
                  <input
                    className={inputClass}
                    type="text"
                    value={options.imageBackground || ''}
                    onChange={set('imageBackground')}
                    placeholder="https://… o data:image/…"
                  />
                </Field>
                <p className="text-xs text-slate-400">
                  Al desmarcar la opción se usa el fondo del estilo seleccionado. Para uso sin conexión, usá una data URL.
                </p>
              </div>
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
    </div>
  )
}