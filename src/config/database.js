import dns from 'node:dns';
import mongoose from 'mongoose';

export async function conectarBanco() {
  if (!process.env.MONGODB_URI)
    throw new Error('Configure MONGODB_URI no arquivo .env');

  // O DNS de algumas redes recusa a consulta SRV do "mongodb+srv://"; força o DNS do Google.
  // Fica aqui para valer em todo lugar que conecta (servidor e seed).
  dns.setServers(['8.8.8.8', '8.8.4.4']);

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  
  console.log('MongoDB Atlas conectado');
}
