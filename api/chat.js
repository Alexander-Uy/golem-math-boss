import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { history } = req.body;
    
    const systemInstruction = `Eres el Gólem de los Ecos. Evalúa 8 desafíos de naturales. 
    1. Escritura de 4.072.508 (Cuatro millones setenta y dos mil quinientos ocho). 
    2. Valor del 7 en ese número (70.000). 
    3. Descomposición aditiva de 4.072.508 (4.000.000 + 70.000 + 2.000 + 500 + 8). 
    4. Sumar 1000 a 4.072.508 (4.073.508). 
    5. Escribir en cifras: "Trescientos cinco mil doce" (305.012). 
    6. ¿Cuántas unidades son 1 centena de mil? (100.000). 
    7. Componer: 5M, 2CM, 4D (5.200.040). 
    8. Anterior a 1M (999.999).
    No des respuestas, da pistas místicas. Si completan todo, di la clave: ESCRITURA.`;

    // !!! CAMBIO AQUÍ: Usamos gemini-pro que es el más compatible !!!
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro"
    });

    const formattedHistory = history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.parts[0].text }]
    }));

    // Para gemini-pro, enviamos la instrucción del sistema como primer mensaje si es necesario
    // pero el método startChat con historial es lo más robusto
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: "Entendido, soy el Gólem de los Ecos. El ritual comienza." }] },
        ...formattedHistory.slice(0, -1)
      ],
    });

    const lastMessage = formattedHistory[formattedHistory.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    
    res.status(200).json({ reply: response.text() });

  } catch (error) {
    console.error("DETALLE DEL ERROR:", error.message);
    res.status(500).json({ reply: "Las runas están borrosas... Error: " + error.message });
  }
}
