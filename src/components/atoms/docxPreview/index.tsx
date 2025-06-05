import { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import './style.css';

interface DocxPreviewProps {
  arrayBuffer: ArrayBuffer;
  className?: string;
}

export default function DocxPreview({ arrayBuffer, className }: DocxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (arrayBuffer && containerRef.current) {
      containerRef.current.innerHTML = '';

      renderAsync(arrayBuffer, containerRef.current).then(() => {
        replaceYoutubeLinksWithIframes(containerRef.current!);
      }).catch((err) => {
        console.error("Erro ao renderizar o DOCX:", err);
      });
    }
  }, [arrayBuffer]);

  return (
    <div
      ref={containerRef}
      className={`docx-container ${className || ''}`}
    />
  );
}

function replaceYoutubeLinksWithIframes(container: HTMLElement) {
  const links = container.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"]');

  links.forEach((link) => {
    const url = link.getAttribute('href');
    if (!url) return;

    const videoId = extractYoutubeId(url);
    if (!videoId) return;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', '560');
    iframe.setAttribute('height', '315');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
    iframe.setAttribute('title', 'YouTube video player');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');

    link.parentElement?.replaceChild(iframe, link);
  });
}

function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v');
    }
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1); // remove a primeira `/`
    }
  } catch {
    return null;
  }
  return null;
}
