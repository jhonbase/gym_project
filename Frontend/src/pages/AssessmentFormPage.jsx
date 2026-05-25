import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import AlertMessage from '../components/AlertMessage.jsx'
import SectionCard from '../components/SectionCard.jsx'
import FieldError from '../components/FieldError.jsx'

/* ─── Iconos ──────────────────────────────────── */
const IconBody = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/><path d="M12 7v8m-4-5 4 5 4-5M8 19h8"/>
  </svg>
)
const IconClinical = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
)
const IconContext = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
)
const IconLesion = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IconHistory = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E10600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
)

/* ─── Campo con label + input + error ─────────── */
function FormField({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label className="ui-label">{label}</label>
      {children}
      <FieldError error={error} />
    </div>
  )
}

/* ─── Componente de antecedente estilo chip ─── */
function AntecedenteField({ label, name, form, setForm, error }) {
  const tiene = form[name]
  const descKey = `${name}Desc`
  
  return (
    <div className="antecedente-chip-wrapper">
      <button
        type="button"
        className={`antecedente-chip ${tiene ? 'antecedente-chip-active' : ''}`}
        onClick={() => setForm(prev => ({ 
          ...prev, 
          [name]: !prev[name],
          [descKey]: !prev[name] ? prev[descKey] : ''
        }))}
      >
        <span className="antecedente-chip-icon">{tiene ? '✓' : '+'}</span>
        <span>{label}</span>
      </button>
      {tiene && (
        <input
          className="ui-input antecedente-desc"
          name={descKey}
          placeholder="Descripción (opcional)"
          value={form[descKey] || ''}
          onChange={(e) => setForm(prev => ({ ...prev, [descKey]: e.target.value }))}
        />
      )}
      {error && <div style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</div>}
    </div>
  )
}

export default function AssessmentFormPage() {
  const { user } = useAuth()
  const { userId } = useParams()
  const navigate = useNavigate()
  
  const targetUserId = userId || user.id
  const targetUserName = userId ? 'Estudiante' : user.nombre
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

   const [form, setForm] = useState({
     peso: '', estatura: '', grasaCorporal: '', masaMuscular: '',
     imc: '', masaMagra: '', aguaCorporal: '', grasaVisceral: '',
     presionArterial: '', edadMetabolica: '',
     resistenciaMuscular: '',
     nivelActividadFisica: 'sedentario', 
     diasDisponibles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
     observacion: '', objetivoUsuario: '',
     proximaFechaValoracion: '',
     tieneLesion: false, lesionDescripcion: '',
     anteOsteomuscular: false, anteOsteomuscularDesc: '',
     anteCardiovascular: false, anteCardiovascularDesc: '',
     anteRespiratorio: false, anteRespiratorioDesc: '',
     anteMetabolico: false, anteMetabolicoDesc: '',
     antePsiquiatrico: false, antePsiquiatricoDesc: '',
     antePsicologico: false, antePsicologicoDesc: '',
     indicaciones: [],
     nuevaIndicacionTipo: '',
     nuevaIndicacionTexto: ''
   })

  const [lesionFiles, setLesionFiles] = useState([])
  const [historialFile, setHistorialFile] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      if (name === 'tieneLesion') {
        setForm(prev => ({ 
          ...prev, 
          tieneLesion: checked,
          lesionDescripcion: checked ? prev.lesionDescripcion : ''
        }))
      } else {
        setForm(prev => ({ ...prev, [name]: checked }))
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  function handleLesionFileChange(e) {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setAlert({ type: 'error', message: 'Solo se permiten archivos PDF o imágenes (JPEG, PNG, WebP)' })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setAlert({ type: 'error', message: 'El archivo no puede exceder 10MB' })
        return
      }
      setLesionFiles(prev => [...prev, file])
    })
    e.target.value = ''
  }

  function handleHistorialFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setAlert({ type: 'error', message: 'Solo se permiten archivos PDF o imágenes (JPEG, PNG, WebP)' })
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setAlert({ type: 'error', message: 'El archivo no puede exceder 10MB' })
        return
      }
      setHistorialFile(file)
    }
  }

  function removeLesionFile(index) {
    setLesionFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAlert(null)
    setFieldErrors({})
    
    try {
       const data = {
         userId: targetUserId,
         peso: Number(form.peso),
         estatura: Number(form.estatura),
         grasaCorporal: form.grasaCorporal ? Number(form.grasaCorporal) : undefined,
         masaMuscular: form.masaMuscular ? Number(form.masaMuscular) : undefined,
         imc: form.imc ? Number(form.imc) : undefined,
         masaMagra: form.masaMagra ? Number(form.masaMagra) : undefined,
         aguaCorporal: form.aguaCorporal ? Number(form.aguaCorporal) : undefined,
         grasaVisceral: form.grasaVisceral ? Number(form.grasaVisceral) : undefined,
         presionArterial: form.presionArterial,
         edadMetabolica: form.edadMetabolica ? Number(form.edadMetabolica) : undefined,
         fuerzaAgarre: 1,
         resistenciaMuscular: form.resistenciaMuscular,
         rmEstimado: 1,
         ppm: 30,
         nivelActividadFisica: form.nivelActividadFisica,
         diasDisponibles: form.diasDisponibles,
         observacion: form.observacion || undefined,
         objetivoUsuario: form.objetivoUsuario,
         proximaFechaValoracion: form.proximaFechaValoracion ? new Date(form.proximaFechaValoracion).toISOString() : undefined,
         lesionDescripcion: form.tieneLesion ? (form.lesionDescripcion || undefined) : undefined,
         anteOsteomuscular: form.anteOsteomuscular,
         anteOsteomuscularDesc: form.anteOsteomuscular ? form.anteOsteomuscularDesc || undefined : undefined,
         anteCardiovascular: form.anteCardiovascular,
         anteCardiovascularDesc: form.anteCardiovascular ? form.anteCardiovascularDesc || undefined : undefined,
         anteRespiratorio: form.anteRespiratorio,
         anteRespiratorioDesc: form.anteRespiratorio ? form.anteRespiratorioDesc || undefined : undefined,
         anteMetabolico: form.anteMetabolico,
         anteMetabolicoDesc: form.anteMetabolico ? form.anteMetabolicoDesc || undefined : undefined,
         antePsiquiatrico: form.antePsiquiatrico,
         antePsiquiatricoDesc: form.antePsiquiatrico ? form.antePsiquiatricoDesc || undefined : undefined,
         antePsicologico: form.antePsicologico,
         antePsicologicoDesc: form.antePsicologico ? form.antePsicologicoDesc || undefined : undefined,
         indicaciones: form.indicaciones.length > 0 ? form.indicaciones : undefined
       }

      const res = await apiClient.post('/assessments', data)
      const assessment = res.data.data.assessment

      for (const file of lesionFiles) {
        const formData = new FormData()
        formData.append('evidencia', file)
        if (form.tieneLesion && form.lesionDescripcion) {
          formData.append('descripcion', form.lesionDescripcion)
        }
        await apiClient.post(`/assessments/${assessment.id}/lesion`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      if (historialFile) {
        const formData = new FormData()
        formData.append('archivo', historialFile)
        await apiClient.post(`/assessments/${assessment.id}/historial`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      if (userId) {
        navigate(`/student/${userId}`)
      } else {
        navigate(`/assessment/${assessment.id}`)
      }
    } catch (err) {
      const data = err.response?.data
      const details = data?.details
      if (details?.length) {
        const errors = {}
        details.forEach(d => { errors[d.field] = d.message })
        setFieldErrors(errors)
        setAlert({ type: 'error', message: 'Corrige los campos señalados' })
      } else {
        setAlert({ type: 'error', message: data?.error || 'Error al guardar la valoración' })
      }
    } finally {
      setLoading(false)
    }
  }

  const fe = fieldErrors
  const antecedenteFields = [
    { label: 'Osteomuscular', name: 'anteOsteomuscular' },
    { label: 'Cardiovascular', name: 'anteCardiovascular' },
    { label: 'Respiratorio', name: 'anteRespiratorio' },
    { label: 'Metabólico', name: 'anteMetabolico' },
    { label: 'Psiquiátrico', name: 'antePsiquiatrico' },
    { label: 'Psicológico', name: 'antePsicologico' },
  ]

  return (
    <div className="assessment-form-page">
      <div className="page-header">
        <h1 className="page-title">
          Nueva Valoración
          <span className="page-title-line" />
        </h1>
        <p className="page-subtitle">
          Paciente: <strong>{targetUserName}</strong>
        </p>
      </div>

      <AlertMessage {...alert} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Medidas corporales */}
        <SectionCard icon={<IconBody />} title="Medidas corporales">
          <div className="ui-grid-2">
            <FormField label="Peso (kg)" error={fe.peso}>
              <input className="ui-input" name="peso" type="number" step="0.1" value={form.peso} onChange={handleChange} required />
            </FormField>
            <FormField label="Estatura (cm)" error={fe.estatura}>
              <input className="ui-input" name="estatura" type="number" step="0.1" value={form.estatura} onChange={handleChange} required />
            </FormField>
            <FormField label="Grasa corporal (%)" error={fe.grasaCorporal}>
              <input className="ui-input" name="grasaCorporal" type="number" step="0.1" value={form.grasaCorporal} onChange={handleChange} required />
            </FormField>
            <FormField label="Masa muscular (kg)" error={fe.masaMuscular}>
              <input className="ui-input" name="masaMuscular" type="number" step="0.1" value={form.masaMuscular} onChange={handleChange} required />
            </FormField>
            <FormField label="IMC" error={fe.imc}>
              <input className="ui-input" name="imc" type="number" step="0.1" value={form.imc} onChange={handleChange} required />
            </FormField>
            <FormField label="Masa magra (kg)" error={fe.masaMagra}>
              <input className="ui-input" name="masaMagra" type="number" step="0.1" value={form.masaMagra} onChange={handleChange} />
            </FormField>
            <FormField label="Grasa visceral (nivel)" error={fe.grasaVisceral}>
              <input className="ui-input" name="grasaVisceral" type="number" min="1" max="59" value={form.grasaVisceral} onChange={handleChange} required />
            </FormField>
          </div>
        </SectionCard>

        {/* Datos clínicos */}
        <SectionCard icon={<IconClinical />} title="Datos clínicos">
          <div className="ui-grid-2">
            <FormField label="Presión arterial" error={fe.presionArterial}>
              <input className="ui-input" name="presionArterial" placeholder="120/80" value={form.presionArterial} onChange={handleChange} required />
            </FormField>
            <FormField label="Edad metabólica" error={fe.edadMetabolica}>
              <input className="ui-input" name="edadMetabolica" type="number" value={form.edadMetabolica} onChange={handleChange} required />
            </FormField>
            <FormField label="Agua corporal (%)" error={fe.aguaCorporal}>
              <input className="ui-input" name="aguaCorporal" type="number" step="0.1" value={form.aguaCorporal} onChange={handleChange} />
            </FormField>
            <FormField label="Resistencia muscular" error={fe.resistenciaMuscular}>
              <input className="ui-input" name="resistenciaMuscular" value={form.resistenciaMuscular} onChange={handleChange} required />
            </FormField>
          </div>
        </SectionCard>

        {/* Antecedentes Clínicos */}
        <SectionCard icon={<IconLesion />} title="Antecedentes Clínicos">
          <div className="lesion-edit-section">
            {form.tieneLesion ? (
              <div className="lesion-edit-active">
                <div className="lesion-edit-header">
                  <span className="lesion-edit-badge">✓ Con lesión</span>
                  <button 
                    type="button" 
                    className="lesion-edit-remove"
                    onClick={() => setForm(prev => ({ ...prev, tieneLesion: false, lesionDescripcion: '' }))}
                  >
                    Quitar
                  </button>
                </div>
                
                <textarea 
                  className="ui-input" 
                  name="lesionDescripcion" 
                  value={form.lesionDescripcion} 
                  onChange={handleChange} 
                  rows="2" 
                  style={{ resize: 'vertical', minHeight: '60px', marginTop: '0.5rem' }}
                  placeholder="Descripción de la lesión (opcional)"
                />
                
                <div className="lesion-upload" style={{ marginTop: '0.75rem' }}>
                  <input
                    type="file"
                    id="lesionFile"
                    accept=".pdf,image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleLesionFileChange}
                    className="lesion-input"
                    multiple
                  />
                  <label htmlFor="lesionFile" className="lesion-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Agregar archivos
                  </label>
                </div>
                
                {lesionFiles.length > 0 && (
                  <div className="lesion-files-list" style={{ marginTop: '0.5rem' }}>
                    {lesionFiles.map((file, index) => (
                      <div key={index} className="lesion-file-item">
                        <span>📄 {file.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeLesionFile(index)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E10600', fontSize: '1rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button 
                type="button" 
                className="lesion-add-btn"
                onClick={() => setForm(prev => ({ ...prev, tieneLesion: true }))}
              >
                <span className="lesion-add-icon">+</span>
                <span>Agregar información de lesión</span>
              </button>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <label className="ui-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Historial clínico</label>
            <div className="lesion-upload">
              <input
                type="file"
                id="historialFile"
                accept=".pdf,image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleHistorialFileChange}
                className="lesion-input"
              />
              {historialFile ? (
                <div className="lesion-file-selected">
                  <span>📄 {historialFile.name}</span>
                  <button 
                    type="button"
                    onClick={() => setHistorialFile(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E10600', fontSize: '1rem' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="historialFile" className="lesion-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Adjuntar historial clínico (único)
                </label>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Antecedentes de salud */}
        <SectionCard icon={<IconHistory />} title="Antecedentes de salud">
          <div className="antecedentes-grid">
            {antecedenteFields.map(({ label, name }) => (
              <AntecedenteField
                key={name}
                label={label}
                name={name}
                form={form}
                setForm={setForm}
                error={fieldErrors[name]}
              />
            ))}
          </div>
        </SectionCard>

         {/* Contexto del usuario */}
         <SectionCard icon={<IconContext />} title="Contexto del usuario">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
             <FormField label="Nivel de actividad física" error={fe.nivelActividadFisica}>
               <select className="ui-input" name="nivelActividadFisica" value={form.nivelActividadFisica} onChange={handleChange}>
                 <option value="sedentario">Sedentario</option>
                 <option value="ligero">Ligero</option>
                 <option value="moderado">Moderado</option>
                 <option value="activo">Activo</option>
                 <option value="muy_activo">Muy activo</option>
               </select>
             </FormField>
             <div className="objetivo-wrapper">
               <label className="objetivo-label">
                 <span className="objetivo-icon">🏆</span>
                 Objetivo del usuario
               </label>
               <textarea 
                 className="ui-input objetivo-input" 
                 name="objetivoUsuario" 
                 value={form.objetivoUsuario} 
                 onChange={handleChange} 
                 rows="3" 
                 style={{ resize: 'vertical', minHeight: '80px' }}
                 placeholder="¿Qué objetivos tiene el usuario?"
               />
             </div>
             <div className="proxima-fecha-wrapper">
               <label className="proxima-fecha-label">
                 <span className="proxima-fecha-icon">📅</span>
                 Próxima fecha de valoración
               </label>
               <input 
                 type="date" 
                 className="ui-input proxima-fecha-input"
                 name="proximaFechaValoracion"
                 value={form.proximaFechaValoracion}
                 onChange={handleChange}
                 min={new Date().toISOString().split('T')[0]}
               />
             </div>
             <FormField label="Observaciones (opcional)" error={fe.observacion}>
               <textarea className="ui-input" name="observacion" value={form.observacion} onChange={handleChange} rows="3" style={{ resize: 'vertical', minHeight: '80px' }} />
             </FormField>
             <div>
               <label className="ui-label">Días disponibles para entrenar</label>
               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                 {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(dia => (
                   <button
                     key={dia}
                     type="button"
                     className={`antecedente-chip ${form.diasDisponibles.includes(dia) ? 'antecedente-chip-active' : ''}`}
                     onClick={() => {
                       const nuevosDias = form.diasDisponibles.includes(dia)
                         ? form.diasDisponibles.filter(d => d !== dia)
                         : [...form.diasDisponibles, dia]
                       setForm(prev => ({ ...prev, diasDisponibles: nuevosDias }))
                     }}
                   >
                     <span className="antecedente-chip-icon">{form.diasDisponibles.includes(dia) ? '✓' : '+'}</span>
                     <span style={{ textTransform: 'capitalize' }}>{dia}</span>
                   </button>
                 ))}
               </div>
             </div>
           </div>
         </SectionCard>

         {/* Indicaciones de entrenamiento */}
         <SectionCard icon={<IconContext />} title="INDICACIONES DE ENTRENAMIENTO">
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
             {form.indicaciones && form.indicaciones.length > 0 ? (
               <div className="indicaciones-list">
                 {form.indicaciones.map((indicacion, index) => (
                   <div key={index} className="indicacion-chip" style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '0.5rem',
                     padding: '0.5rem',
                     backgroundColor: getIndicacionColor(indicacion.tipo),
                     borderRadius: '0.25rem',
                     color: 'white'
                   }}>
                     <span className="indicacion-icon">{getIndicacionIcon(indicacion.tipo)}</span>
                     <span>{indicacion.texto}</span>
                     <button 
                       type="button"
                       onClick={() => {
                         const nuevasIndicaciones = [...form.indicaciones];
                         nuevasIndicaciones.splice(index, 1);
                         setForm(prev => ({ ...prev, indicaciones: nuevasIndicaciones }));
                       }}
                       style={{ 
                         background: 'none', 
                         border: 'none', 
                         color: 'rgba(255,255,255,0.7)', 
                         cursor: 'pointer',
                         fontSize: '1.2rem'
                       }}
                     >
                       ×
                     </button>
                   </div>
                 ))}
               </div>
             ) : null}
             <div className="add-indicacion-row" style={{ 
               display: 'flex', 
               gap: '0.5rem', 
               flexWrap: 'wrap',
               marginTop: '0.5rem'
             }}>
               <select 
                 className="ui-input"
                 value={form.nuevaIndicacionTipo || ''}
                 onChange={(e) => setForm(prev => ({ ...prev, nuevaIndicacionTipo: e.target.value }))}
                 style={{ minWidth: '120px' }}
               >
                 <option value="">Seleccionar tipo</option>
                 <option value="mejora">Mejora</option>
                 <option value="restriccion">Restricción</option>
                 <option value="recomendacion">Recomendación</option>
                 <option value="seguir">Continuar</option>
               </select>
               <input 
                 className="ui-input"
                 type="text"
                 placeholder="Descripción de la indicación"
                 value={form.nuevaIndicacionTexto || ''}
                 onChange={(e) => setForm(prev => ({ ...prev, nuevaIndicacionTexto: e.target.value }))}
                 style={{ flex: 1, minWidth: '200px' }}
               />
               <button 
                 type="button"
                 className="ui-btn-secondary"
                 onClick={() => {
                   if (form.nuevaIndicacionTipo && form.nuevaIndicacionTexto.trim() !== '') {
                     setForm(prev => ({
                       ...prev,
                       indicaciones: [...prev.indicaciones, {
                         tipo: prev.nuevaIndicacionTipo,
                         texto: prev.nuevaIndicacionTexto.trim()
                       }],
                       nuevaIndicacionTipo: '',
                       nuevaIndicacionTexto: ''
                     }));
                   }
                 }}
                 disabled={!form.nuevaIndicacionTipo || !form.nuevaIndicacionTexto.trim()}
               >
                 + Agregar indicación
               </button>
             </div>
           </div>
         </SectionCard>

         {/* Acciones */}
         <div className="form-actions">
           <button type="button" className="ui-btn-secondary" onClick={() => navigate(userId ? `/student/${userId}` : '/dashboard')}>
             Cancelar
           </button>
           <button type="submit" className="ui-btn-primary" disabled={loading}>
             {loading ? 'Guardando...' : 'Completar Valoración →'}
           </button>
         </div>
       </form>
     </div>
   )
 }

 function getIndicacionColor(tipo) {
   switch (tipo) {
     case 'restriccion': return '#ef4444' // rojo
     case 'recomendacion': return '#22c55e' // verde
     case 'mejora': return '#3b82f6' // azul
     case 'seguir': return '#f97316' // naranja
     default: return '#6b7280' // gris
   }
 }

 function getIndicacionIcon(tipo) {
   switch (tipo) {
     case 'restriccion': return '⚠️'
     case 'recomendacion': return '✅'
     case 'mejora': return '📈'
     case 'seguir': return '⭐'
     default: return 'ℹ️'
   }
 }