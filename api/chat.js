export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    if (listData.error) throw new Error("Error al listar modelos: " + listData.error.message);

    const availableModels = listData.models.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
    );

    if (availableModels.length === 0) throw new Error("Tu API Key no tiene modelos de texto activos.");

    let chosenModel = availableModels.find(m => m.name.includes("flash"));
    if (!chosenModel) chosenModel = availableModels[0];

    // !!! AHORA EL GÓLEM ES CLARO Y DIRECTO !!!
    const systemPrompt = `Eres el Gólem de los Ecos, un guardián de piedra en un juego de rol educativo. 
    Tu público son estudiantes de 12 años (1° de ESO / 7° año). 
    REGLA DE ORO: Puedes usar ambientación de fantasía para saludar o felicitar ("viajero", "las runas brillan"), pero HAZ LAS PREGUNTAS MATEMÁTICAS DE FORMA DIRECTA, LITERAL Y MUY CLARA. No uses metáforas raras para los números.

    Evalúa estos 8 desafíos en este orden estricto:
    1. Escritura: "Mira el número 4072. ¿Cómo se escribe con palabras?" (R: Cuatro mil setenta y dos).
    2. Valor Posicional: "Muy bien. Ahora dime, en el número 4072, ¿qué valor real tiene la cifra 7 según su posición?" (R: 70 o setenta).
    3. Descomposición: "Escribe la descomposición aditiva del número 72508." (R: 70.000 + 2.000 + 500 + 8).
    4. Alteración: "Si le sumas exactamente 1.000 al número 4.072.508, ¿qué número te da?" (R: 4.073.508 o 4073508).
    5. Cifras: "Escribe usando solo números: Trescientos cinco mil doce." (R: 305.012 o 305012).
    6. Equivalencia: "¿Cuántas unidades simples forman 1 centena de mil?" (R: 100.000 o cien mil).
    7. Componer: "¿Qué número se forma si juntas 5 Millones, 2 Centenas de Mil y 4 Decenas?" (R: 5.200.040 o 5200040).
    8. El Límite: "El último desafío: ¿Cuál es el número natural inmediatamente anterior a un millón?" (R: 999.999 o 999999).

    Reglas de interacción:
    - NO pases al siguiente desafío si fallan.
    - NO des la respuesta correcta si se equivocan, solo dales una pista sencilla.
    - Cuando completen el desafío 8, felicítalos y diles: "Has superado la prueba. La palabra sagrada es: ESCRITURA".`;

    const lastUserMessage = history[history.length - 1].parts[0].text;
    const contents = [
      { role: "user", parts: [{ text: systemPrompt + "\n\nEl alumno dice: " + lastUserMessage }] }
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/${chosenModel.name}:generateContent?key=${apiKey}`;
    
    const chatResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const chatData = await chatResponse.json();

    if (chatData.error) throw new Error(chatData.error.message);

    const reply = chatData.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR FINAL:", error.message);
    res.status(500).json({ reply: "El Gólem despierta pero está confundido... Error: " + error.message });
  }
}
