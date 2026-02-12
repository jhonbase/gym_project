import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import apiClient from '../api/client.js'
import AlertMessage from '../components/AlertMessage.jsx'

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
    // Limpiar errores al escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null}))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAlert(null)
    setFieldErrors({})
    try {
      // Convertir strings numéricos a números
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
        setAlert({ type: 'error', message: 'Corrige los campos señalados'})
      } else {
        setAlert({ type: 'error', message: data?.error || 'Error al guardar la valoración'})
      }
    } finally {
      setLoading(false)
    }
  }

 function FieldError({ name }) {
  if (!fieldErrors[name]) return null
  return <small className="field-error">{fieldErrors[name]}</small>
 }

  return (
    <div className="assessment-form-page">
      <h1>📋 Nueva Valoración Física</h1>
      <p>Paciente: <strong>{user.nombre}</strong></p>
      <AlertMessage {...alert} onClose={() => setAlert(null)} />

      <form onSubmit={handleSubmit} className="assessment-form">
        <fieldset>
          <legend>Medidas corporales</legend>
          <div className="form-grid">
            <label>Peso (kg)<input name="peso" type="number" step="0.1" value={form.peso} onChange={handleChange} required /><FieldError name="peso" /></label>
            <label>Estatura (cm)<input name="estatura" type="number" step="0.1" value={form.estatura} onChange={handleChange} required /><FieldError name="estatura" /></label>
            <label>Grasa corporal (%)<input name="grasaCorporal" type="number" step="0.1" value={form.grasaCorporal} onChange={handleChange} required /><FieldError name="grasaCorporal" /></label>
            <label>Masa muscular (kg)<input name="masaMuscular" type="number" step="0.1" value={form.masaMuscular} onChange={handleChange} required /><FieldError name="masaMuscular" /></label>
            <label>IMC<input name="imc" type="number" step="0.1" value={form.imc} onChange={handleChange} required /><FieldError name="number" /></label>
            <label>Masa magra (kg)<input name="masaMagra" type="number" step="0.1" value={form.masaMagra} onChange={handleChange} required /><FieldError name="masaMagra" /></label>
            <label>Agua corporal (%)<input name="aguaCorporal" type="number" step="0.1" value={form.aguaCorporal} onChange={handleChange} required /><FieldError name="aguaCorporal" /></label>
            <label>Grasa visceral (nivel)<input name="grasaVisceral" type="number" min="1" max="59" value={form.grasaVisceral} onChange={handleChange} required /><FieldError name="grasaVisceral" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Datos clínicos</legend>
          <div className="form-grid">
            <label>Presión arterial<input name="presionArterial" placeholder="120/80" value={form.presionArterial} onChange={handleChange} required /><FieldError name="presionArterial" /></label>
            <label>Edad metabólica<input name="edadMetabolica" type="number" value={form.edadMetabolica} onChange={handleChange} required /><FieldError name="edadMetabolica" /></label>
            <label>Fuerza de agarre (kg)<input name="fuerzaAgarre" type="number" step="0.1" value={form.fuerzaAgarre} onChange={handleChange} required /><FieldError name="fuerzaAgarre" /></label>
            <label>Resistencia muscular<input name="resistenciaMuscular" value={form.resistenciaMuscular} onChange={handleChange} required /><FieldError name="resistenciaMuscular" /></label>
            <label>RM estimado<input name="rmEstimado" type="number" step="0.1" value={form.rmEstimado} onChange={handleChange} required /><FieldError name="rmEstimado" /></label>
            <label>PPM<input name="ppm" type="number" min="30" max="250" value={form.ppm} onChange={handleChange} required /><FieldError name="ppm" /></label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Contexto</legend>
          <label>Nivel de actividad física
            <select name="nivelActividadFisica" value={form.nivelActividadFisica} onChange={handleChange}>
              <option value="sedentario">Sedentario</option>
              <option value="ligero">Ligero</option>
              <option value="moderado">Moderado</option>
              <option value="activo">Activo</option>
              <option value="muy_activo">Muy activo</option>
            </select>
          </label>
          <label>Observaciones (opcional)<textarea name="observacion" value={form.observacion} onChange={handleChange} rows="3" /></label>
          <label>Objetivo del usuario<textarea name="objetivoUsuario" value={form.objetivoUsuario} onChange={handleChange} rows="3" required /></label>
        </fieldset>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Completar Valoración'}
        </button>
      </form>
    </div>
  )
}