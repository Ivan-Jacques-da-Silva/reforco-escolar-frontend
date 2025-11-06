import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { studentsApi } from '../../services/studentsApi';

const TutoringForm = ({ tutoring, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    topic: '',
    plan: '',
    nextClass: '',
    status: 'SCHEDULED'
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
    if (tutoring) {
      setFormData({
        studentId: tutoring.studentId || '',
        subject: tutoring.subject || '',
        topic: tutoring.topic || '',
        plan: tutoring.plan || '',
        nextClass: tutoring.nextClass ? tutoring.nextClass.split('T')[0] + ' ' + tutoring.nextClass.split('T')[1].substring(0, 5) : '',
        status: tutoring.status || 'SCHEDULED'
      });
    }
  }, [tutoring]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await studentsApi.getAll({ status: 'ACTIVE', limit: 100 });
      setStudents(response.students || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

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

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Aluno é obrigatório';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Disciplina é obrigatória';
    }
    if (!formData.topic.trim()) {
      newErrors.topic = 'Assunto é obrigatório';
    }
    if (!formData.plan.trim()) {
      newErrors.plan = 'Plano é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        nextClass: formData.nextClass ? new Date(formData.nextClass).toISOString() : null
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error('Erro ao salvar reforço:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {tutoring ? 'Editar Reforço' : 'Novo Reforço'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aluno *
              </label>
              {loadingStudents ? (
                <div className="text-sm text-gray-500">Carregando alunos...</div>
              ) : (
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.studentId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione um aluno</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.grade}
                    </option>
                  ))}
                </select>
              )}
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disciplina *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Ex: Matemática"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plano *
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.plan ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um plano</option>
                <option value="Aula avulsa">Aula avulsa</option>
                <option value="Pacote 4 aulas">Pacote 4 aulas</option>
                <option value="Pacote 8 aulas">Pacote 8 aulas</option>
                <option value="Pacote 12 aulas">Pacote 12 aulas</option>
                <option value="Mensal">Mensal</option>
              </select>
              {errors.plan && (
                <p className="mt-1 text-sm text-red-600">{errors.plan}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Ex: Equações do 1º grau"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.topic ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.topic && (
                <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Próxima Aula
              </label>
              <input
                type="datetime-local"
                name="nextClass"
                value={formData.nextClass}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SCHEDULED">Agendado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : (tutoring ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutoringForm;
