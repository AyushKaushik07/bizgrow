import { Badge } from "@/components/ui/badge"
import { useChat } from '@ai-sdk/react';
import React from 'react'
import MessageBox from "./messageBox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownLeft, Loader2 } from "lucide-react";

type Props = {
    reportData: string
}

const ChatComponent = ({ reportData }: Props) => {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/bizchatgemini',
        onError: (error) => {
            console.error('Chat error:', error);
        }
    });

    return (
        <div className='h-full bg-muted/50 relative flex flex-col min-h-[50vh] rounded-xl p-4 gap-4'>
            <Badge 
                className={'absolute right-3 top-1.5' + (reportData ? ' bg-[#00B612]' : '')} 
                variant={'outline'}
            >
                {reportData ? 'Report Added' : 'No Report Added'}
            </Badge>
            
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {messages.map((m, idx) => (
                        <MessageBox key={idx} role={m.role} content={m.content} />
                    ))}
                    
                    {error && (
                        <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-red-700">Error: {error.message}</p>
                        </div>
                    )}
                </div>
            </div>
            
            <form 
                className="relative overflow-hidden rounded-lg border bg-background"
                onSubmit={(event) => {
                    event.preventDefault();
                    console.log('Submitting chat form with:', { input, reportData });
                    handleSubmit(event, {
                        data: { reportData: reportData }
                    });
                }}
            >
                <Textarea 
                    value={input} 
                    onChange={handleInputChange}
                    placeholder="Type your query here..."
                    className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center p-3 pt-0">
                    <Button 
                        disabled={isLoading} 
                        className="ml-auto" 
                        type="submit" 
                        size={'sm'}
                    >
                        {isLoading ? "Analyzing" : "Ask"}
                        {isLoading ? 
                            <Loader2 className="size-3.5 animate-spin ml-2"/> : 
                            <CornerDownLeft className="size-3.5 ml-2"/>
                        }
                    </Button>
                </div>
            </form>
        </div> 
    )
} 

export default ChatComponent;
