import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const prompt = `Attached is an image of the Industry report.
Go over the industry report and identify markers that show slight or large abnormalities.
Then summarize in 200 words. You may increase the word limit if the report has multiple pages.
Make sure to include numerical values and key details from the report including report title.
Also identify the surrounding competition and suggest suitable approaches to make great progress in the industry
## summary`;

export async function POST(req: Request) {
  try {
    const { base64 } = await req.json();
    
    const imagePart = fileToGenerativePart(base64);
    
    // Generate content with both text and image
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    
    console.log(text);
    
    // Return the actual response instead of dummy text
    return new Response(text, { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response("Error processing request", { status: 500 });
  }
}

function fileToGenerativePart(base64Data: string) {
  // Extract mime type and data from data URL
  const [header, data] = base64Data.split(',');
  const mimeType = header.split(':')[1].split(';')[0];
  
  return {
    inlineData: {
      data: data,
      mimeType: mimeType,
    },
  };
}
