"use client";

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  const modalRoot = useRef<HTMLElement | null>(null);
  const modalContent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRoot.current = document.getElementById('modal-root');
    if (!modalRoot.current) {
      const div = document.createElement('div');
      div.id = 'modal-root';
      document.body.appendChild(div);
      modalRoot.current = div;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (modalContent.current && !modalContent.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!modalRoot.current) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        ref={modalContent}
        className="animate-modal-appear"
      >
        {children}
      </div>
    </div>,
    modalRoot.current
  );
} 