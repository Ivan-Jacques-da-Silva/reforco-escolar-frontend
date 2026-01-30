import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'success', 'error', 'warning', 'confirm'
    confirmLabel: 'OK',
    cancelLabel: 'Cancelar',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const showModal = useCallback(({ 
    title = '', 
    message = '', 
    type = 'info', 
    confirmLabel, 
    cancelLabel = 'Cancelar', 
    showCancel,
    onConfirm,
    onCancel,
    buttonVariant
  }) => {
    // Definir defaults baseados no tipo
    let defaultTitle = 'Atenção';
    let defaultShowCancel = false;
    let defaultConfirmLabel = 'OK';

    switch (type) {
      case 'error':
        defaultTitle = 'Erro';
        break;
      case 'success':
        defaultTitle = 'Sucesso';
        break;
      case 'confirm':
        defaultTitle = 'Confirmação';
        defaultShowCancel = true;
        defaultConfirmLabel = 'Confirmar';
        break;
      default:
        break;
    }

    setModalState({
      isOpen: true,
      title: title || defaultTitle,
      message,
      type,
      confirmLabel: confirmLabel || defaultConfirmLabel,
      cancelLabel,
      showCancel: showCancel !== undefined ? showCancel : defaultShowCancel,
      onConfirm,
      onCancel,
      buttonVariant
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ modalState, showModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
