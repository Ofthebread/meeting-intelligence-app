//import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import { meetingController } from '../controllers/meetingController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
// Una ruta de salud (health check) para verificar si el servidor está funcionando.
router.get('/health', meetingController.health);
// Crea una nueva reunión. Espera datos en el cuerpo de la solicitud (body)
router.post('/meetings', meetingController.createMeeting);
router.post('/meetings/analyze', upload.single('audio'), meetingController.analyzeMeeting);
//Obtiene una lista de todas las reuniones
router.get('/meetings', meetingController.getMeetings);
//Obtiene una reunión específica por su ID (el :id es un parámetro dinámico) antes de exportar la reunión para evitar conflictos de rutas para evitar conflictos de rutas
router.get('/meetings/:id', meetingController.getMeetingById);
//Exporta los datos de una reunión específica (por ejemplo, a un archivo o formato como PDF/JSON)
router.get('/meetings/:id/export', meetingController.exportMeeting);
// Procesa una reunión de demostración (demo) para un ID específico. Probablemente simula o procesa datos de prueba.
router.post('/meetings/:id/process-demo', meetingController.processDemoMeeting);
// Actualiza una reunión existente por su ID. Usa PATCH para modificaciones parciales
router.patch('/meetings/:id', meetingController.updateMeeting);

// Additional endpoints (e.g., update title) can be added here

export default router;
