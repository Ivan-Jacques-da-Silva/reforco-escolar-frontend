import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { Button } from '@/components/ui/button';

const GlobalModal = () => {
  const { modalState, closeModal } = useModal();
  const { 
    isOpen, 
    title, 
    message, 
    type, 
    confirmLabel, 
    cancelLabel, 
    showCancel, 
    onConfirm, 
    onCancel,
    buttonVariant: customButtonVariant 
  } = modalState;

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setIsLoading(false);
  }, [isOpen]);

  // Fechar ao clicar no overlay
  const handleOverlayClick = (e) => {
    if (isLoading) return; // Não fecha se estiver carregando
    if (e.target === e.currentTarget) {
      if (onCancel) onCancel();
      closeModal();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      const result = onConfirm();
      if (result instanceof Promise) {
        setIsLoading(true);
        try {
          await result;
          closeModal();
        } catch (error) {
          // console.error("Erro na confirmação do modal:", error);
          setIsLoading(false);
        }
      } else {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    if (onCancel) onCancel();
    closeModal();
  };

  // Configuração de ícones e cores baseada no tipo
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          buttonVariant: 'default',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          buttonVariant: 'destructive',
          buttonClass: ''
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bgColor: 'bg-amber-100',
          buttonVariant: 'default',
          buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'confirm':
        return {
          icon: Info,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          buttonVariant: 'default',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default: // info
        return {
          icon: Info,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          buttonVariant: 'default',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  
  // Permitir override do buttonVariant via props
  const finalButtonVariant = customButtonVariant || config.buttonVariant;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-[101]"
          >
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${config.bgColor} ${config.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {title}
                </h3>
                
                <p className="text-gray-500 text-sm mb-6">
                  {message}
                </p>

                <div className="flex gap-3 w-full">
                  {showCancel && (
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-1 rounded-xl"
                    >
                      {cancelLabel}
                    </Button>
                  )}
                  <Button 
                    variant={finalButtonVariant === 'destructive' ? 'destructive' : 'default'}
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className="flex-1 rounded-xl"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {confirmLabel}
                  </Button>
                </div>
              </div>
            </div>

            {/* Close X button */}
            {!isLoading && (
              <button 
                onClick={handleCancel}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalModal;
