import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'
import Footer from '../components/Footer.jsx'

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-policy-page">
      <header className="privacy-policy-header">
        <Link to="/" className="privacy-policy-brand">
          <BrandLogo size="md" />
        </Link>
      </header>

      <main className="privacy-policy-main">
        <div className="privacy-policy-container">
          <Link to="/login" className="privacy-policy-back">
            <IconArrowLeft />
            Volver al inicio
          </Link>

          <h1 className="privacy-policy-title">Política de Tratamiento de Datos Personales</h1>

          <section className="privacy-policy-section">
            <h2>1. Responsable del tratamiento</h2>
            <p>
              UniFit, con domicilio en Bogotá, es responsable del tratamiento de los datos personales 
              recolectados a través de la plataforma. Para cualquier solicitud relacionada con esta política, 
              el titular podrá contactarnos en: <strong>entrenador@unifit.edu</strong>.
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>2. Alcance y marco normativo</h2>
            <p>
              La presente política regula el tratamiento de los datos personales de los usuarios de la 
              plataforma, en cumplimiento de la Ley 1581 de 2012, sus decretos reglamentarios y los 
              lineamientos de la Superintendencia de Industria y Comercio.
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>3. Información que recolectamos</h2>
            <p>En el desarrollo de nuestras actividades, recolectamos y tratamos diferentes tipos de información:</p>
            <ul>
              <li>
                <strong>Datos de identificación y contacto:</strong> nombre, tipo y número de documento, 
                correo electrónico, teléfono, información académica o institucional y demás datos necesarios 
                para la gestión del servicio.
              </li>
              <li>
                <strong>Datos relacionados con el estado físico y la salud (datos sensibles):</strong> 
                información como peso, estatura, composición corporal, indicadores fisiológicos, antecedentes clínicos, 
                lesiones, historial médico y demás datos necesarios para la valoración física y la 
                personalización del entrenamiento.
              </li>
              <li>
                <strong>Documentos:</strong> archivos suministrados por el usuario, tales como certificados 
                o soportes médicos.
              </li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>4. Finalidad del tratamiento</h2>
            <p>Los datos personales serán utilizados para las siguientes finalidades:</p>
            <ul>
              <li>Gestionar el registro y acceso del usuario a la plataforma.</li>
              <li>Realizar valoraciones físicas y hacer seguimiento a su evolución.</li>
              <li>Diseñar y ajustar planes de entrenamiento de acuerdo con sus condiciones y objetivos.</li>
              <li>Identificar riesgos y generar recomendaciones para un entrenamiento seguro.</li>
              <li>Mantener comunicación relacionada con el servicio.</li>
              <li>Cumplir obligaciones legales y atender requerimientos de autoridades.</li>
              <li>Mejorar la calidad de la plataforma y los servicios ofrecidos.</li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>5. Tratamiento de datos sensibles</h2>
            <p>
              Algunos de los datos solicitados corresponden a información sensible, en particular 
              aquellos relacionados con la salud y la condición física del usuario.
            </p>
            <p>
              El suministro de esta información es voluntario, y su tratamiento se realizará 
              únicamente con autorización previa, expresa e informada del titular. La negativa a 
              proporcionar estos datos no impedirá el uso general de la plataforma, pero puede limitar 
              funcionalidades relacionadas con la valoración y personalización del entrenamiento.
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>6. Derechos de los titulares</h2>
            <p>Los titulares de los datos personales podrán:</p>
            <ul>
              <li>Conocer, actualizar y rectificar su información.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informados sobre el uso dado a sus datos.</li>
              <li>Revocar la autorización o solicitar la supresión de sus datos cuando sea procedente.</li>
              <li>Acceder de forma gratuita a su información.</li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>7. Procedimiento para el ejercicio de derechos</h2>
            <p>
              Las solicitudes podrán presentarse a través del correo electrónico indicado en esta política.
            </p>
            <p>
              Las consultas serán atendidas en un término máximo de diez (10) días hábiles, y 
              los reclamos en un plazo máximo de quince (15) días hábiles, conforme a la normativa aplicable.
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>8. Seguridad de la información</h2>
            <p>
              Adoptamos medidas razonables de carácter técnico, administrativo y organizativo para proteger 
              la información personal contra acceso no autorizado, pérdida, uso indebido o alteración.
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>9. Transferencia y uso de terceros</h2>
            <p>
              Para la prestación del servicio, podremos apoyarnos en proveedores tecnológicos que 
              actúan como encargo del tratamiento (por ejemplo, servicios de almacenamiento o 
              infraestructura), quienes estarán sujetos a obligaciones de confidencialidad y seguridad 
              de la información.
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>10. Vigencia y actualizaciones</h2>
            <p>
              La presente política rige a partir de su publicación y podrá ser actualizada en 
              cualquier momento. Las modificaciones serán informadas a través de la plataforma o 
              mediante los canales habituales de comunicación.
            </p>
          </section>

          <div className="privacy-policy-footer-link">
            <Link to="/login" className="privacy-policy-btn">
              <IconArrowLeft />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}