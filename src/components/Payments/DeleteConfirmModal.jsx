import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ payment, loading, onConfirm, onCancel }) => {
  const formatCurrency = (value) => {
    const num = Number(value);
    if (value == null || !isFinite(num)) return '--';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Excluir Pagamento
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Tem certeza que deseja excluir o pagamento de <strong>{payment.reference}</strong> para o aluno{' '}
                <strong>{payment.student?.name || 'N/A'}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Valor: <strong>{formatCurrency(payment.amount)}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
