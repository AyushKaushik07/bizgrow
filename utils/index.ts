// utils/index.ts
import { MixedbreadAIClient } from "@mixedbread-ai/sdk";
import { Pinecone } from "@pinecone-database/pinecone";

export async function queryPineconeVectorStore(
    client: Pinecone,
    indexname: string,
    namespace: string,
    searchQuery: string
): Promise<string> {
    try {
        const mxbai = new MixedbreadAIClient({
            apiKey: process.env.MIXEDBREAD_API_KEY!
        });

        // Generate embeddings
        const embeddings = await mxbai.embeddings({
            model: "mixedbread-ai/mxbai-embed-large-v1",
            input: searchQuery,
            normalized: true
        });

        const index = client.Index(indexname);
        const queryResponse = await index.namespace(namespace).query({
            topK: 5,
            vector: embeddings.data[0].embedding,
            includeMetadata: true
        });

        if (queryResponse.matches?.length > 0) {
            return queryResponse.matches.map((m, idx) => 
                `**Finding ${idx+1}:** ${m.metadata?.chunk}`
            ).join('\n\n');
        }
        return "<no_match>";
        
    } catch (error) {
        console.error('Pinecone query error:', error);
        return "<error>";
    }
}.
