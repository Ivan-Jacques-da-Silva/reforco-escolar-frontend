import React from 'react';
import { Edit, Trash2, Package, AlertCircle, CheckCircle, Plus, Minus, ChevronsLeft, ChevronsRight } from 'lucide-react';

const MaterialsList = ({
  materials,
  loading,
  error,
  pagination,
  filters,
  onPageChange,
  onFiltersChange,
  onEdit,
  onDelete,
  onUpdateStock
}) => {
  const handleSearchChange = (e) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const getStockStatus = (material) => {
    const isCritical = material.quantity <= material.minimum;
    return {
      critical: isCritical,
      label: isCritical ? 'Repor' : 'OK',
      icon: isCritical ? AlertCircle : CheckCircle,
      className: isCritical
        ? 'bg-red-100 text-red-800'
        : 'bg-green-100 text-green-800'
    };
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar por SKU ou nome..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum material encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando um novo item de material.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop/tablet */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mínimo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map((material) => {
                  const status = getStockStatus(material);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={material.sku} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><span className="font-mono text-sm text-gray-900">{material.sku}</span></td>
                      <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{material.name}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onUpdateStock && onUpdateStock(material, Math.max(0, material.quantity - 5))}
                            disabled={material.quantity <= 0}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Diminuir 5"
                          >
                            <ChevronsLeft className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onUpdateStock && onUpdateStock(material, material.quantity - 1)}
                            disabled={material.quantity <= 0}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Diminuir 1"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className={`text-sm font-semibold w-8 text-center ${status.critical ? 'text-red-600' : 'text-gray-900'}`}>
                            {material.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateStock && onUpdateStock(material, material.quantity + 1)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                            title="Aumentar 1"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onUpdateStock && onUpdateStock(material, material.quantity + 5)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                            title="Aumentar 5"
                          >
                            <ChevronsRight className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.minimum}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}><StatusIcon className="h-3 w-3 mr-1" />{status.label}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onEdit(material)} className="text-blue-600 hover:text-blue-900" title="Editar"><Edit className="h-5 w-5" /></button>
                          <button onClick={() => onDelete(material)} className="text-red-600 hover:text-red-900" title="Excluir"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden">
            <ul className="divide-y divide-gray-200">
              {materials.map((material) => {
                const status = getStockStatus(material);
                const StatusIcon = status.icon;
                return (
                  <li key={material.sku} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-lg font-semibold text-gray-900 truncate">{material.name}</p>
                          <p className="text-sm text-gray-500 font-mono">SKU: {material.sku}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                           <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Quantidade</span>
                           <div className="flex items-center space-x-1">
                             <button
                               onClick={() => onUpdateStock && onUpdateStock(material, Math.max(0, material.quantity - 5))}
                               disabled={material.quantity <= 0}
                               className="p-1 bg-white border border-gray-200 rounded-full shadow-sm active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               <ChevronsLeft className="h-3 w-3 text-gray-600" />
                             </button>
                             <button
                               onClick={() => onUpdateStock && onUpdateStock(material, material.quantity - 1)}
                               disabled={material.quantity <= 0}
                               className="p-1 bg-white border border-gray-200 rounded-full shadow-sm active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               <Minus className="h-3 w-3 text-gray-600" />
                             </button>
                             <span className={`font-semibold text-base px-1 ${status.critical ? 'text-red-600' : 'text-gray-900'}`}>
                               {material.quantity}
                             </span>
                             <button
                               onClick={() => onUpdateStock && onUpdateStock(material, material.quantity + 1)}
                               className="p-1 bg-white border border-gray-200 rounded-full shadow-sm active:bg-gray-100"
                             >
                               <Plus className="h-3 w-3 text-gray-600" />
                             </button>
                             <button
                               onClick={() => onUpdateStock && onUpdateStock(material, material.quantity + 5)}
                               className="p-1 bg-white border border-gray-200 rounded-full shadow-sm active:bg-gray-100"
                             >
                               <ChevronsRight className="h-3 w-3 text-gray-600" />
                             </button>
                           </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                           <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Mínimo</span>
                           <span className="font-medium text-gray-900">{material.minimum}</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-gray-100 gap-3">
                        <button onClick={() => onEdit(material)} className="text-blue-600 hover:text-blue-900 p-1 flex items-center gap-1" title="Editar">
                          <Edit className="h-5 w-5" />
                          <span className="text-xs font-medium">Editar</span>
                        </button>
                        <button onClick={() => onDelete(material)} className="text-red-600 hover:text-red-900 p-1 flex items-center gap-1" title="Excluir">
                          <Trash2 className="h-5 w-5" />
                          <span className="text-xs font-medium">Excluir</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
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

export default MaterialsList;
