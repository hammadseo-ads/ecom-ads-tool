import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

interface ImageModalProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImageModal({ src, alt, className, style }: ImageModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <img 
            src={src} 
            alt={alt} 
            className={`transition-all duration-300 group-hover:scale-105 ${className || ''}`}
            style={style}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0">
        <div className="relative">
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto max-h-[90vh] object-contain mx-auto"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}