import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../services/api';

const StudentsList = ({ 
  students, 
  loading, 
  pagination, 
  filters, 
  onPageChange, 
  onFiltersChange,
  onEdit,
  onDelete
}) => {
  // Estado local para busca com debounce
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Estado do modo de visualização (grid ou list), persistido no localStorage
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('studentsViewMode') || 'grid');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('studentsViewMode', mode);
  };

  // Atualizar searchTerm quando filters.search mudar externamente
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = (searchTerm || '').trim();
      if (trimmed !== (filters.search || '')) {
        onFiltersChange({ ...filters, search: trimmed });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onFiltersChange, filters]);

  const Avatar = ({ url, name }) => {
    const [imgError, setImgError] = useState(false);
    const imageUrl = url ? getImageUrl(url) : null;

    if (imageUrl && !imgError) {
      return (
        <img 
          src={imageUrl} 
          alt={name} 
          className="h-8 w-8 rounded-full object-cover border border-gray-200"
          onError={() => setImgError(true)}
        />
      );
    }

    return (
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
        {name?.charAt(0).toUpperCase() || 'A'}
      </div>
    );
  };
  
  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'INACTIVE':
        return 'Inativo';
      case 'SUSPENDED':
        return 'Suspenso';
      default:
        return 'Indefinido';
    }
  };

  // Manipular mudança de filtros
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    const newFilters = { ...filters, status: e.target.value };
    onFiltersChange(newFilters);
  };

  // Renderizar paginação
  const renderPagination = () => {
    // Validar se pagination tem valores válidos
    const currentPage = Number(pagination.page) || 1;
    const totalPages = Number(pagination.totalPages) || 1;
    const limit = Number(pagination.limit) || 10;
    const total = Number(pagination.total) || 0;

    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Calcular valores para exibição
    const startItem = Math.max(1, ((currentPage - 1) * limit) + 1);
    const endItem = Math.min(currentPage * limit, total);

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startItem}</span> até{' '}
              <span className="font-medium">{endItem}</span>{' '}
              de <span className="font-medium">{total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Importante: não interromper renderização dos filtros durante loading,
  // para manter o foco no campo de busca

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Filtros e Controles de Visualização */}
      <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 flex-grow w-full sm:w-auto">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome ou email..."
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="SUSPENDED">Suspenso</option>
              </select>
            </div>
          </div>
          
          {/* Botões de Alternância de Visualização */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              title="Visualização em Grade"
              className={`px-3 py-2 text-sm font-medium border rounded-l-md transition-colors ${
                viewMode === 'grid' 
                ? 'bg-blue-50 text-blue-700 border-blue-200 z-10 ring-1 ring-blue-200' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              title="Visualização em Lista"
              className={`px-3 py-2 text-sm font-medium border rounded-r-md transition-colors -ml-px ${
                viewMode === 'list' 
                ? 'bg-blue-50 text-blue-700 border-blue-200 z-10 ring-1 ring-blue-200' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Lista responsiva */}
      {loading && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Carregando...</span>
          </div>
        </div>
      )}
      {students.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-lg font-medium">Nenhum aluno encontrado</p>
            <p className="text-sm">Tente ajustar os filtros ou adicione um novo aluno</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* Grid de Cards Responsivo */
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {students.map((student) => (
                <div key={student.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-full">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex-shrink-0">
                        <Avatar url={student.avatarUrl} name={student.name} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate" title={student.name}>
                          {student.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate" title={student.email}>
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(student.status)}`}>
                      {getStatusText(student.status)}
                    </span>
                  </div>

                  {/* Corpo do Card */}
                  <div className="space-y-2 text-sm flex-grow">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-1">
                      <span className="text-gray-500 text-xs uppercase tracking-wider">Telefone</span>
                      <span className="font-medium text-gray-700 truncate ml-2" title={student.phone || '-'}>{student.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-1">
                      <span className="text-gray-500 text-xs uppercase tracking-wider">Série</span>
                      <span className="font-medium text-gray-700 truncate ml-2" title={student.grade || '-'}>{student.grade || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-1">
                      <span className="text-gray-500 text-xs uppercase tracking-wider">Cadastro</span>
                      <span className="font-medium text-gray-700 truncate ml-2">{formatDate(student.createdAt)}</span>
                    </div>
                  </div>

                  {/* Rodapé com Ações */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button 
                      onClick={() => onEdit(student)} 
                      className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-blue-200 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      title="Editar aluno"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button 
                      onClick={() => onDelete(student)} 
                      className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-red-200 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      title="Excluir aluno"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Visualização em Lista (Tabela) */
            <div className="overflow-hidden border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Série</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastrado em</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <Avatar url={student.avatarUrl} name={student.name} />
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={student.email}>{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>{getStatusText(student.status)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(student.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => onEdit(student)} className="text-blue-600 hover:text-blue-900 p-1 rounded" title="Editar aluno">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => onDelete(student)} className="text-red-600 hover:text-red-900 p-1 rounded" title="Excluir aluno">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Paginação */}
      {renderPagination()}
    </div>
  );
};

export default StudentsList;
