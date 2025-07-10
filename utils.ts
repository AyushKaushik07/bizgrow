import { Pinecone } from "@pinecone-database/pinecone";
import { InferenceClient } from "@huggingface/inference";

export async function queryPineconeVectorStore(
    client: Pinecone,
    indexname: string,
    namespace: string,
    searchQuery: string
): Promise<string> {
    try {
        console.log('Starting Pinecone query...');
        
        if (!process.env.HUGGINGFACE_TOKEN) {
            throw new Error('HUGGINGFACE_TOKEN not found in environment variables');
        }

        const hf = new InferenceClient(process.env.HUGGINGFACE_TOKEN);
        
        console.log('Getting embeddings...');
        const hfOutput = await hf.featureExtraction({
            model: 'mixedbread-ai/mxbai-embed-large-v1',
            inputs: searchQuery
        });
        
        const queryEmbedding = Array.from(hfOutput);
        console.log('Embeddings generated, querying Pinecone...');
        
        const index = client.Index(indexname);
        
        const queryResponse = await index.namespace(namespace).query({
            topK: 5,
            vector: queryEmbedding as any,
            includeMetadata: true,
            includeValues: false,
        });

        console.log('Pinecone query completed, matches found:', queryResponse.matches.length);

        if (queryResponse.matches.length > 0) {
            return queryResponse.matches.map((match, idx) => {
                const content = match.metadata?.text || match.metadata?.chunk || 'No content available';
                return `**Finding ${idx+1}:** ${content}\n\n`;
            }).join('');
        } else {
            return "No relevant findings available in the database.";
        }
    } catch (error) {
        console.error('Pinecone query error:', error);
        throw new Error(`Pinecone query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}.
