import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import TutoringsList from '../components/Tutorings/TutoringsList';
import TutoringForm from '../components/Tutorings/TutoringForm';
import EvaluationForm from '../components/Tutorings/EvaluationForm';
import DailyEvaluations from '../components/Tutorings/DailyEvaluations';
import { useToast } from '../components/common/Toast';
import { useModal } from '../contexts/ModalContext';
import { tutoringsApi } from '../services/tutoringsApi';
import { evaluationsApi } from '../services/evaluationsApi';
import { Button } from '../components/ui/button';
import { authService, utils } from '../services/api';

const Tutorings = ({ embedded = false, user: propUser }) => {
  const user = propUser || utils.getCurrentUser();
  const { success, error: toastError, ToastContainer } = useToast();
  const { showModal } = useModal();
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
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showDailyEvaluations, setShowDailyEvaluations] = useState(false);
  const [selectedTutoring, setSelectedTutoring] = useState(null);
  const [editingTutoring, setEditingTutoring] = useState(null);

  const loadTutorings = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setGlobalError('');
      
      const apiFilters = { ...newFilters };
      
      // Se for estudante, filtrar apenas os próprios reforços
      if (user?.role === 'STUDENT') {
        apiFilters.studentId = user.id;
      }

      const response = await tutoringsApi.getAll({
        page,
        limit: pagination.limit,
        ...apiFilters
      });

      setTutorings(response.tutorings || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.pages || 0
      });
    } catch (err) {
      console.error('Erro ao carregar reforcos:', err);
      const errorMessage = 'Erro ao carregar reforços. Tente novamente.';
      setGlobalError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadTutorings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  const handleEvaluate = (tutoring) => {
    setSelectedTutoring(tutoring);
    setShowEvaluationForm(true);
  };

  const handleDeleteTutoring = (tutoring) => {
    showModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o reforço de ${tutoring.subject}? Esta ação não pode ser desfeita.`,
      type: 'confirm',
      confirmLabel: 'Excluir',
      buttonVariant: 'destructive',
      onConfirm: () => handleConfirmDelete(tutoring.id)
    });
  };

  const handleConfirmDelete = async (tutoringId) => {
    try {
      await tutoringsApi.delete(tutoringId);

      await loadTutorings(pagination.page);

      success('Reforço excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir reforço:', err);
      const errorMessage = 'Erro ao excluir reforço. Tente novamente.';
      setGlobalError(errorMessage);
      toastError(errorMessage);
      throw err;
    }
  };

  const handleCompleteTutoring = async (tutoring) => {
    try {
      await tutoringsApi.complete(tutoring.id, 'Aula concluída');

      await loadTutorings(pagination.page);

      success('Reforço marcado como concluído');
    } catch (err) {
      console.error('Erro ao concluir reforço:', err);
      toastError('Erro ao concluir reforço. Tente novamente.');
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
      toastError(errorMessage);
      throw err;
    }
  };

  const handleSaveEvaluation = async (evaluationData) => {
    try {
      await evaluationsApi.create(evaluationData);
      success('Avaliação registrada com sucesso!');
      setShowEvaluationForm(false);
      setSelectedTutoring(null);
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
      toastError('Erro ao registrar avaliação. Tente novamente.');
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50'}>
      <div className={embedded ? '' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}>
        {!embedded && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reforços</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Gerencie as aulas e sessões de reforço escolar
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowDailyEvaluations(true)} variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Histórico por Dia
                </Button>
                <Button onClick={handleAddTutoring} className="gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Novo Reforço
                </Button>
              </div>
            </div>
          </div>
        )}

        {embedded && (
          <div className="px-4 sm:px-0 mb-4 flex justify-end gap-2">
            <Button onClick={() => setShowDailyEvaluations(true)} variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Histórico por Dia
            </Button>
            <Button onClick={handleAddTutoring} className="gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Reforço
            </Button>
          </div>
        )}

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

        <div className={embedded ? '' : 'px-4 sm:px-0'}>
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
            onEvaluate={handleEvaluate}
            onViewDailyEvaluations={() => setShowDailyEvaluations(true)}
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

      {showEvaluationForm && selectedTutoring && (
        <EvaluationForm
          tutoring={selectedTutoring}
          onSave={handleSaveEvaluation}
          onCancel={() => {
            setShowEvaluationForm(false);
            setSelectedTutoring(null);
          }}
        />
      )}

      {showDailyEvaluations && (
        <DailyEvaluations
          onClose={() => setShowDailyEvaluations(false)}
        />
      )}

      {ToastContainer()}
    </div>
  );
};

export default Tutorings;
