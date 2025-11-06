import React, { useState, useEffect } from 'react';
import { studentsApi } from '../../services/studentsApi';

const StudentForm = ({ student, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Preencher formulário quando student muda
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        grade: student.grade || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        grade: ''
      });
    }
    setErrors({});
  }, [student]);

  // Validação do formulário
  const validateForm = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email deve ter um formato válido';
      } else if (formData.email.length > 255) {
        newErrors.email = 'Email deve ter no máximo 255 caracteres';
      }
    }

    // Validar telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      // Remove caracteres não numéricos para validação
      const phoneNumbers = formData.phone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos';
      }
    }

    // Validar série
    if (!formData.grade.trim()) {
      newErrors.grade = 'Série é obrigatória';
    } else if (formData.grade.trim().length > 50) {
      newErrors.grade = 'Série deve ter no máximo 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formatar telefone enquanto digita
  const formatPhone = (value) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara baseada no tamanho
    if (numbers.length <= 10) {
      // Formato: (11) 1234-5678
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Formato: (11) 91234-5678
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Manipular mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Aplicar formatação específica para telefone
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      // Preparar dados para envio (remover formatação do telefone)
      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, '') // Remove formatação
      };
      
      await onSave(dataToSend);
    } catch (err) {
      console.error('Erro ao salvar aluno:', err);
      
      // Tratar erros específicos da API
      if (err.response?.data?.errors) {
        // Erros de validação do backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.field] = error.message;
        });
        setErrors(backendErrors);
      } else if (err.response?.data?.message) {
        // Erro geral do backend
        setErrors({ general: err.response.data.message });
      } else {
        // Erro genérico
        setErrors({ general: 'Erro interno. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {student ? 'Editar Aluno' : 'Novo Aluno'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Erro geral */}
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-600">{errors.general}</div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Digite o nome completo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Digite o email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Série */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Série/Ano
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a série</option>
                <option value="1º Fundamental">1º Ano - Fundamental</option>
                <option value="2º Fundamental">2º Ano - Fundamental</option>
                <option value="3º Fundamental">3º Ano - Fundamental</option>
                <option value="4º Fundamental">4º Ano - Fundamental</option>
                <option value="5º Fundamental">5º Ano - Fundamental</option>
                <option value="6º Fundamental">6º Ano - Fundamental</option>
                <option value="7º Fundamental">7º Ano - Fundamental</option>
                <option value="8º Fundamental">8º Ano - Fundamental</option>
                <option value="9º Fundamental">9º Ano - Fundamental</option>
                <option value="1º Médio">1º Ano - Médio</option>
                <option value="2º Médio">2º Ano - Médio</option>
                <option value="3º Médio">3º Ano - Médio</option>
                <option value="Pré-vestibular">Pré-vestibular</option>
                <option value="Superior">Superior</option>
              </select>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </div>
                ) : (
                  student ? 'Atualizar' : 'Criar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;