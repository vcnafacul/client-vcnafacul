import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ComponentProps, useRef, useState } from "react";
import "./style.css";

interface UploadButtonProps extends Omit<ComponentProps<"input">, "onError"> {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // em MB
  onError?: (error: string) => void;
  variant?: "default" | "compact"; // Nova prop para variantes
}

function UploadButton({
  onChange,
  className = "",
  placeholder = "Selecionar arquivo",
  accept,
  maxSize = 10,
  onError,
  variant = "default",
  ...props
}: UploadButtonProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validar tamanho do arquivo
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`;
      onError?.(errorMsg);
      return;
    }

    // Validar tipo de arquivo
    if (
      accept &&
      !accept.split(",").some((type) => {
        const cleanType = type.trim().replace(".", "");
        return (
          file.name.toLowerCase().endsWith(cleanType.toLowerCase()) ||
          file.type.includes(cleanType)
        );
      })
    ) {
      const errorMsg = `Tipo de arquivo não permitido. Tipos aceitos: ${accept}`;
      onError?.(errorMsg);
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    // Simular upload (você pode remover isso se não precisar)
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      onChange(event);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
      // Criar evento sintético para compatibilidade
      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`upload-container ${className}`}>
      <div
        className={`upload-area ${variant} ${isDragOver ? "drag-over" : ""} ${
          selectedFile ? "has-file" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept={accept}
          style={{ display: "none" }}
          {...props}
        />

        {selectedFile ? (
          <div className={`file-selected ${variant}`}>
            <div className="file-info">
              <DocumentIcon className="file-icon" />
              <div className="file-details">
                <span className="file-name">{selectedFile.name}</span>
                {variant === "default" && (
                  <span className="file-size">
                    {formatFileSize(selectedFile.size)}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={handleRemove}
              aria-label="Remover arquivo"
            >
              <XMarkIcon className="remove-icon" />
            </button>
          </div>
        ) : (
          <div className={`upload-content ${variant}`}>
            <CloudArrowUpIcon className="upload-icon" />
            <div className="upload-text">
              <span className="upload-label">{placeholder}</span>
              {variant === "default" && (
                <>
                  <span className="upload-hint">
                    Arraste e solte ou clique para selecionar
                  </span>
                  {accept && (
                    <span className="upload-accept">
                      Tipos aceitos: {accept}
                    </span>
                  )}
                  <span className="upload-size">
                    Tamanho máximo: {maxSize}MB
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadButton;
