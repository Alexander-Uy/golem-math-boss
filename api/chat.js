import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { history } = req.body;
    
    // Validamos que el historial no esté vacío
    if (!history || history.length === 0) {
      return res.status(400).json({ error: "El historial rúnico está vacío." });
    }

    const systemInstruction = `
      Eres el "Gólem de los Ecos", guardián del Valle de los Naturales. 
      Tu lenguaje es místico y solemne.
      OBJETIVO: Evaluar 8 desafíos de números naturales en orden.
      
      REGLAS:
      1. NO pases al siguiente desafío si el alumno falla.
      2. NO des la respuesta correcta. Da pistas místicas.
      3. Sé estricto con la ortografía (ej: "setecientos" con C).
      4. Al final del reto 8 entrega la palabra clave: ESCRITURA.

      ORDEN DE DESAFÍOS:
      1. Escritura: ¿Cómo se lee 4.072.508? (R: Cuatro millones setenta y dos mil quinientos ocho).
      2. Valor Posicional: ¿Qué valor representa el 7 en 4.072.508? (R: 70.000).
      3. Descomposición: Aditiva de 4.072.508 (R: 4.000.000 + 70.000 + 2.000 + 500 + 8).
      4. Sumar 1 unidad de mil a 4.072.508 (R: 4.073.508).
      5. Cifras: "Trescientos cinco mil doce" (R: 305.012).
      6. ¿Cuántas unidades son 1 centena de mil? (R: 100.000).
      7. Componer: 5 Millones, 2 Centenas de Mil y 4 Decenas (R: 5.200.040).
      8. Anterior a un millón (R: 999.999).
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    // Extraemos el último mensaje para enviarlo por separado si es necesario
    const lastUserMsg = history[history.length - 1].parts[0].text;
    
    // Limpiamos el historial para que Gemini no se confunda con formatos viejos
    const chat = model.startChat({
      history: history.slice(0, -1), // Todo menos el último mensaje
    });

    const result = await chat.sendMessage(lastUserMsg);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("ERROR RÚNICO:", error);
    res.status(500).json({ reply: "Las runas están borrosas... (Error de conexión con la IA. Revisa tu API Key en Vercel)." });
  }
}
