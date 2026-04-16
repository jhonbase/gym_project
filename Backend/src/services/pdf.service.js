import PDFDocument from 'pdfkit'

function generateAssessmentPdf(assessment, outputStream) {
  const doc = new PDFDocument({ margin: 50, size: 'LETTER' })
  doc.pipe(outputStream)

  const left = doc.page.margins.left
  const right = doc.page.margins.right
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right

  const user = assessment.user

  // ── HEADER ──
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#1a1a1a').text('VALORACIÓN FÍSICA', { align: 'center' })
  doc.moveDown(0.3)
  doc.fontSize(11).font('Helvetica').fillColor('#666666').text(
    `Fecha: ${new Date(assessment.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    { align: 'center' }
  )
  doc.moveDown(1.5)

  // ── LÍNEA DIVISORIA ──
  doc.lineWidth(2).moveTo(left, doc.y).lineTo(doc.page.width - right, doc.y).strokeColor('#E10600').stroke()
  doc.moveDown(1)

  // ── DATOS DEL PACIENTE ──
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#E10600').text('DATOS DEL PACIENTE', left, doc.y)
  doc.moveDown(0.5)
  doc.lineWidth(0.5).moveTo(left, doc.y).lineTo(doc.page.width - right, doc.y).strokeColor('#dddddd').stroke()
  doc.moveDown(0.8)
  
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333')
  doc.text(`Nombre: `, { continued: true })
  doc.font('Helvetica').text(`${user.nombre}`)
  doc.font('Helvetica-Bold').text(`Documento: `, { continued: true })
  doc.font('Helvetica').text(`${user.documento}`)
  doc.font('Helvetica-Bold').text(`Teléfono: `, { continued: true })
  doc.font('Helvetica').text(`${user.telefono || '-'}`)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').text(`Email: `, { continued: true })
  doc.font('Helvetica').text(`${user.email}`)
  doc.font('Helvetica-Bold').text(`EPS: `, { continued: true })
  doc.font('Helvetica').text(`${user.eps || '-'}`)
  doc.font('Helvetica-Bold').text(`Grupo Sanguíneo: `, { continued: true })
  doc.font('Helvetica').text(`${user.grupoSanguineo || '-'}`)
  doc.moveDown(1.5)

  // ── COMPOSICIÓN CORPORAL ──
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#E10600').text('COMPOSICIÓN CORPORAL', left, doc.y)
  doc.moveDown(0.5)
  doc.lineWidth(0.5).moveTo(left, doc.y).lineTo(doc.page.width - right, doc.y).strokeColor('#dddddd').stroke()
  doc.moveDown(0.8)

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333')
  doc.text(`Peso: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.peso} kg`)
  doc.font('Helvetica-Bold').text(`Estatura: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.estatura} cm`)
  doc.font('Helvetica-Bold').text(`IMC: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.imc}`)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').text(`Grasa corporal: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.grasaCorporal}%`)
  doc.font('Helvetica-Bold').text(`Masa muscular: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.masaMuscular} kg`)
  doc.font('Helvetica-Bold').text(`Masa magra: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.masaMagra || '-'} kg`)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').text(`Agua corporal: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.aguaCorporal || '-'}%`)
  doc.font('Helvetica-Bold').text(`Grasa visceral: `, { continued: true })
  doc.font('Helvetica').text(`Nivel ${assessment.grasaVisceral}`)
  doc.moveDown(1.5)

  // ── DATOS DE SALUD ──
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#E10600').text('DATOS DE SALUD', left, doc.y)
  doc.moveDown(0.5)
  doc.lineWidth(0.5).moveTo(left, doc.y).lineTo(doc.page.width - right, doc.y).strokeColor('#dddddd').stroke()
  doc.moveDown(0.8)

  doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333')
  doc.text(`Presión arterial: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.presionArterial}`)
  doc.font('Helvetica-Bold').text(`PPM: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.ppm}`)
  doc.font('Helvetica-Bold').text(`Edad metabólica: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.edadMetabolica} años`)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').text(`Fuerza de agarre: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.fuerzaAgarre} kg`)
  doc.font('Helvetica-Bold').text(`Resistencia muscular: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.resistenciaMuscular}`)
  doc.font('Helvetica-Bold').text(`RM estimado: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.rmEstimado}`)
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').text(`Nivel de actividad física: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.nivelActividadFisica}`)
  doc.font('Helvetica-Bold').text(`Objetivo: `, { continued: true })
  doc.font('Helvetica').text(`${assessment.objetivoUsuario}`)
  doc.moveDown(1)

  // ── ANTECEDENTES DE SALUD ──
  if (assessment.anteOsteomuscular || assessment.anteCardiovascular || assessment.anteRespiratorio || 
      assessment.anteMetabolico || assessment.antePsiquiatrico || assessment.antePsicologico) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#E10600').text('ANTECEDENTES DE SALUD', left, doc.y)
    doc.moveDown(0.5)
    doc.lineWidth(0.5).moveTo(left, doc.y).lineTo(doc.page.width - right, doc.y).strokeColor('#dddddd').stroke()
    doc.moveDown(0.8)
    
    doc.fontSize(10).font('Helvetica')
    const antecedentes = []
    if (assessment.anteOsteomuscular) antecedentes.push(`Osteomuscular: ${assessment.anteOsteomuscularDesc || 'Sí'}`)
    if (assessment.anteCardiovascular) antecedentes.push(`Cardiovascular: ${assessment.anteCardiovascularDesc || 'Sí'}`)
    if (assessment.anteRespiratorio) antecedentes.push(`Respiratorio: ${assessment.anteRespiratorioDesc || 'Sí'}`)
    if (assessment.anteMetabolico) antecedentes.push(`Metabólico: ${assessment.anteMetabolicoDesc || 'Sí'}`)
    if (assessment.antePsiquiatrico) antecedentes.push(`Psiquiátrico: ${assessment.antePsiquiatricoDesc || 'Sí'}`)
    if (assessment.antePsicologico) antecedentes.push(`Psicológico: ${assessment.antePsicologicoDesc || 'Sí'}`)
    
    doc.text(antecedentes.join(' | '))
    doc.moveDown(1.5)
  }

  // ── OBSERVACIONES ──
  if (assessment.observacion) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#E10600').text('OBSERVACIONES', left, doc.y)
    doc.moveDown(0.5)
    doc.lineWidth(0.5).moveTo(left, doc.y).lineTo(doc.page.width - right, doc.y).strokeColor('#dddddd').stroke()
    doc.moveDown(0.8)
    
    doc.fontSize(10).font('Helvetica').text(assessment.observacion, { width: usableWidth, align: 'justify', lineGap: 2 })
    doc.moveDown(1.5)
  }

  // ── ANÁLISIS DEL ENTRENADOR (IA) ──
  if (assessment.analisisIA) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#E10600').text('ANÁLISIS DEL ENTRENADOR', left, doc.y)
    doc.moveDown(0.5)
    doc.lineWidth(2).moveTo(left, doc.y).lineTo(doc.page.width - right, doc.y).strokeColor('#E10600').stroke()
    doc.moveDown(1)

    // Limpiar y formatear el análisis
    const analisisClean = cleanMarkdown(assessment.analisisIA)
    const sections = parseAnalysisSections(analisisClean)
    
    sections.forEach(section => {
      // Verificar si hay espacio para la sección
      if (doc.y > doc.page.height - 100) {
        doc.addPage()
      }
      
      // Título de la sección en negrita
      if (section.title) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text(section.title, left, doc.y)
        doc.moveDown(0.4)
      }
      
      // Contenido de la sección
      doc.fontSize(10).font('Helvetica').fillColor('#333333').text(section.content, {
        width: usableWidth,
        align: 'justify',
        lineGap: 3
      })
      doc.moveDown(0.8)
    })
    
    doc.moveDown()
  }

  // ── FOOTER ──
  doc.moveDown(1)
  doc.fontSize(8).font('Helvetica').fillColor('#999999').text(
    `Documento generado el ${new Date().toLocaleString('es-CO')}`,
    { align: 'center' }
  )

  doc.end()
}

// Función para limpiar texto de markdown
function cleanMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // ***bold italic*** -> bold italic
    .replace(/\*\*(.+?)\*\*/g, '$1')      // **bold** -> bold
    .replace(/\*(.+?)\*/g, '$1')              // *italic* -> italic
    .replace(/__(.+?)__/g, '$1')            // __underline__ -> underline
    .replace(/_(.+?)_/g, '$1')            // _italic_ -> italic
    .replace(/`(.+?)`/g, '$1')            // `code` -> code
    .replace(/^#+\s*/gm, '')           // Remove headers ###
    .trim()
}

// Función para parsear secciones del análisis
function parseAnalysisSections(text) {
  const sections = []
  const lines = text.split('\n')
  let currentTitle = ''
  let currentContent = []
  
  const titlePatterns = [
    'resumen', 'estado físico', 'factores de riesgo', 'considerar',
    'recomendaciones', 'ejercicio', 'carga', 'nutricionales',
    'metas', 'objetivo', 'informe', 'importante'
  ]
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Detectar si es un título de sección
    const isTitle = titlePatterns.some(pattern => 
      line.toLowerCase().includes(pattern)
    ) && (line.length < 60 || line.endsWith(':'))
    
    if (isTitle && currentTitle) {
      // Guardar sección anterior
      sections.push({
        title: currentTitle,
        content: formatContent(currentContent.join('\n'))
      })
      currentTitle = line
      currentContent = []
    } else if (isTitle && !currentTitle) {
      currentTitle = line
    } else {
      if (currentTitle) {
        currentContent.push(line)
      } else {
        // Si no hay título, es parte del contenido general
        currentTitle = 'Resumen'
        currentContent.push(line)
      }
    }
  }
  
  // Agregar última sección
  if (currentTitle || currentContent.length) {
    sections.push({
      title: currentTitle,
      content: formatContent(currentContent.join('\n'))
    })
  }
  
  return sections
}

// Función para formatear contenido (listas, espaciado)
function formatContent(text) {
  if (!text) return ''
  
  // Separar listas numeradas: "1. Hacer X 2. Hacer Y" -> "1. Hacer X\n2. Hacer Y"
  let formatted = text.replace(/(\d+)\.\s+([A-ZÁÉÍÓÚÑ])/g, '\n$1. $2')
  
  // Separar listas con guiones: "- Hacer X - Hacer Y" -> "- Hacer X\n- Hacer Y"
  formatted = formatted.replace(/-\s+([A-ZÁÉÍÓÚÑ])/g, '\n• $1')
  
  // Limpiar espacios múltiples
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  
  return formatted.trim()
}

export { generateAssessmentPdf }