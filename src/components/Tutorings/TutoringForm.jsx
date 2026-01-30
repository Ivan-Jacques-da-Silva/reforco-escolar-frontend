import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { X, BookOpen, Calendar, FileText, ChevronRight, Check } from 'lucide-react';
import { studentsApi } from '../../services/studentsApi';

registerLocale('pt-BR', ptBR);

const TutoringForm = ({ tutoring, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('details'); // details, schedule
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    topic: '',
    nextClass: '',
    status: 'SCHEDULED'
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'details', label: 'Dados da Aula', icon: BookOpen },
    { id: 'schedule', label: 'Agendamento', icon: Calendar }
  ];

  useEffect(() => {
    loadStudents();
    if (tutoring) {
      setFormData({
        studentId: tutoring.studentId || '',
        subject: tutoring.subject || '',
        topic: tutoring.topic || '',
        nextClass: tutoring.nextClass ? new Date(tutoring.nextClass) : '',
        status: tutoring.status || 'SCHEDULED'
      });
    } else {
      setActiveTab('details');
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

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      nextClass: date
    }));
    if (errors.nextClass) {
      setErrors(prev => ({ ...prev, nextClass: '' }));
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
    if (!formData.nextClass) {
      newErrors.nextClass = 'Data e hora são obrigatórias';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Switch to the tab with errors if needed
      if (errors.studentId || errors.subject || errors.topic) {
        setActiveTab('details');
      } else if (errors.plan || errors.nextClass) {
        setActiveTab('schedule');
      }
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        nextClass: formData.nextClass ? formData.nextClass.toISOString() : null
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error('Erro ao salvar reforço:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 gap-6">
              <div>
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Ex: Matemática"
                    className={`w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="Ex: Equações do 1º grau"
                    className={`w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.topic ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.topic && (
                  <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Hora da Aula *
                </label>
                <div className="relative">
                   <DatePicker
                    selected={formData.nextClass}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Hora"
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="pt-BR"
                    portalId="root"
                    popperClassName="z-[9999]"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.nextClass ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholderText="Selecione a data e hora"
                    autoComplete="off"
                  />
                </div>
                {errors.nextClass && (
                  <p className="mt-1 text-sm text-red-600">{errors.nextClass}</p>
                )}
              </div>

              {tutoring && (
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
                    <option value="SCHEDULED">Agendada</option>
                    <option value="COMPLETED">Realizada</option>
                    <option value="CANCELED">Cancelada</option>
                  </select>
                </div>
              )}
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
              {tutoring ? 'Editar Reforço' : 'Novo Reforço'}
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
              const hasError = (tab.id === 'details' && (errors.studentId || errors.subject || errors.topic)) ||
                               (tab.id === 'schedule' && (errors.plan || errors.nextClass));

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
            <form id="tutoring-form" onSubmit={handleSubmit} className="h-full flex flex-col">
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
                form="tutoring-form"
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
                    <Check size={16} className="mr-2" /> {tutoring ? 'Salvar Alterações' : 'Criar Reforço'}
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

export default TutoringForm;