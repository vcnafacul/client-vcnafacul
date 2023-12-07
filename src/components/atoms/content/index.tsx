import { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import './content.css';
import fetchWrapper from '../../../utils/fetchWrapper';
import { toast } from 'react-toastify';

interface ImageMessage {
  type: "image";
  contentType: string;
  content: Uint8Array;
  src: string;
}

interface Message {
  type: string;
  // Adicione outras propriedades conforme necessário
}

interface ContentProps {
  docxFilePath?: string;
  arrayBuffer?: ArrayBuffer;
  className?: string;
}

function isImageMessage(message: Message): message is ImageMessage {
  return message.type === 'image';
}

function Content({ docxFilePath, arrayBuffer, className }: ContentProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  const convertDocxToHtml = async (docxBlob: Blob | undefined, arrayBuffer: ArrayBuffer | undefined) => {
    
    if (arrayBuffer) {
      return await convertBufferToHtml(arrayBuffer);
    } else if (docxBlob) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
  
        reader.onload = async () => {
          const arrayBufferResult = reader.result as ArrayBuffer;
  
          try {
            const processeHtml = await convertBufferToHtml(arrayBufferResult)
            resolve(processeHtml);
          } catch (error) {
            reject(error);
          }
        };
  
        reader.onerror = (error) => {
          reject(error);
        };
  
        reader.readAsArrayBuffer(docxBlob);
      });
    }
  };

  const convertBufferToHtml = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const { value, messages } = await mammoth.convertToHtml({ arrayBuffer });

    const images: ImageMessage[] = (messages as Message[])
          .filter(isImageMessage);
    
    const processedHtml = images.reduce((html, image) => {
      const base64Image = `data:${image.contentType};base64,${btoa(String.fromCharCode(...image.content))}`;
      return html.replace(`src="${image.src}"`, `src="${base64Image}"`);
    }, value);

    return processedHtml;
  }

  useEffect(() => {
    const loadDocx = async () => {
      try {
        if (arrayBuffer) {
          const htmlContent = await convertDocxToHtml(undefined, arrayBuffer);
          setHtmlContent(htmlContent as string);
        } else if (docxFilePath) {
          const response = await fetchWrapper(docxFilePath);
          const blob = await response.blob();
          const htmlContent = await convertDocxToHtml(blob, undefined);
          setHtmlContent(htmlContent as string);
        }
      } catch (error) {
        toast.error(`Error fetchWrappering or converting the .docx file: ${error}`)
      }
    };

    loadDocx();
  }, []);

  

  return (
    <div className={`${className} content`}>
      {htmlContent ? (
        <div className="content-wrapper" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Content;
