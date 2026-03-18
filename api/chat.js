import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { history } = req.body;
    
    // Instrucciones ultra-detalladas para el comportamiento del Gólem
    const systemInstruction = `Eres el Gólem de los Ecos, guardián de piedra y musgo. 
    Tu misión es evaluar 8 desafíos de números naturales en estricto orden.
    
    ORDEN DE DESAFÍOS:
    1. Escritura: ¿Cómo se lee 4.072.508? (R: Cuatro millones setenta y dos mil quinientos ocho).
    2. Valor Posicional: ¿Qué valor representa el 7 en 4.072.508? (R: 70.000).
    3. Descomposición: Aditiva de 4.072.508 (R: 4.000.000 + 70.000 + 2.000 + 500 + 8).
    4. Sumar 1 unidad de mil (1.000) a 4.072.508 (R: 4.073.508).
    5. Cifras: Escribir en números "Trescientos cinco mil doce" (R: 305.012).
    6. ¿Cuántas unidades son 1 centena de mil? (R: 100.000).
    7. Componer: 5 Millones, 2 Centenas de Mil y 4 Decenas (R: 5.200.040).
    8. Anterior a un millón (R: 999.999).

    REGLAS:
    - Usa lenguaje místico y solemne.
    - NO pases al siguiente desafío si fallan.
    - NO des la respuesta correcta, da pistas místicas sobre el valor posicional.
    - Al terminar el reto 8, di: "La palabra sagrada es: ESCRITURA".`;

    // Usamos el nombre de modelo más actualizado y compatible
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    // Formateamos el historial correctamente para la API de Google
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: "Entendido. El ritual de los Naturales comienza ahora." }] },
        ...history.map(item => ({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.parts[0].text }]
        })).slice(0, -1)
      ],
    });

    const lastMessage = history[history.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    
    res.status(200).json({ reply: response.text() });

  } catch (error) {
    console.error("DETALLE DEL ERROR:", error.message);
    res.status(500).json({ reply: "Las runas están borrosas... Intenta refrescar. Error: " + error.message });
  }
}
