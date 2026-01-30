import React, { useState, useEffect } from 'react';
import { X, Package, Layers, ChevronRight, Check } from 'lucide-react';

const MaterialForm = ({ material, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('info'); // info, stock
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    quantity: '',
    minimum: '10'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'info', label: 'Informações Básicas', icon: Package },
    { id: 'stock', label: 'Controle de Estoque', icon: Layers }
  ];

  useEffect(() => {
    if (material) {
      setFormData({
        sku: material.sku || '',
        name: material.name || '',
        quantity: material.quantity?.toString() || '',
        minimum: material.minimum?.toString() || '10'
      });
    } else {
      setActiveTab('info');
    }
  }, [material]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantidade deve ser um número positivo';
    }
    if (!formData.minimum || parseInt(formData.minimum) < 0) {
      newErrors.minimum = 'Mínimo deve ser um número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Switch to tab with errors
      if (errors.sku || errors.name) {
        setActiveTab('info');
      } else if (errors.quantity || errors.minimum) {
        setActiveTab('stock');
      }
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        quantity: parseInt(formData.quantity),
        minimum: parseInt(formData.minimum)
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error('Erro ao salvar material:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={!!material}
                  placeholder="Ex: MAT-001"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  } ${material ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                )}
                {material && (
                  <p className="mt-1 text-xs text-gray-500">SKU não pode ser alterado</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Caderno 96 folhas"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'stock':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade Atual *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade Mínima *
                </label>
                <input
                  type="number"
                  name="minimum"
                  value={formData.minimum}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.minimum ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.minimum && (
                  <p className="mt-1 text-sm text-red-600">{errors.minimum}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Você será alertado quando o estoque atingir este valor
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-0 border w-full max-w-4xl shadow-2xl rounded-xl bg-white flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {material ? 'Editar Material' : 'Novo Material'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Preencha as informações nas abas abaixo</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Corpo com Sidebar/Tabs e Conteúdo */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar de Navegação */}
          <div className="w-64 bg-gray-50 border-r flex flex-col py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              // Verifica se tem erro na aba
              const hasError = (tab.id === 'info' && (errors.sku || errors.name)) ||
                               (tab.id === 'stock' && (errors.quantity || errors.minimum));

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors relative
                    ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.label}
                  {hasError && <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>}
                </button>
              );
            })}
          </div>

          {/* Área de Conteúdo */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <form id="material-form" onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex-1">
                {renderTabContent()}
              </div>
            </form>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
           <div className="text-sm text-gray-500">
             Passo {tabs.findIndex(t => t.id === activeTab) + 1} de {tabs.length}
           </div>
           <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            
            {/* Botão Próximo ou Salvar */}
            {activeTab !== tabs[tabs.length - 1].id ? (
               <button
                 type="button"
                 onClick={() => {
                   const currentIndex = tabs.findIndex(t => t.id === activeTab);
                   if (currentIndex < tabs.length - 1) {
                     setActiveTab(tabs[currentIndex + 1].id);
                   }
                 }}
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
               >
                 Próximo <ChevronRight size={16} className="ml-1" />
               </button>
            ) : (
              <button
                type="submit"
                form="material-form"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" /> {material ? 'Salvar Alterações' : 'Criar Material'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialForm;