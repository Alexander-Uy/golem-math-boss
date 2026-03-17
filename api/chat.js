export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const chatHistory = req.body.history || [];
  const apiKey = process.env.GEMINI_API_KEY;

  const systemInstruction = `Eres el Gólem de los Ecos, un antiguo guardián de piedra. NUNCA escribas párrafos largos; máximo 3 o 4 líneas. Llama al alumno 'joven errante'. 
Reglas: 1. Ya hiciste la Prueba 1 (leer 4.072.508). Espera la respuesta. 2. Si aciertan, dales la Prueba 2 (descomponer 34.056 en potencias de 10). 3. Si aciertan, dales la Prueba 3 (valor posicional del 8 en 1.845.000 y 9.080.000). 4. Si fallan en cualquiera, da una pista corta y pide que reintenten. 5. Al superar todo, diles: '¡Eres digno! Toma este código: [CÓDIGO: PIEDRA-BASE10]. Buen viaje.'`;

  // Construimos el historial para la API
  const contents = [
    { role: "user", parts: [{ text: systemInstruction }] },
    { role: "model", parts: [{ text: "Entendido. Actuaré como el Gólem siguiendo estas reglas." }] },
    ...chatHistory
  ];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "El eco se corta... (Error en la conexión con la magia antigua)." });
  }
}
