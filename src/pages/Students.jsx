import React, { useState, useEffect } from 'react';
import StudentsList from '../components/Students/StudentsList';
import StudentForm from '../components/Students/StudentForm';
import { useToast } from '../components/common/Toast';
import { useModal } from '../contexts/ModalContext';
import { studentsApi } from '../services/studentsApi';
import { paymentsApi } from '../services/paymentsApi';
import { Button } from '../components/ui/button';

const Students = ({ embedded = false }) => {
  const { success, error: toastError, ToastContainer } = useToast();
  const { showModal } = useModal();
  const [students, setStudents] = useState([]);
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

  // Estados dos modais
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Carregar alunos
  const loadStudents = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setGlobalError('');
      
      const response = await studentsApi.getAll({
        page,
        limit: pagination.limit,
        ...newFilters
      });

      setStudents(response.students || []);
      const pg = response.pagination || {};
      setPagination({
        page: pg.page || 1,
        limit: pg.limit || pagination.limit,
        total: pg.total || 0,
        totalPages: pg.pages || 0
      });
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      const errorMessage = 'Erro ao carregar alunos. Tente novamente.';
      setGlobalError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Carregar alunos na inicialização
  useEffect(() => {
    loadStudents();
  }, []);

  // Manipular mudança de página
  const handlePageChange = (newPage) => {
    loadStudents(newPage);
  };

  // Manipular filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    loadStudents(1, newFilters);
  };

  // Abrir formulário para novo aluno
  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  // Abrir formulário para editar aluno
  const handleEditStudent = async (student) => {
    try {
      // Carregar dados completos do aluno (incluindo pagamentos)
      const fullStudent = await studentsApi.getById(student.id);
      setEditingStudent(fullStudent);
      setShowForm(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes do aluno:', error);
      toastError('Erro ao carregar detalhes do aluno');
    }
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteStudent = (student) => {
    showModal({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o aluno: ${student.name}? Esta ação não pode ser desfeita.`,
      type: 'confirm',
      confirmLabel: 'Excluir',
      buttonVariant: 'destructive',
      onConfirm: () => handleConfirmDelete(student.id)
    });
  };

  // Confirmar exclusão
  const handleConfirmDelete = async (studentId) => {
    try {
      await studentsApi.delete(studentId);
      
      // Recarregar lista
      await loadStudents(pagination.page);
      
      // Mostrar mensagem de sucesso
      success('Aluno excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
      const errorMessage = 'Erro ao excluir aluno. Tente novamente.';
      setGlobalError(errorMessage);
      toastError(errorMessage);
      throw err;
    }
  };

  // Salvar aluno (criar ou editar)
  const handleSaveStudent = async (studentData) => {
    try {
      if (editingStudent) {
        // Editar aluno existente
        await studentsApi.update(editingStudent.id, studentData);
        success('Aluno atualizado com sucesso');
      } else {
        // Criar novo aluno
        // Separar dados financeiros dos dados do aluno
        const { financialType, amount, installments, dueDateDay, ...studentInfo } = studentData;
        
        // Passar tudo para a API, pois o backend agora lida com a criação dos pagamentos
        await studentsApi.create(studentData);
        success('Aluno criado com sucesso');
      }
      
      // Recarregar lista
      await loadStudents(pagination.page);
      
      // Fechar modal
      setShowForm(false);
      setEditingStudent(null);
    } catch (err) {
      console.error('Erro ao salvar aluno:', err);
      const errorMessage = editingStudent 
        ? 'Erro ao atualizar aluno. Tente novamente.'
        : 'Erro ao criar aluno. Tente novamente.';
      toastError(errorMessage);
      throw err; // Re-throw para que o formulário possa tratar
    }
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50"}>
      <div className={embedded ? "" : "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"}>
        {/* Cabeçalho (oculto quando embutido no Dashboard) */}
        {!embedded && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Gerencie os alunos cadastrados no sistema
                </p>
              </div>
              <Button onClick={handleAddStudent} className="gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Novo Aluno
              </Button>
            </div>
          </div>
        )}

        {/* Mensagem de erro global */}
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

        {/* Ações rápidas (quando embutido no painel) */}
        {embedded && (
          <div className="px-4 sm:px-0 mb-4 flex justify-end">
            <Button onClick={handleAddStudent} className="gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Aluno
            </Button>
          </div>
        )}

        {/* Lista de alunos */}
        <div className={embedded ? "" : "px-4 sm:px-0"}>
          <StudentsList
            students={students}
            loading={loading}
            error={globalError}
            pagination={pagination}
            filters={filters}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        </div>
      </div>

      {/* Modal do formulário */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
          isOpen={showForm}
        />
      )}

      {ToastContainer()}
    </div>
  );
};

export default Students;
