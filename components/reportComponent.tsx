'use client';

import React, { ChangeEvent, useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { toast } from "sonner"

type Props = {
  onReportConfirmation?: (data: string) => void;
}

const ReportComponent = ({ onReportConfirmation }: Props) => {
    const [base64Data, setBase64Data] = useState("");
    const [summary, setSummary] = useState(""); 
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        toast.success("Report component loaded");
    }, []);

    function handleReportSelection(event: ChangeEvent<HTMLInputElement>): void {
        if(!event.target.files) return;
        const file = event.target.files[0];
        if(file){
            let isValidImage = false;
            let isValidDoc = false;

            const validImages = ['image/jpeg', 'image/png', 'image/webp'];
            const validDocs = ['application/pdf'];

            if(validImages.includes(file.type)){
                isValidImage = true;
            }
            if(validDocs.includes(file.type)){
                isValidDoc = true;
            }

            if(!(isValidImage || isValidDoc)) {
                toast.error("Invalid File Type", {
                    description: "Please upload PDF or image files only",
                });
                return;
            }

            if (isValidDoc) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const fileContent = reader.result as string;
                    console.log(fileContent);
                    toast.success("PDF Uploaded Successfully");
                    setBase64Data(fileContent);
                }
                reader.readAsDataURL(file);
            }

            if (isValidImage) {
                compressImage(file, (compressedFile: File) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const fileContent = reader.result as string;
                        console.log(fileContent);
                        toast.success("Image Compressed & Uploaded");
                        setBase64Data(fileContent);
                    }
                    reader.readAsDataURL(compressedFile);                                
                });                
            }
        }
    }

    async function extractDetails(): Promise<void> {
        if (!base64Data) {
            toast.error("Upload Required", {
                description: 'Upload a valid report!',
            });
            return;
        }
        
        setIsLoading(true);
        
        try {
            toast.info("Extracting details...", {
                description: "This may take a few moments"
            });

            const response = await fetch('/api/extractreportgemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base64: base64Data
                })
            });
            
            if (response.ok) {
                const reportText = await response.text();
                console.log(reportText);
                setSummary(reportText);
                toast.success("Report Extracted Successfully");
            } else {
                toast.error("Extraction Failed", {
                    description: "Failed to extract report data"
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Network Error", {
                description: "Unable to connect to the server"
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleConfirmation = () => {
        if (summary && onReportConfirmation) {
            onReportConfirmation(summary);
        }
    };

    return (
        <div className='grid w-full items-start gap-6 overflow-auto p-4 pt-0'>
            <fieldset className='relative grid gap-6 rounded-lg border p-4'>
                <legend className='text-sm font-medium'>Report</legend>
                {isLoading && (
                    <div className='absolute z-10 w-full h-full bg-card/90 rounded-lg flex flex-row items-center justify-center'>
                        <div className='text-sm font-medium'>Extracting...</div>
                    </div>
                )}
                <Input type='file' onChange={handleReportSelection}/>
                <Button onClick={extractDetails} disabled={isLoading}>
                    {isLoading ? "Processing..." : "1. Upload File"}
                </Button>
                <Label>Report Summary</Label>
                <textarea
                   value={summary}
                   onChange={(e) => setSummary(e.target.value)}
                   placeholder='Extracted data from the documents will appear here. Get better recommendations by providing additional Company history and details...'
                   className='min-h-72 resize-none border-0 p-3 shadow-none focus-visible:ring-0'
                   disabled={isLoading}
                />
                <Button 
                    variant={'destructive'} 
                    className='bg-[#D90013]' 
                    disabled={isLoading || !summary}
                    onClick={handleConfirmation}
                >
                    2. Looks Good to Go
                </Button>
            </fieldset>
        </div>
    );
}

export default ReportComponent;

function compressImage(file: File, callback: (compressedFile: File) => void) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx!.drawImage(img, 0, 0);

            const quality = 0.1;
            const dataURL = canvas.toDataURL('image/jpeg', quality);

            const byteString = atob(dataURL.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const compressedFile = new File([ab], file.name, { type: 'image/jpeg'});

            callback(compressedFile);
        };
        img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
}
