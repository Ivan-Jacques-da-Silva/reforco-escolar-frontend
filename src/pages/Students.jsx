import React, { useState, useEffect } from 'react';
import StudentsList from '../components/Students/StudentsList';
import StudentForm from '../components/Students/StudentForm';
import DeleteConfirmModal from '../components/Students/DeleteConfirmModal';
import { useToast } from '../components/common/Toast';
import { studentsApi } from '../services/studentsApi';

const Students = () => {
  const { success, error, ToastContainer } = useToast();
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

      setStudents(response.students);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      const errorMessage = 'Erro ao carregar alunos. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
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
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteStudent = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async (studentId) => {
    try {
      setDeleteLoading(true);
      await studentsApi.delete(studentId);
      
      // Recarregar lista
      await loadStudents(pagination.page);
      
      // Fechar modal
      setShowDeleteModal(false);
      setSelectedStudent(null);
      
      // Mostrar mensagem de sucesso
      success('Aluno excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
      const errorMessage = 'Erro ao excluir aluno. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
    } finally {
      setDeleteLoading(false);
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
      error(errorMessage);
      throw err; // Re-throw para que o formulário possa tratar
    }
  };

  // Cancelar operações
  const handleCancel = () => {
    setShowForm(false);
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gerencie os alunos cadastrados no sistema
              </p>
            </div>
            <button
              onClick={handleAddStudent}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Aluno
            </button>
          </div>
        </div>

        {/* Mensagem de erro global */}
        {error && (
          <div className="px-4 sm:px-0 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError('')}
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

        {/* Lista de alunos */}
        <div className="px-4 sm:px-0">
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
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && selectedStudent && (
        <DeleteConfirmModal
          student={selectedStudent}
          loading={deleteLoading}
          onConfirm={() => handleConfirmDelete(selectedStudent.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {ToastContainer()}
    </div>
  );
};

export default Students;