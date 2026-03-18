export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Instrucciones del Gólem
  const systemPrompt = `Eres el Gólem de los Ecos. Debes evaluar 8 desafíos de naturales en orden:
  1. Escritura de 4.072.508 (R: Cuatro millones setenta y dos mil quinientos ocho).
  2. Valor del 7 en ese número (R: 70.000).
  3. Descomposición aditiva (R: 4.000.000 + 70.000 + 2.000 + 500 + 8).
  4. Sumar 1.000 a 4.072.508 (R: 4.073.508).
  5. Cifras: "Trescientos cinco mil doce" (R: 305.012).
  6. Unidades en 1 centena de mil (R: 100.000).
  7. Componer: 5 Millones, 2 Centenas de Mil y 4 Decenas (R: 5.200.040).
  8. Anterior a 1M (R: 999.999).
  Reglas: No des respuestas, da pistas místicas. Si terminan los 8, di la clave: ESCRITURA.`;

  // 2. Formateamos los mensajes (Eliminamos el historial previo para evitar errores de cuota o formato y enviamos solo el contexto actual)
  const contents = [
    { role: "user", parts: [{ text: systemPrompt + " El alumno dice: " + history[history.length - 1].parts[0].text }] }
  ];

  try {
    // CAMBIO CLAVE: Usamos la versión 'v1' y el modelo 'gemini-pro'
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    // Si hay error en la respuesta de Google
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Extraemos la respuesta
    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ reply: "El Gólem sigue dormido... Error: " + error.message });
  }
}
