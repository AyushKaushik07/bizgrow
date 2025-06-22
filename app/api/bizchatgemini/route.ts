import { Message } from "ai";
import { Pinecone } from '@pinecone-database/pinecone'
import { queryPineconeVectorStore } from "@/utils";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: process.env.GEMINI_API_KEY
});

const model = google.generativeAI('gemini-2.0-flash');
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: Request) {
    try {
        console.log('API route called');
        
        const reqBody = await req.json();
        console.log('Request body:', reqBody);
        
        const messages: Message[] = reqBody.messages;
        const userQuestion = messages[messages.length - 1].content;
        const reportData = reqBody.data?.reportData || "";

        console.log('User question:', userQuestion);
        console.log('Report data available:', !!reportData);

        // Query Pinecone
        let retrievals = "";
        try {
            const searchQuery = `Represent this sentence for searching relevant passages: Client report says: \n${reportData} \n\n ${userQuestion}`;
            retrievals = await queryPineconeVectorStore(pc, 'index-one', 'test-space', searchQuery);
            console.log('Pinecone query successful');
        } catch (pineconeError) {
            console.error('Pinecone query failed:', pineconeError);
            retrievals = "No relevant findings available due to database connection issues.";
        }

        const finalPrompt = `
You are an industrial analysis expert. Provide a comprehensive analysis in well-structured paragraphs.

**IMPORTANT FORMATTING RULES:**
- Write in complete paragraphs separated by double line breaks
- Use clear topic sentences
- Provide detailed explanations
- Include supporting evidence

**Client's Industrial Report Summary:**
${reportData || "No specific report data provided."}

**User Query:**
${userQuestion}

**Generic Industrial Findings:**
${retrievals}

**Please provide your analysis in 3-4 well-structured paragraphs including bullet points addressing the user's query.**
`;

        console.log('Calling streamText...');

        const result = await streamText({
            model: model,
            prompt: finalPrompt,
            onError: (error) => {
                console.error('StreamText error:', error);
            },
            onFinish: (result) => {
                console.log('StreamText finished successfully');
            }
        });

        console.log('Returning stream response');
        return result.toDataStreamResponse();

    } catch (error) {
        console.error('API Error:', error);
        
        // Return a proper error response
        return new Response(
            JSON.stringify({ 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
