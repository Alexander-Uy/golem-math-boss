import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { history } = req.body;
    
    const systemInstruction = `Eres el Gólem de los Ecos. Evalúa 8 desafíos de naturales. 
    1. Escritura de 4.072.508. 
    2. Valor del 7 (70.000). 
    3. Descomposición aditiva. 
    4. Sumar 1000. 
    5. Cifras: 305.012. 
    6. Centena de mil (100.000). 
    7. Componer: 5M, 2CM, 4D (5.200.040). 
    8. Anterior a 1M (999.999).
    No des respuestas, da pistas místicas. Si completan todo, di la clave: ESCRITURA.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    // Filtramos el historial para asegurar el formato correcto que pide Google
    const formattedHistory = history.map(item => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.parts[0].text }]
    }));

    const chat = model.startChat({
      history: formattedHistory.slice(0, -1),
    });

    const lastMessage = formattedHistory[formattedHistory.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    
    res.status(200).json({ reply: response.text() });

  } catch (error) {
    // Esto nos ayudará a ver el error real en los logs de Vercel
    console.error("DETALLE DEL ERROR:", error.message);
    res.status(500).json({ reply: "Las runas están borrosas... Error: " + error.message });
  }
}
