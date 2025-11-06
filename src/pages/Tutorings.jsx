import React, { useState, useEffect } from 'react';
import TutoringsList from '../components/Tutorings/TutoringsList';
import TutoringForm from '../components/Tutorings/TutoringForm';
import DeleteConfirmModal from '../components/Tutorings/DeleteConfirmModal';
import { useToast } from '../components/common/Toast';
import { tutoringsApi } from '../services/tutoringsApi';

const Tutorings = () => {
  const { success, error, ToastContainer } = useToast();
  const [tutorings, setTutorings] = useState([]);
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
  const [selectedTutoring, setSelectedTutoring] = useState(null);
  const [editingTutoring, setEditingTutoring] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadTutorings = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setGlobalError('');
      
      const response = await tutoringsApi.getAll({
        page,
        limit: pagination.limit,
        ...newFilters
      });

      setTutorings(response.tutorings || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.pages || 0
      });
    } catch (err) {
      console.error('Erro ao carregar reforços:', err);
      const errorMessage = 'Erro ao carregar reforços. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutorings();
  }, []);

  const handlePageChange = (newPage) => {
    loadTutorings(newPage);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    loadTutorings(1, newFilters);
  };

  const handleAddTutoring = () => {
    setEditingTutoring(null);
    setShowForm(true);
  };

  const handleEditTutoring = (tutoring) => {
    setEditingTutoring(tutoring);
    setShowForm(true);
  };

  const handleDeleteTutoring = (tutoring) => {
    setSelectedTutoring(tutoring);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTutoring) return;

    try {
      setDeleteLoading(true);
      await tutoringsApi.delete(selectedTutoring.id);
      
      await loadTutorings(pagination.page);
      
      setShowDeleteModal(false);
      setSelectedTutoring(null);
      
      success('Reforço excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir reforço:', err);
      const errorMessage = 'Erro ao excluir reforço. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCompleteTutoring = async (tutoring) => {
    try {
      await tutoringsApi.complete(tutoring.id, 'Aula concluída');
      
      await loadTutorings(pagination.page);
      
      success('Reforço marcado como concluído');
    } catch (err) {
      console.error('Erro ao concluir reforço:', err);
      error('Erro ao concluir reforço. Tente novamente.');
    }
  };

  const handleSaveTutoring = async (tutoringData) => {
    try {
      if (editingTutoring) {
        await tutoringsApi.update(editingTutoring.id, tutoringData);
        success('Reforço atualizado com sucesso');
      } else {
        await tutoringsApi.create(tutoringData);
        success('Reforço criado com sucesso');
      }
      
      await loadTutorings(pagination.page);
      
      setShowForm(false);
      setEditingTutoring(null);
    } catch (err) {
      console.error('Erro ao salvar reforço:', err);
      const errorMessage = editingTutoring 
        ? 'Erro ao atualizar reforço. Tente novamente.'
        : 'Erro ao criar reforço. Tente novamente.';
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
              <h1 className="text-3xl font-bold text-gray-900">Reforços</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gerencie as aulas e sessões de reforço escolar
              </p>
            </div>
            <button
              onClick={handleAddTutoring}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Reforço
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
          <TutoringsList
            tutorings={tutorings}
            loading={loading}
            error={globalError}
            pagination={pagination}
            filters={filters}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onEdit={handleEditTutoring}
            onDelete={handleDeleteTutoring}
            onComplete={handleCompleteTutoring}
          />
        </div>
      </div>

      {showForm && (
        <TutoringForm
          tutoring={editingTutoring}
          onSave={handleSaveTutoring}
          onCancel={() => {
            setShowForm(false);
            setEditingTutoring(null);
          }}
        />
      )}

      {showDeleteModal && selectedTutoring && (
        <DeleteConfirmModal
          tutoring={selectedTutoring}
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedTutoring(null);
          }}
        />
      )}

      {ToastContainer()}
    </div>
  );
};

export default Tutorings;
