import { Message } from "ai/react";
export async function POST(req:Request, res: Response){

    const reqBody = await req.json()
    console.log(reqBody);
    const messages: Message[] = reqBody.messages;
    const userQuestion = messages[messages.length -1].content;
    const reportData = reqBody.data.reportData;
    
    const searchQuery = 'Client report says: \n${reportData} \n\n ${userQuestion}';
    return new Response("dummy response", {status: 200});
 //return result.toDataStreamResponse();
}