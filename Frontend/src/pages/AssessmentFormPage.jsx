import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function AssessmentFormPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const [form, setForm] = useState({
    peso: '', estatura: '', grasaCorporal: '', masaMuscular: '',
    imc: '', masaMagra: '', aguaCorporal: '', grasaVisceral: '',
    presionArterial: '', edadMetabolica: '', fuerzaAgarre: '',
    resistenciaMuscular: '', rmEstimado: '', ppm: '',
    nivelActividadFisica: 'sedentario', observacion: '', objetivoUsuario: '',
  })

  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAlert(null)
    setFieldErrors({})
    try {
      const data = {
        userId: user.id,
        peso: Number(form.peso),
        estatura: Number(form.estatura),
        grasaCorporal: Number(form.grasaCorporal),
        masaMuscular: Number(form.masaMuscular),
        imc: Number(form.imc),
        masaMagra: Number(form.masaMagra),
        aguaCorporal: Number(form.aguaCorporal),
        grasaVisceral: Number(form.grasaVisceral),
        presionArterial: form.presionArterial,
        edadMetabolica: Number(form.edadMetabolica),
        fuerzaAgarre: Number(form.fuerzaAgarre),
        resistenciaMuscular: form.resistenciaMuscular,
        rmEstimado: Number(form.rmEstimado),
        ppm: Number(form.ppm),
        nivelActividadFisica: form.nivelActividadFisica,
        observacion: form.observacion || undefined,
        objetivoUsuario: form.objetivoUsuario,
      }

      const res = await apiClient.post('/assessments', data)
      const assessment = res.data.data.assessment
      navigate(`/assessment/${assessment.id}`)
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

  return (
    <div className="assessment-form-page">
      {/* Encabezado de página */}
      <div className="page-header">
        <h1 className="page-title">
          Nueva Valoración
          <span className="page-title-line" />
        </h1>
        <p className="page-subtitle">
          Paciente: <strong>{user.nombre}</strong>
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
              {/* Bug corregido: era name="number", ahora usa fe.imc correctamente */}
              <input className="ui-input" name="imc" type="number" step="0.1" value={form.imc} onChange={handleChange} required />
            </FormField>
            <FormField label="Masa magra (kg)" error={fe.masaMagra}>
              <input className="ui-input" name="masaMagra" type="number" step="0.1" value={form.masaMagra} onChange={handleChange} required />
            </FormField>
            <FormField label="Agua corporal (%)" error={fe.aguaCorporal}>
              <input className="ui-input" name="aguaCorporal" type="number" step="0.1" value={form.aguaCorporal} onChange={handleChange} required />
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
            <FormField label="Fuerza de agarre (kg)" error={fe.fuerzaAgarre}>
              <input className="ui-input" name="fuerzaAgarre" type="number" step="0.1" value={form.fuerzaAgarre} onChange={handleChange} required />
            </FormField>
            <FormField label="Resistencia muscular" error={fe.resistenciaMuscular}>
              <input className="ui-input" name="resistenciaMuscular" value={form.resistenciaMuscular} onChange={handleChange} required />
            </FormField>
            <FormField label="RM estimado" error={fe.rmEstimado}>
              <input className="ui-input" name="rmEstimado" type="number" step="0.1" value={form.rmEstimado} onChange={handleChange} required />
            </FormField>
            <FormField label="PPM (frec. cardíaca)" error={fe.ppm}>
              <input className="ui-input" name="ppm" type="number" min="30" max="250" value={form.ppm} onChange={handleChange} required />
            </FormField>
          </div>
        </SectionCard>

        {/* Contexto */}
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
            <FormField label="Objetivo del usuario" error={fe.objetivoUsuario}>
              <textarea className="ui-input" name="objetivoUsuario" value={form.objetivoUsuario} onChange={handleChange} rows="3" required style={{ resize: 'vertical', minHeight: '80px' }} />
            </FormField>
            <FormField label="Observaciones (opcional)" error={fe.observacion}>
              <textarea className="ui-input" name="observacion" value={form.observacion} onChange={handleChange} rows="3" style={{ resize: 'vertical', minHeight: '80px' }} />
            </FormField>
          </div>
        </SectionCard>

        {/* Acciones */}
        <div className="form-actions">
          <button type="button" className="ui-btn-secondary" onClick={() => navigate('/dashboard')}>
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
