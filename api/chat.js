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
  7. Componer: 5M, 2CM, 4D (R: 5.200.040).
  8. Anterior a 1M (R: 999.999).
  Reglas: No des respuestas, da pistas místicas. Si terminan, di la clave: ESCRITURA.`;

  // 2. Preparamos el cuerpo del mensaje para la API de Google
  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Entendido. El ritual comienza." }] },
    ...history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.parts[0].text }]
    }))
  ];

  try {
    // LLAMADA DIRECTA (Sin librerías que fallen)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR:", error.message);
    res.status(500).json({ reply: "El Gólem sigue dormido... Error: " + error.message });
  }
}
