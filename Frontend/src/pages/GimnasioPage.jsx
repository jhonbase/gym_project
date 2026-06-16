import { useState, useRef } from 'react'

const GRUPOS_MUSCULARES = [
  'Pierna', 'Pecho', 'Espalda', 'Hombro',
  'Bíceps', 'Tríceps', 'Core', 'Cardio', 'Full body',
]

const NIVELES = ['Principiante', 'Intermedio', 'Avanzado']

const TIPOS_MAQUINA = ['Cardio', 'Fuerza', 'Funcional']

const ESTADOS_MAQUINA = ['Disponible', 'En mantenimiento']

function Tag({ children, variant = 'gray' }) {
  const variants = {
    red: 'bg-[#dc26261a] text-[#f87171] border border-[#dc262633]',
    gray: 'bg-[#1f1f1f] text-[#9ca3af] border border-[#2a2a2a]',
    green: 'bg-[#05260f] text-[#4ade80] border border-[#166534]',
    bad: 'bg-[#2a0a0a] text-[#f87171] border border-[#7f1d1d]',
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${variants[variant] || variants.gray}`}>
      {children}
    </span>
  )
}

function FieldGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">{label}</label>
      {children}
    </div>
  )
}

function ImageUpload({ image, onImageChange }) {
  const inputRef = useRef(null)
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChange}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-lg p-6 text-center transition-colors hover:border-[rgba(255,255,255,0.3)]"
        style={{ border: '2px dashed rgba(255,255,255,0.2)', color: '#6b7280', fontSize: '13px' }}
      >
        {image ? (
          <div>
            <img src={image} alt="preview" style={{ maxHeight: '100px', margin: '0 auto 8px', borderRadius: '4px' }} />
            <div className="text-[12px]" style={{ color: '#6b7280' }}>Click para cambiar imagen</div>
          </div>
        ) : (
          <div>
            <div className="text-[24px] mb-1">📷</div>
            <div>Haz clic para subir imagen</div>
          </div>
        )}
      </div>
    </div>
  )
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '16px' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '28px',
          width: '100%',
          maxWidth: wide ? '768px' : '480px',
          maxHeight: '100vh',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="flex-shrink-0 flex justify-between items-center mb-5">
          <h2 className="font-bold text-xl" style={{ color: '#fff' }}>{title}</h2>
          <button
            onClick={onClose}
            className="bg-none border-none cursor-pointer text-xl p-1 transition-colors hover:text-[#e5e5e5]"
            style={{ color: '#6b7280' }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function AccordionSection({ icon, title, isOpen, onToggle, count, onAdd, children }) {
  return (
    <div
      style={{
        background: '#111',
        border: `1px solid ${isOpen ? '#dc262655' : '#2a2a2a'}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
      className="transition-colors"
    >
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}
        className="hover:bg-[#181818] transition-colors"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '15px' }}>
          {icon} {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={e => { e.stopPropagation(); onAdd() }}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              height: '30px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0 18px',
            }}
            className="hover:bg-[#b91c1c] transition-colors"
          >
            + Añadir
          </button>
          <span
            style={{
              background: '#dc26261a',
              color: '#dc2626',
              border: '1px solid #dc262633',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '20px',
            }}
          >
            {count}
          </span>
          <svg
            className={`transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: '#4b5563' }}
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div style={{ borderTop: '1px solid #1f1f1f' }}>
          {children}
        </div>
      )}
    </div>
  )
}

const inputCls = 'bg-[#111] text-[#e5e5e5] rounded-lg text-[13px] outline-none border border-[#2a2a2a] focus:border-[#dc2626] w-full'
const textareaCls = 'bg-[#111] text-[#e5e5e5] rounded-lg text-[13px] outline-none border border-[#2a2a2a] focus:border-[#dc2626] w-full resize-none'
const selectCls = 'bg-[#111] text-[#e5e5e5] rounded-lg text-[13px] outline-none border border-[#2a2a2a] focus:border-[#dc2626] w-full'
const saveBtnCls = 'bg-[#dc2626] text-white rounded-lg w-full py-4 text-[13px] font-semibold cursor-pointer hover:bg-[#b91c1c] transition-colors border-none'

const EMPTY_EJ_MODAL = { nombre: '', descripcion: '', grupoMuscular: '', nivel: '', imagen: null }
const EMPTY_MQ_MODAL = { nombre: '', descripcion: '', tipo: '', estado: 'Disponible', imagen: null, ejerciciosAsociados: [] }

export default function GimnasioPage() {
  const [openSection, setOpenSection] = useState(null)
  const [ejercicios, setEjercicios] = useState([])
  const [maquinas, setMaquinas] = useState([])

  const [showEjModal, setShowEjModal] = useState(false)
  const [showMqModal, setShowMqModal] = useState(false)
  const [ejForm, setEjForm] = useState({ ...EMPTY_EJ_MODAL })
  const [mqForm, setMqForm] = useState({ ...EMPTY_MQ_MODAL })
  const [ejError, setEjError] = useState('')
  const [mqError, setMqError] = useState('')
  const [editingEjId, setEditingEjId] = useState(null)
  const [editingMqId, setEditingMqId] = useState(null)

  const [mqFilterGrupo, setMqFilterGrupo] = useState('')

  function toggleSection(section) {
    setOpenSection(prev => (prev === section ? null : section))
  }

  function openEjModal(ej = null) {
    if (ej) {
      setEjForm({ nombre: ej.nombre, descripcion: ej.descripcion, grupoMuscular: ej.grupoMuscular, nivel: ej.nivel, imagen: ej.imagen })
      setEditingEjId(ej.id)
    } else {
      setEjForm({ ...EMPTY_EJ_MODAL })
      setEditingEjId(null)
    }
    setEjError('')
    setShowEjModal(true)
  }

  function openMqModal(mq = null) {
    if (mq) {
      setMqForm({ nombre: mq.nombre, descripcion: mq.descripcion, tipo: mq.tipo, estado: mq.estado, imagen: mq.imagen, ejerciciosAsociados: mq.ejerciciosAsociados })
      setEditingMqId(mq.id)
    } else {
      setMqForm({ ...EMPTY_MQ_MODAL })
      setEditingMqId(null)
    }
    setMqFilterGrupo('')
    setMqError('')
    setShowMqModal(true)
  }

  function handleSaveEjercicio() {
    const { nombre, grupoMuscular, nivel } = ejForm
    if (!nombre.trim() || !grupoMuscular || !nivel) {
      setEjError('Completa todos los campos obligatorios.')
      return
    }
    if (editingEjId) {
      setEjercicios(prev => prev.map(e => e.id === editingEjId ? { ...e, nombre: nombre.trim(), descripcion: ejForm.descripcion.trim(), grupoMuscular, nivel, imagen: ejForm.imagen } : e))
    } else {
      setEjercicios(prev => [...prev, { id: Date.now(), nombre: nombre.trim(), descripcion: ejForm.descripcion.trim(), grupoMuscular, nivel, imagen: ejForm.imagen }])
    }
    setShowEjModal(false)
    setEditingEjId(null)
  }

  function handleSaveMaquina() {
    const { nombre, tipo } = mqForm
    if (!nombre.trim() || !tipo) {
      setMqError('Completa todos los campos obligatorios.')
      return
    }
    if (editingMqId) {
      setMaquinas(prev => prev.map(m => m.id === editingMqId ? { ...m, nombre: nombre.trim(), descripcion: mqForm.descripcion.trim(), tipo, estado: mqForm.estado, imagen: mqForm.imagen, ejerciciosAsociados: mqForm.ejerciciosAsociados } : m))
    } else {
      setMaquinas(prev => [...prev, { id: Date.now(), nombre: nombre.trim(), descripcion: mqForm.descripcion.trim(), tipo, estado: mqForm.estado, imagen: mqForm.imagen, ejerciciosAsociados: mqForm.ejerciciosAsociados }])
    }
    setShowMqModal(false)
    setEditingMqId(null)
  }

  function deleteEjercicio(id) {
    setEjercicios(prev => prev.filter(e => e.id !== id))
  }

  function deleteMaquina(id) {
    setMaquinas(prev => prev.filter(m => m.id !== id))
  }

  function handleEjImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setEjForm(prev => ({ ...prev, imagen: reader.result }))
    reader.readAsDataURL(file)
  }

  function handleMqImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setMqForm(prev => ({ ...prev, imagen: reader.result }))
    reader.readAsDataURL(file)
  }

  function toggleEjAsociado(id) {
    setMqForm(prev => ({
      ...prev,
      ejerciciosAsociados: prev.ejerciciosAsociados.includes(id)
        ? prev.ejerciciosAsociados.filter(eid => eid !== id)
        : [...prev.ejerciciosAsociados, id],
    }))
  }

  const filteredEjercicios = ejercicios.filter(
    ej => !mqFilterGrupo || ej.grupoMuscular === mqFilterGrupo
  )

  return (
    <div style={{ padding: '40px 48px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>
        Gimnasio{' '}
        <span style={{ color: '#dc2626' }}>del Entrenador</span>
      </h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '28px' }}>
        Registra los ejercicios y máquinas disponibles en el gym.
      </p>

      <div className="flex flex-col gap-3">
        <AccordionSection
          icon="🏃"
          title="Ejercicios"
          isOpen={openSection === 'ejercicios'}
          onToggle={() => toggleSection('ejercicios')}
          count={ejercicios.length}
          onAdd={openEjModal}
        >
          {ejercicios.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#374151', fontSize: '13px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏋️</div>
              Sin ejercicios aún. Añade el primero arriba.
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {ejercicios.map(ej => (
                <div
                  key={ej.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderBottom: '1px solid #171717' }}
                  className="hover:bg-[#141414] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {ej.imagen && (
                      <img src={ej.imagen} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5' }}>{ej.nombre}</span>
                      {ej.descripcion && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{ej.descripcion}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Tag variant="red">{ej.grupoMuscular}</Tag>
                    <Tag variant="gray">{ej.nivel}</Tag>
                    <button
                      onClick={() => openEjModal(ej)}
                      style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '14px', padding: '4px 6px', borderRadius: '6px' }}
                      className="hover:text-[#e5e5e5] hover:bg-[#ffffff10] transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteEjercicio(ej.id)}
                      style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '14px', padding: '4px 6px', borderRadius: '6px' }}
                      className="hover:text-[#ef4444] hover:bg-[#ef444415] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          icon="⚙️"
          title="Máquinas"
          isOpen={openSection === 'maquinas'}
          onToggle={() => toggleSection('maquinas')}
          count={maquinas.length}
          onAdd={openMqModal}
        >
          {maquinas.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#374151', fontSize: '13px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚙️</div>
              Sin máquinas aún. Añade la primera arriba.
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {maquinas.map(mq => (
                <div
                  key={mq.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderBottom: '1px solid #171717' }}
                  className="hover:bg-[#141414] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {mq.imagen && (
                      <img src={mq.imagen} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5' }}>{mq.nombre}</span>
                      {mq.descripcion && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{mq.descripcion}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Tag variant="gray">{mq.tipo}</Tag>
                    <Tag variant={mq.estado === 'Disponible' ? 'green' : 'bad'}>{mq.estado}</Tag>
                    <button
                      onClick={() => openMqModal(mq)}
                      style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '14px', padding: '4px 6px', borderRadius: '6px' }}
                      className="hover:text-[#e5e5e5] hover:bg-[#ffffff10] transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteMaquina(mq.id)}
                      style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '14px', padding: '4px 6px', borderRadius: '6px' }}
                      className="hover:text-[#ef4444] hover:bg-[#ef444415] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AccordionSection>
      </div>

      <div style={{ marginTop: '20px', background: '#1a0f00', border: '1px solid #78350f55', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚠️ MVP: datos en memoria — se borran al recargar.
      </div>

      {/* ===== MODAL EJERCICIOS ===== */}
      <Modal open={showEjModal} onClose={() => { setShowEjModal(false); setEditingEjId(null) }} title={editingEjId ? 'Editar ejercicio' : 'Nuevo ejercicio'}>
        <div className="flex flex-col gap-6" style={{ flex: 1, minHeight: 0 }}>
          <div className="flex flex-col gap-6">
            <FieldGroup label="Nombre *">
              <input
                type="text"
                placeholder="Ej: Sentadilla búlgara"
                value={ejForm.nombre}
                onChange={e => { setEjForm(prev => ({ ...prev, nombre: e.target.value })); setEjError('') }}
                className={inputCls}
                style={{ padding: '14px' }}
              />
            </FieldGroup>
            <FieldGroup label="Descripción">
              <textarea
                rows={3}
                placeholder="Describe el ejercicio..."
                value={ejForm.descripcion}
                onChange={e => setEjForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className={textareaCls}
                style={{ padding: '14px' }}
              />
            </FieldGroup>
            <FieldGroup label="Grupo muscular *">
              <select
                value={ejForm.grupoMuscular}
                onChange={e => { setEjForm(prev => ({ ...prev, grupoMuscular: e.target.value })); setEjError('') }}
                className={selectCls}
                style={{ padding: '14px', height: 'auto' }}
              >
                <option value="">— Seleccionar —</option>
                {GRUPOS_MUSCULARES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Nivel *">
              <select
                value={ejForm.nivel}
                onChange={e => { setEjForm(prev => ({ ...prev, nivel: e.target.value })); setEjError('') }}
                className={selectCls}
                style={{ padding: '14px', height: 'auto' }}
              >
                <option value="">— Seleccionar —</option>
                {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Imagen">
              <ImageUpload image={ejForm.imagen} onImageChange={handleEjImageChange} />
            </FieldGroup>
          </div>
          <div style={{ flex: 1 }} />
          {ejError && <div className="text-[#ef4444] text-[12px]">{ejError}</div>}
          <button onClick={handleSaveEjercicio} className={saveBtnCls} style={{ padding: '16px' }}>
            {editingEjId ? 'Actualizar ejercicio' : 'Guardar ejercicio'}
          </button>
        </div>
      </Modal>

      {/* ===== MODAL MÁQUINAS ===== */}
      <Modal open={showMqModal} onClose={() => { setShowMqModal(false); setEditingMqId(null) }} title={editingMqId ? 'Editar máquina' : 'Nueva máquina'} wide>
        <div className="flex flex-col gap-4" style={{ flex: 1, minHeight: 0 }}>
          <div className="flex gap-6" style={{ flex: 1, minHeight: 0 }}>
            {/* LEFT COLUMN — datos */}
            <div className="flex-1 overflow-y-auto" style={{ paddingRight: '4px' }}>
              <div className="flex flex-col gap-4">
                <FieldGroup label="Nombre *">
                  <input
                    type="text"
            placeholder="Ej: Prensa de pierna"
            value={mqForm.nombre}
            onChange={e => { setMqForm(prev => ({ ...prev, nombre: e.target.value })); setMqError('') }}
            className={inputCls}
            style={{ padding: '14px' }}
          />
        </FieldGroup>
        <FieldGroup label="Descripción">
          <textarea
            rows={3}
            placeholder="Describe la máquina..."
            value={mqForm.descripcion}
            onChange={e => setMqForm(prev => ({ ...prev, descripcion: e.target.value }))}
            className={textareaCls}
            style={{ padding: '14px' }}
          />
                </FieldGroup>
                <FieldGroup label="Tipo *">
                  <select
            value={mqForm.tipo}
            onChange={e => { setMqForm(prev => ({ ...prev, tipo: e.target.value })); setMqError('') }}
            className={selectCls}
            style={{ padding: '14px', height: 'auto' }}
          >
            <option value="">— Seleccionar —</option>
            {TIPOS_MAQUINA.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Estado">
                  <select
            value={mqForm.estado}
            onChange={e => setMqForm(prev => ({ ...prev, estado: e.target.value }))}
            className={selectCls}
            style={{ padding: '14px', height: 'auto' }}
          >
            {ESTADOS_MAQUINA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Imagen">
                  <ImageUpload image={mqForm.imagen} onImageChange={handleMqImageChange} />
                </FieldGroup>
              </div>
            </div>

            {/* DIVIDER */}
            <div style={{ width: '1px', flexShrink: 0, background: 'rgba(255,255,255,0.08)' }} />

            {/* RIGHT COLUMN — ejercicios asociados */}
            <div className="flex-1 flex flex-col" style={{ paddingLeft: '4px' }}>
              <div className="mb-3" style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280' }}>
                Ejercicios asociados
              </div>
              <select
                value={mqFilterGrupo}
                onChange={e => setMqFilterGrupo(e.target.value)}
                className={selectCls}
                style={{ padding: '14px', height: 'auto', marginBottom: '12px' }}
              >
                <option value="">Todos los grupos</option>
                {GRUPOS_MUSCULARES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <div
                className="flex-1 overflow-y-auto"
                style={{
                  minHeight: 0,
                  background: '#111',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',
                }}
              >
                {filteredEjercicios.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                    {ejercicios.length === 0
                      ? 'No hay ejercicios aún. Crea uno primero.'
                      : 'Sin resultados para este grupo.'}
                  </div>
                ) : (
                  filteredEjercicios.map(ej => {
                    const checked = mqForm.ejerciciosAsociados.includes(ej.id)
                    return (
                      <label
                        key={ej.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #1f1f1f',
                        }}
                        className="hover:bg-[#1a1a1a] transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEjAsociado(ej.id)}
                          style={{ accentColor: '#dc2626' }}
                        />
                        <span style={{ fontSize: '13px', color: '#e5e5e5' }}>{ej.nombre}</span>
                        <span className="ml-auto">
                          <Tag variant="red">{ej.grupoMuscular}</Tag>
                        </span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {mqError && <div className="text-[#ef4444] text-[12px]">{mqError}</div>}
          <button onClick={handleSaveMaquina} className={saveBtnCls} style={{ padding: '16px' }}>
            {editingMqId ? 'Actualizar máquina' : 'Guardar máquina'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
