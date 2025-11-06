import React, { useState, useEffect } from 'react';
import MaterialsList from '../components/Materials/MaterialsList';
import MaterialForm from '../components/Materials/MaterialForm';
import DeleteConfirmModal from '../components/Materials/DeleteConfirmModal';
import { useToast } from '../components/common/Toast';
import { materialsApi } from '../services/materialsApi';

const Materials = () => {
  const { success, error, ToastContainer } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadMaterials = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setGlobalError('');
      
      const response = await materialsApi.getAll({
        page,
        limit: pagination.limit,
        ...newFilters
      });

      setMaterials(response.materials || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.pages || 0
      });
    } catch (err) {
      console.error('Erro ao carregar materiais:', err);
      const errorMessage = 'Erro ao carregar materiais. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handlePageChange = (newPage) => {
    loadMaterials(newPage);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    loadMaterials(1, newFilters);
  };

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDeleteMaterial = (material) => {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMaterial) return;

    try {
      setDeleteLoading(true);
      await materialsApi.delete(selectedMaterial.id);
      
      await loadMaterials(pagination.page);
      
      setShowDeleteModal(false);
      setSelectedMaterial(null);
      
      success('Material excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir material:', err);
      const errorMessage = 'Erro ao excluir material. Tente novamente.';
      setGlobalError(errorMessage);
      error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveMaterial = async (materialData) => {
    try {
      if (editingMaterial) {
        await materialsApi.update(editingMaterial.id, materialData);
        success('Material atualizado com sucesso');
      } else {
        await materialsApi.create(materialData);
        success('Material criado com sucesso');
      }
      
      await loadMaterials(pagination.page);
      
      setShowForm(false);
      setEditingMaterial(null);
    } catch (err) {
      console.error('Erro ao salvar material:', err);
      const errorMessage = editingMaterial 
        ? 'Erro ao atualizar material. Tente novamente.'
        : 'Erro ao criar material. Tente novamente.';
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
              <h1 className="text-3xl font-bold text-gray-900">Materiais</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gerencie o estoque de materiais escolares
              </p>
            </div>
            <button
              onClick={handleAddMaterial}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Material
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
          <MaterialsList
            materials={materials}
            loading={loading}
            error={globalError}
            pagination={pagination}
            filters={filters}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
          />
        </div>
      </div>

      {showForm && (
        <MaterialForm
          material={editingMaterial}
          onSave={handleSaveMaterial}
          onCancel={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
        />
      )}

      {showDeleteModal && selectedMaterial && (
        <DeleteConfirmModal
          material={selectedMaterial}
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedMaterial(null);
          }}
        />
      )}

      {ToastContainer()}
    </div>
  );
};

export default Materials;
