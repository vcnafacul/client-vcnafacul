/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const options = {
      styleMap: [
        /* "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh", */
        // Adicione mapeamentos adicionais conforme necessário
      ]
    };
    const { value, messages } = await mammoth.convertToHtml({ arrayBuffer }, options);
    const images: ImageMessage[] = (messages as Message[])
          .filter(isImageMessage);
    
    const processedHtml = images.reduce((html, image) => {
      const base64Image = `data:${image.contentType};base64,${btoa(String.fromCharCode(...image.content))}`;
      return html.replace(`src="${image.src}"`, `src="${base64Image}"`);
    }, value);

    return processedHtml;
  }

  function addTargetBlankToLinks(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const links = doc.querySelectorAll('a');
  
    links.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer'); // Boa prática para segurança
    });
  
    return doc.body.innerHTML;
  }

  const extractYoutubeVideoId = (youtubeUrl: string) => {
    return youtubeUrl.replace('https://www.youtube.com/watch?v=', '')
  }

  const convertYoutubeLinksToIframes = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const links = doc.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"]');
  
    links.forEach((link: any) => {
      const videoId = extractYoutubeVideoId(link.getAttribute('href')!);
      if (videoId) {
        const iframe = createYoutubeIframe(videoId);
        link.parentNode.replaceChild(iframe, link);
      }
    });
  
    return doc.body.innerHTML;
  }

  const createYoutubeIframe = (videoId: string) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', '560');
    iframe.setAttribute('height', '315');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
    iframe.setAttribute('title', 'YouTube video player');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');
    return iframe;
  }
  
  

  useEffect(() => {
    const loadDocx = async () => {
      try {
        if (arrayBuffer) {
          const htmlContent = await convertDocxToHtml(undefined, arrayBuffer);
          const htmlWithYoutubeIframes = convertYoutubeLinksToIframes(htmlContent!);
          setHtmlContent(htmlWithYoutubeIframes.replace('&amp;t', '').replace('</a>', '</a> ') as string);
        } else if (docxFilePath) {
          const response = await fetchWrapper(docxFilePath);
          const blob = await response.blob();
          const htmlContent = await convertDocxToHtml(blob, undefined);
          const htmlWithBlankTarget = addTargetBlankToLinks(htmlContent as string);
          const htmlWithYoutubeIframes = convertYoutubeLinksToIframes(htmlWithBlankTarget!);
          setHtmlContent(htmlWithYoutubeIframes as string);
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
