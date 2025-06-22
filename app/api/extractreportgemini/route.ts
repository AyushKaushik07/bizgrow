import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `Analyze this industrial report image and:
1. Identify any abnormalities or anomalies
2. Summarize key findings in 200-300 words
3. Include numerical values and key details
4. Analyze surrounding competition
5. Suggest improvement approaches

## Summary Format:
- Use clear paragraphs separated by double line breaks
- Include specific metrics where available
- Focus on actionable insights`;

export async function POST(req: Request) {
  try {
    const { base64 } = await req.json();
    
    const imagePart = fileToGenerativePart(base64);
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    
    return new Response(text, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response("Error processing request", { status: 500 });
  }
}

function fileToGenerativePart(base64Data: string) {
  const [header, data] = base64Data.split(',');
  const mimeType = header.split(':')[1].split(';')[0];
  
  return {
    inlineData: {
      data: data,
      mimeType: mimeType,
    },
  };
}
