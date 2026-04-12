import prisma from './src/config/database.js';

async function createTrainer() {
  try {
    const trainer = await prisma.user.create({
      data: {
        nombre: 'Entrenador Principal',
        documento: '00000000',
        email: 'entrenador@unifit.edu',
        telefono: '3000000000',
        eps: 'universitaria',
        grupoSanguineo: 'O+',
        contactoEmergencia: 'Contacto de emergencia',
        programa: 'Educación Física',
        jornada: 'diurna',
        semestre: 0,
        numeroCarnet: 'ENT001',
        esEgresado: false,
        rol: 'entrenador',
        modalidad: 'presencial'
      }
    });
    console.log('Entrenador creado:', trainer.email);
    console.log('Password temporal: gym2024');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTrainer();