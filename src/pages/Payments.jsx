import React, { useState, useEffect } from 'react';
import PaymentsList from '../components/Payments/PaymentsList';
import PaymentForm from '../components/Payments/PaymentForm';
import DeleteConfirmModal from '../components/Payments/DeleteConfirmModal';
import { useToast } from '../components/common/Toast';
import { paymentsApi } from '../services/paymentsApi';

const Payments = () => {
  const { success, error, ToastContainer } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPayments = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setGlobalError('');
      
      const response = await paymentsApi.getAll({
        page,
        limit: pagination.limit,
        ...newFilters
      });

      setPayments(response.payments || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.pages || 0
      });
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      const errorMessage = 'Erro ao carregar pagamentos. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handlePageChange = (newPage) => {
    loadPayments(newPage);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    loadPayments(1, newFilters);
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleDeletePayment = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPayment) return;

    try {
      setDeleteLoading(true);
      await paymentsApi.delete(selectedPayment.id);
      
      await loadPayments(pagination.page);
      
      setShowDeleteModal(false);
      setSelectedPayment(null);
      
      success('Pagamento excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir pagamento:', err);
      const errorMessage = 'Erro ao excluir pagamento. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMarkAsPaid = async (payment) => {
    try {
      await paymentsApi.markAsPaid(payment.id, 'Manual', 'Pagamento confirmado');
      
      await loadPayments(pagination.page);
      
      success('Pagamento marcado como pago');
    } catch (err) {
      console.error('Erro ao marcar pagamento como pago:', err);
      error('Erro ao marcar pagamento como pago. Tente novamente.');
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        await paymentsApi.update(editingPayment.id, paymentData);
        success('Pagamento atualizado com sucesso');
      } else {
        await paymentsApi.create(paymentData);
        success('Pagamento criado com sucesso');
      }
      
      await loadPayments(pagination.page);
      
      setShowForm(false);
      setEditingPayment(null);
    } catch (err) {
      console.error('Erro ao salvar pagamento:', err);
      const errorMessage = editingPayment 
        ? 'Erro ao atualizar pagamento. Tente novamente.'
        : 'Erro ao criar pagamento. Tente novamente.';
      error(errorMessage);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gerencie cobranças e mensalidades dos alunos
              </p>
            </div>
            <button
              onClick={handleAddPayment}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Pagamento
            </button>
          </div>
        </div>

        {globalError && (
          <div className="px-4 sm:px-0 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{globalError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setGlobalError('')}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-0">
          <PaymentsList
            payments={payments}
            loading={loading}
            error={globalError}
            pagination={pagination}
            filters={filters}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onEdit={handleEditPayment}
            onDelete={handleDeletePayment}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      </div>

      {showForm && (
        <PaymentForm
          payment={editingPayment}
          onSave={handleSavePayment}
          onCancel={() => {
            setShowForm(false);
            setEditingPayment(null);
          }}
        />
      )}

      {showDeleteModal && selectedPayment && (
        <DeleteConfirmModal
          payment={selectedPayment}
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedPayment(null);
          }}
        />
      )}

      {ToastContainer()}
    </div>
  );
};

export default Payments;
