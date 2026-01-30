import React from 'react';
import { Edit, Trash2, CheckCircle, Calendar, ClipboardCheck } from 'lucide-react';

const TutoringsList = ({
  tutorings,
  loading,
  error,
  pagination,
  filters,
  onPageChange,
  onFiltersChange,
  onEdit,
  onDelete,
  onComplete,
  onEvaluate,
  onViewDailyEvaluations
}) => {
  const handleSearchChange = (e) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFiltersChange({ ...filters, status: e.target.value });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'SCHEDULED': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    const labels = {
      'SCHEDULED': 'Agendado',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar por aluno, disciplina ou assunto..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {tutorings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum reforço encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando um novo reforço escolar.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disciplina
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assunto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Próxima Aula
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tutorings.map((tutoring) => (
                  <tr key={tutoring.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tutoring.student?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tutoring.student?.grade || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tutoring.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tutoring.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tutoring.plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(tutoring.nextClass)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tutoring.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {tutoring.status === 'SCHEDULED' && onComplete && (
                          <button
                            onClick={() => onComplete(tutoring)}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como concluído"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {onEvaluate && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => onEvaluate(tutoring)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Avaliar Desempenho"
                            >
                              <ClipboardCheck className="h-5 w-5" />
                            </button>
                            {onViewDailyEvaluations && (
                              <button
                                onClick={() => onViewDailyEvaluations()}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver Histórico do Dia"
                              >
                                <Calendar className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => onEdit(tutoring)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onDelete(tutoring)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden">
            <ul className="divide-y divide-gray-200">
              {tutorings.map((tutoring) => (
                <li key={tutoring.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-lg font-semibold text-gray-900 truncate">{tutoring.student?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{tutoring.student?.grade || ''}</p>
                      </div>
                      {getStatusBadge(tutoring.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Disciplina</span>
                        <span className="font-medium text-gray-900">{tutoring.subject}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Assunto</span>
                        <span className="font-medium text-gray-900 truncate block" title={tutoring.topic}>{tutoring.topic}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Plano</span>
                        <span className="font-medium text-gray-900">{tutoring.plan}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Próx. Aula</span>
                        <span className="font-medium text-gray-900">{formatDateTime(tutoring.nextClass)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100">
                      {tutoring.status === 'SCHEDULED' && onComplete && (
                        <button onClick={() => onComplete(tutoring)} className="text-green-600 hover:text-green-900 p-2 bg-green-50 rounded-full" title="Concluir">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      {onEvaluate && (
                        <>
                          <button onClick={() => onEvaluate(tutoring)} className="text-yellow-600 hover:text-yellow-900 p-2 bg-yellow-50 rounded-full" title="Avaliar">
                            <ClipboardCheck className="h-5 w-5" />
                          </button>
                          {onViewDailyEvaluations && (
                            <button onClick={() => onViewDailyEvaluations()} className="text-blue-600 hover:text-blue-900 p-2 bg-blue-50 rounded-full" title="Histórico">
                              <Calendar className="h-5 w-5" />
                            </button>
                          )}
                        </>
                      )}
                      <button onClick={() => onEdit(tutoring)} className="text-blue-600 hover:text-blue-900 p-2 bg-gray-100 rounded-full" title="Editar">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => onDelete(tutoring)} className="text-red-600 hover:text-red-900 p-2 bg-red-50 rounded-full" title="Excluir">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> até{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                    <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => onPageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => onPageChange(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === index + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => onPageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TutoringsList;
