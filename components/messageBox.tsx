import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

type Props = {
  role: string,
  content: string
}

const MessageBox = ({ role, content }: Props) => {
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
  
  return (
    <Card className={role === 'user' ? 'ml-12' : 'mr-12'}>
      <CardContent className='p-6 text-sm'>
        <div className="space-y-3">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </CardContent>
      {role !== 'user' && (
        <CardFooter className='border-t bg-muted/50 px-6 py-3 text-xs text-muted-foreground'>
          Disclaimer: The industrial advice and recommendations provided by BizzGrow application are for informational purposes only and should not replace professional advice.
        </CardFooter>
      )}
    </Card>
  );
};

export default MessageBox;
