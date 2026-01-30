import React, { useState, useEffect } from 'react';
import { X, Calendar, ClipboardCheck } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { evaluationsApi } from '../../services/evaluationsApi';
import { Button } from '../ui/button';

registerLocale('pt-BR', ptBR);

const DailyEvaluations = ({ onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (selectedDate) {
        // Configurar data de início e fim para o dia selecionado
        const start = new Date(selectedDate);
        start.setUTCHours(0, 0, 0, 0);
        
        const end = new Date(selectedDate);
        end.setUTCHours(23, 59, 59, 999);
        
        params.startDate = start.toISOString();
        params.endDate = end.toISOString();
      }

      const response = await evaluationsApi.getAll(params);

      setEvaluations(response.evaluations || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || 1
      }));
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      setError('Erro ao carregar avaliações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, [selectedDate, pagination.page]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Se já for um objeto Date
      if (dateString instanceof Date) {
        return format(dateString, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      }

      // Se for string, tenta fazer o parse manual
      if (typeof dateString === 'string') {
        // Pega apenas a parte da data (YYYY-MM-DD) mesmo se tiver hora
        const cleanDate = dateString.split('T')[0];
        const parts = cleanDate.split('-');
        
        if (parts.length === 3) {
          const [year, month, day] = parts.map(Number);
          // Verifica se os números são válidos
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const date = new Date(year, month - 1, day);
            return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
          }
        }
      }

      // Fallback para o construtor padrão se o parse manual falhar
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return format(fallbackDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      }

      return '';
    } catch (err) {
      console.error('Erro ao formatar data:', err);
      return '';
    }
  };

  const getStatusColor = (value) => {
    switch (value) {
      case 'EXCELENTE': return 'bg-green-100 text-green-800';
      case 'BOM': return 'bg-blue-100 text-blue-800';
      case 'MEDIO': return 'bg-yellow-100 text-yellow-800';
      case 'RUIM': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (value) => {
    switch (value) {
      case 'EXCELENTE': return 'Excelente 🌟';
      case 'BOM': return 'Bom 🙂';
      case 'MEDIO': return 'Médio 😐';
      case 'RUIM': return 'Ruim 😞';
      default: return value;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Histórico de Avaliações
            </h3>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              <Calendar className="h-4 w-4 text-gray-500" />
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                className="bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-700 w-28 cursor-pointer outline-none"
                placeholderText="Filtrar por data"
                isClearable
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
              {error}
            </div>
          ) : evaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ClipboardCheck className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhuma avaliação encontrada</p>
              <p className="text-sm">Selecione outra data ou crie novas avaliações.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {evaluations.map((evaluation) => (
                <div key={evaluation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {evaluation.student?.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {evaluation.tutoring?.subject} - {evaluation.tutoring?.topic}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {getFormattedDate(evaluation.weekDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500 block">Comportamento</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusColor(evaluation.behavior)}`}>
                        {getStatusLabel(evaluation.behavior)}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500 block">Participação</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusColor(evaluation.participation)}`}>
                        {getStatusLabel(evaluation.participation)}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-xs text-gray-500 block">Progresso</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusColor(evaluation.progress)}`}>
                        {getStatusLabel(evaluation.progress)}
                      </span>
                    </div>
                  </div>

                  {evaluation.notes && (
                    <div className="bg-yellow-50 p-3 rounded text-sm text-gray-700">
                      <span className="font-medium block mb-1">Observações:</span>
                      {evaluation.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1 || loading}
              className="px-3"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600 min-w-[100px] text-center">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="px-3"
            >
              Próxima
            </Button>
          </div>

          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Icon component helper since we can't import ClipboardCheck directly if not installed, 
// but it seems lucide-react is available.
// Removed duplicate import of ClipboardCheck
export default DailyEvaluations;
