import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { history } = req.body;
    
    // Instrucciones del sistema
    const systemPrompt = `Eres el Gólem de los Ecos. Debes evaluar 8 desafíos de números naturales:
    1. Escritura de 4.072.508 (Cuatro millones setenta y dos mil quinientos ocho).
    2. Valor del 7 en ese número (70.000).
    3. Descomposición aditiva (4.000.000 + 70.000 + 2.000 + 500 + 8).
    4. Sumar 1.000 a 4.072.508 (4.073.508).
    5. Cifras: "Trescientos cinco mil doce" (305.012).
    6. Unidades en 1 centena de mil (100.000).
    7. Componer: 5M, 2CM, 4D (5.200.040).
    8. Anterior a 1M (999.999).
    No des respuestas. Da pistas. Si terminan los 8, di la clave: ESCRITURA.`;

    // Intentamos con el modelo más moderno primero
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Limpiamos el historial para el formato exacto de Google
    const cleanHistory = history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.parts[0].text }]
    }));

    // Insertamos la instrucción del sistema al inicio para que no se pierda
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Las runas se iluminan. Soy el Gólem. ¿Estás listo para el primer desafío?" }] },
        ...cleanHistory.slice(0, -1)
      ]
    });

    const lastMsg = cleanHistory[cleanHistory.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMsg);
    const response = await result.response;
    
    res.status(200).json({ reply: response.text() });

  } catch (error) {
    console.error("DETALLE:", error.message);
    // Si el error es un 404, el mensaje será más descriptivo
    res.status(500).json({ reply: "El Gólem no responde... " + error.message });
  }
}
