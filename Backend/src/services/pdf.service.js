import PDFDocument from 'pdfkit'

function generateAssessmentPdf(assessment, outputStream) {
  const doc = new PDFDocument({ margin: 50, size: 'LETTER' })
  doc.pipe(outputStream)

  const user = assessment.user

  // ── HEADER ──
  doc.fontSize(20).font('Helvetica-Bold').text('Valoracion Fisica', { align: 'center' })
  doc.fontSize(10).font('Helvetica').text(
    `Fecha: ${new Date(assessment.createdAt).toLocaleDateString('es-CO')}`,
    { align: 'center' }
  )
  doc.moveDown(1.5)

  // ── DATOS DEL PACIENTE ──
  sectionTitle(doc, 'Datos del Paciente')
  row2(doc, 'Nombre', user.nombre, 'Documento', user.documento)
  row2(doc, 'Email', user.email, 'Telefono', user.telefono)
  row2(doc, 'EPS', user.eps, 'Grupo Sanguineo', user.grupoSanguineo)
  row2(doc, 'Carrera', user.carrera, 'Semestre', String(user.semestre))
  doc.moveDown()

  // ── MEDIDAS CORPORALES ──
  sectionTitle(doc, 'Medidas Corporales')
  row2(doc, 'Peso', `${assessment.peso} kg`, 'Estatura', `${assessment.estatura} cm`)
  row2(doc, 'IMC', String(assessment.imc), 'Grasa corporal', `${assessment.grasaCorporal}%`)
  row2(doc, 'Masa muscular', `${assessment.masaMuscular} kg`, 'Masa magra', `${assessment.masaMagra} kg`)
  row2(doc, 'Agua corporal', `${assessment.aguaCorporal}%`, 'Grasa visceral', `Nivel ${assessment.grasaVisceral}`)
  doc.moveDown()

  // ── DATOS CLÍNICOS ──
  sectionTitle(doc, 'Datos Clinicos')
  row2(doc, 'Presion arterial', assessment.presionArterial, 'Edad metabolica', `${assessment.edadMetabolica} anos`)
  row2(doc, 'Fuerza de agarre', `${assessment.fuerzaAgarre} kg`, 'Resistencia muscular', assessment.resistenciaMuscular)
  row2(doc, 'RM estimado', String(assessment.rmEstimado), 'PPM', String(assessment.ppm))
  row2(doc, 'Actividad fisica', assessment.nivelActividadFisica, 'Objetivo', assessment.objetivoUsuario)
  if (assessment.observacion) {
    row1(doc, 'Observaciones', assessment.observacion)
  }
  doc.moveDown()

  // ── ANÁLISIS IA ──
  if (assessment.analisisIA) {
    sectionTitle(doc, 'Analisis del Entrenador (IA)')
    doc.fontSize(10).font('Helvetica').text(assessment.analisisIA, {
      align: 'justify',
      lineGap: 3,
    })
  }

  // ── FOOTER ──
  doc.moveDown(2)
  doc.fontSize(8).fillColor('gray').text(
    `Documento generado el ${new Date().toLocaleString('es-CO')}`,
    { align: 'center' }
  )

  doc.end()
}

// ── Helpers ──

function sectionTitle(doc, title) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text(title)
  doc.moveTo(doc.x, doc.y).lineTo(doc.x + 500, doc.y).strokeColor('#cccccc').stroke()
  doc.moveDown(0.5)
}

function row2(doc, label1, value1, label2, value2) {
  const y = doc.y
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text(`${label1}: `, 50, y, { continued: true })
  doc.font('Helvetica').text(value1)
  doc.fontSize(10).font('Helvetica-Bold').text(`${label2}: `, 300, y, { continued: true })
  doc.font('Helvetica').text(value2)
}

function row1(doc, label, value) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text(`${label}: `, { continued: true })
  doc.font('Helvetica').text(value)
}

export { generateAssessmentPdf }
