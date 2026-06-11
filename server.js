import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import 'dotenv/config'; // <- ¡AGREGA ESTA LÍNEA AQUÍ MISMO!

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const contactSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('El email debe ser válido'),
  mensaje: z.string().min(1, 'El mensaje es obligatorio'),
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/contact', async (req, res) => {
  const parseResult = contactSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Datos inválidos',
      issues: parseResult.error.format(),
    });
  }

  const { nombre, email, mensaje } = parseResult.data;

  try {
    await transporter.sendMail({
      from: `${nombre} <${email}>`,
      to: 'davidar25@gmail.com',
      subject: 'Nuevo mensaje desde el formulario de contacto',
      text: `Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`,
      html: `<p><strong>Nombre:</strong> ${nombre}</p><p><strong>Email:</strong> ${email}</p><p><strong>Mensaje:</strong></p><p>${mensaje}</p>`,
    });

    return res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return res.status(500).json({ error: 'Error enviando el correo' });
  }
});

app.listen(port, () => {
  console.log(`Servidor API iniciado en http://localhost:${port}`);
});
