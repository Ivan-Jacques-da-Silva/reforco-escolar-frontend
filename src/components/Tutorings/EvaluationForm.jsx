import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

const EvaluationForm = ({ tutoring, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    weekDate: new Date(),
    behavior: 'BOM',
    participation: 'BOM',
    progress: 'BOM',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Converte a data selecionada para YYYY-MM-DD usando componentes locais para evitar problemas de fuso horário
      const year = formData.weekDate.getFullYear();
      const month = String(formData.weekDate.getMonth() + 1).padStart(2, '0');
      const day = String(formData.weekDate.getDate()).padStart(2, '0');
      const dateToSend = `${year}-${month}-${day}`;

      await onSave({
        ...formData,
        weekDate: dateToSend,
        studentId: tutoring.studentId,
        tutoringId: tutoring.id
      });
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    } finally {
      setLoading(false);
    }
  };

  const options = [
    { value: 'EXCELENTE', label: 'Excelente 🌟' },
    { value: 'BOM', label: 'Bom 🙂' },
    { value: 'MEDIO', label: 'Médio 😐' },
    { value: 'RUIM', label: 'Ruim 😞' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Avaliação Semanal
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Aluno: {tutoring.student?.name}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Referência
            </label>
            <div className="w-full">
              <DatePicker
                selected={formData.weekDate}
                onChange={(date) => setFormData(prev => ({ ...prev, weekDate: date }))}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comportamento
              </label>
              <select
                name="behavior"
                value={formData.behavior}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participação
              </label>
              <select
                name="participation"
                value={formData.participation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progresso
              </label>
              <select
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações / Feedback
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Descreva o desempenho do aluno nesta semana..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;
