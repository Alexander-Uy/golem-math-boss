export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // 🔍 PASO 1: El código le pregunta a Google qué modelos están vivos hoy
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    if (listData.error) throw new Error("Error al listar modelos: " + listData.error.message);

    // Filtramos para encontrar uno que sirva para generar texto (chat)
    const availableModels = listData.models.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
    );

    if (availableModels.length === 0) throw new Error("Tu API Key no tiene modelos de texto activos.");

    // Elegimos preferentemente uno rápido ("flash") o el primero que funcione
    let chosenModel = availableModels.find(m => m.name.includes("flash"));
    if (!chosenModel) chosenModel = availableModels[0];

    // 📜 PASO 2: Las instrucciones de nuestro Gólem
    const systemPrompt = `Eres el Gólem de los Ecos. Evalúa 8 desafíos de naturales en orden:
    1. Escritura de 4.072.508 (R: Cuatro millones setenta y dos mil quinientos ocho).
    2. Valor del 7 en ese número (R: 70.000).
    3. Descomposición aditiva (R: 4.000.000 + 70.000 + 2.000 + 500 + 8).
    4. Sumar 1.000 a 4.072.508 (R: 4.073.508).
    5. Cifras: "Trescientos cinco mil doce" (R: 305.012).
    6. Unidades en 1 centena de mil (R: 100.000).
    7. Componer: 5M, 2CM, 4D (R: 5.200.040).
    8. Anterior a 1M (R: 999.999).
    Reglas: No des respuestas, da pistas místicas. Si completan el 8, di la clave: ESCRITURA.`;

    // Tomamos lo que acaba de escribir el alumno
    const lastUserMessage = history[history.length - 1].parts[0].text;
    const contents = [
      { role: "user", parts: [{ text: systemPrompt + "\n\nEl alumno dice: " + lastUserMessage }] }
    ];

    // ⚡ PASO 3: Le mandamos el mensaje al modelo que encontramos en el Paso 1
    const url = `https://generativelanguage.googleapis.com/v1beta/${chosenModel.name}:generateContent?key=${apiKey}`;
    
    const chatResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const chatData = await chatResponse.json();

    if (chatData.error) throw new Error(chatData.error.message);

    // Extraemos la respuesta mágica
    const reply = chatData.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR FINAL:", error.message);
    res.status(500).json({ reply: "El Gólem despierta pero está confundido... Error: " + error.message });
  }
}
