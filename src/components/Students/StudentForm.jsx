import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import { User, School, Users, ChevronRight, Check, Wallet, Eye, EyeOff, Camera } from 'lucide-react';
import { getImageUrl } from '../../services/api';

registerLocale('pt-BR', ptBR);

const parseAmount = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  return Number(value);
};

const StudentForm = ({ student, onSave, onCancel, isOpen }) => {
  const [activeTab, setActiveTab] = useState('personal'); // personal, school, parents, financial
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    grade: '',
    birthDate: '',
    school: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    // Campos financeiros
    financialType: 'monthly',
    amount: '',
    installments: '',
    dueDateDay: '10'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaveEnabled, setIsSaveEnabled] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (student?.avatarUrl) {
      setAvatarPreview(getImageUrl(student.avatarUrl));
    }
  }, [student]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: User },
    { id: 'school', label: 'Escolar', icon: School },
    { id: 'parents', label: 'Responsáveis', icon: Users },
    { id: 'financial', label: 'Financeiro', icon: Wallet }
  ];

  // Delay para habilitar o botão de salvar ao trocar de aba (previne duplo clique acidental)
  useEffect(() => {
    // Se estiver na última aba
    if (activeTab === tabs[tabs.length - 1].id) {
      setIsSaveEnabled(false);
      const timer = setTimeout(() => setIsSaveEnabled(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsSaveEnabled(true);
    }
  }, [activeTab]);

  // Preencher formulário quando student muda
  useEffect(() => {
    if (student) {
      // Inferir dados financeiros baseados nos pagamentos e histórico
      let inferredType = 'monthly';
      let inferredInstallments = '';
      let inferredAmount = student.monthlyFee || '';
      
      if (student.payments && student.payments.length > 0) {
        // Procura por referência de parcela (ex: "Parcela 1/12")
        const installmentPayment = student.payments.find(p => p.reference && p.reference.toLowerCase().includes('parcela'));
        
        if (installmentPayment) {
          inferredType = 'installment';
          // Tentar extrair o total de parcelas da string "Parcela X/Y"
          const match = installmentPayment.reference.match(/\d+\/(\d+)/);
          if (match && match[1]) {
            inferredInstallments = match[1];
          }
          // Prioriza o valor da parcela se disponível
          if (installmentPayment.amount) inferredAmount = installmentPayment.amount;
        } else {
          // Se não é parcela, assume mensalidade e pega o valor mais recente
          if (student.payments[0].amount) inferredAmount = student.payments[0].amount;
        }
      }

      setFormData({
        name: student.name || '',
        email: student.email || '',
        password: '',
        confirmPassword: '',
        phone: student.phone || '',
        grade: student.grade || '',
        birthDate: student.birthDate ? new Date(student.birthDate).toISOString().slice(0,10) : '',
        school: student.school || '',
        address: student.address || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        parentEmail: student.parentEmail || '',
        // Campos financeiros
        financialType: inferredType,
        amount: inferredAmount,
        installments: inferredInstallments,
        dueDateDay: student.payments?.[0]?.dueDate ? new Date(student.payments[0].dueDate).getDate().toString() : '10'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        grade: '',
        birthDate: '',
        school: '',
        address: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        financialType: 'monthly',
        amount: '',
        installments: '',
        dueDateDay: '10'
      });
    }
    setErrors({});
    setActiveTab('personal');
  }, [student]);

  // Campos por aba para validação
  const tabFields = {
    personal: ['name', 'email', 'birthDate', 'phone', 'password', 'confirmPassword'],
    school: ['school', 'grade'],
    parents: ['parentName', 'parentPhone', 'parentEmail'],
    financial: ['amount', 'installments', 'dueDateDay', 'financialType']
  };

  // Validação do formulário
  const getValidationErrors = () => {
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

    // Validar senha (obrigatória apenas no cadastro)
    if (!student && !formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
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

    // Responsável financeiro (opcional)
    if (formData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Email do responsável inválido';
    }
    if (formData.parentPhone) {
      const pn = formData.parentPhone.replace(/\D/g, '');
      if (pn.length < 10 || pn.length > 11) {
        newErrors.parentPhone = 'Telefone do responsável deve ter 10 ou 11 dígitos';
      }
    }

    // Validar dados financeiros apenas na criação
    if (!student) {
      if (!formData.amount || Number(formData.amount) <= 0) {
        newErrors.amount = 'Valor é obrigatório e deve ser positivo';
      }
      
      if (formData.financialType === 'installment') {
        if (!formData.installments || Number(formData.installments) <= 0) {
          newErrors.installments = 'Número de parcelas é obrigatório';
        }
      }

      if (!formData.dueDateDay || Number(formData.dueDateDay) < 1 || Number(formData.dueDateDay) > 31) {
        newErrors.dueDateDay = 'Dia de vencimento inválido';
      }
    }

    return newErrors;
  };

  const validateTab = (tabId) => {
    const allErrors = getValidationErrors();
    const tabSpecificErrors = {};
    const fieldsToCheck = tabFields[tabId] || [];

    fieldsToCheck.forEach(field => {
      if (allErrors[field]) {
        tabSpecificErrors[field] = allErrors[field];
      }
    });

    if (Object.keys(tabSpecificErrors).length > 0) {
      setErrors(tabSpecificErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateForm = () => {
    const newErrors = getValidationErrors();
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
    if (name === 'parentPhone') {
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
      // Switch to tab with errors
      const errors = getValidationErrors();
      const firstErrorField = Object.keys(errors)[0];
      const errorTab = Object.keys(tabFields).find(tab => tabFields[tab].includes(firstErrorField));
      
      if (errorTab) {
        setActiveTab(errorTab);
      }
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      const dataToSend = new FormData();
      
      // Adicionar campos textuais
      Object.keys(formData).forEach(key => {
        let value = formData[key];
        
        if (value === null || value === undefined) return;
        
        // Limpar formatação de telefone
        if (key === 'phone' || key === 'parentPhone') {
          value = value.replace(/\D/g, '');
        }
        
        dataToSend.append(key, value);
      });
      
      // Adicionar avatar se houver
      if (avatarFile) {
        dataToSend.append('avatar', avatarFile);
      }
      
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

  const renderAvatar = () => {
    const imageUrl = avatarPreview;
    
    return (
      <div className="relative group">
        <input
          type="file"
          id="avatar-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <label htmlFor="avatar-upload" className="cursor-pointer block relative">
          {imageUrl && !imgError ? (
            <img 
              src={imageUrl} 
              alt={student?.name || 'Aluno'} 
              className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg transition-opacity group-hover:opacity-75"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl border-4 border-white shadow-lg transition-opacity group-hover:opacity-75">
              {formData.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-full">
            <Camera className="w-8 h-8 text-white" />
          </div>
          
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
            <Camera size={16} />
          </div>
        </label>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
               {renderAvatar()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
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
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email do Aluno *
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
                  placeholder="email@aluno.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Data de Nascimento */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <DatePicker
                  id="birthDate"
                  selected={formData.birthDate ? (() => {
                    const [y, m, d] = formData.birthDate.split('-');
                    return new Date(y, m - 1, d);
                  })() : null}
                  onChange={(date) => {
                    let value = '';
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      value = `${year}-${month}-${day}`;
                    }
                    handleChange({ target: { name: 'birthDate', value } });
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="dd/mm/aaaa"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  wrapperClassName="w-full"
                  autoComplete="off"
                />
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone / WhatsApp
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
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Senha */}
              <div className="md:col-span-2 pt-2 border-t mt-2">
                 <h4 className="text-sm font-medium text-gray-900 mb-3">Acesso ao Sistema</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha {student ? '(Opcional)' : '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.password ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder={student ? "Manter atual" : "Mínimo 6 caracteres"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Confirme a senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'school':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 gap-4">
              {/* Escola */}
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">Escola de Origem</label>
                <input
                  type="text"
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da escola onde estuda"
                />
              </div>

              {/* Série */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Série/Ano Escolar *
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.grade ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione a série</option>
                  <optgroup label="Ensino Fundamental">
                    <option value="1º Fundamental">1º Ano - Fundamental</option>
                    <option value="2º Fundamental">2º Ano - Fundamental</option>
                    <option value="3º Fundamental">3º Ano - Fundamental</option>
                    <option value="4º Fundamental">4º Ano - Fundamental</option>
                    <option value="5º Fundamental">5º Ano - Fundamental</option>
                    <option value="6º Fundamental">6º Ano - Fundamental</option>
                    <option value="7º Fundamental">7º Ano - Fundamental</option>
                    <option value="8º Fundamental">8º Ano - Fundamental</option>
                    <option value="9º Fundamental">9º Ano - Fundamental</option>
                  </optgroup>
                  <optgroup label="Ensino Médio">
                    <option value="1º Médio">1º Ano - Médio</option>
                    <option value="2º Médio">2º Ano - Médio</option>
                    <option value="3º Médio">3º Ano - Médio</option>
                  </optgroup>
                  <optgroup label="Outros">
                    <option value="Pré-vestibular">Pré-vestibular</option>
                    <option value="Superior">Superior</option>
                  </optgroup>
                </select>
                {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade}</p>}
              </div>
            </div>
          </div>
        );

      case 'parents':
        return (
          <div className="space-y-4 animate-fadeIn">
            {/* Responsável Financeiro */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Responsável Financeiro/Legal</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável</label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo do responsável"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">Email do Responsável</label>
                    <input
                      type="email"
                      id="parentEmail"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.parentEmail ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="email@responsavel.com"
                    />
                    {errors.parentEmail && <p className="mt-1 text-sm text-red-600">{errors.parentEmail}</p>}
                  </div>
                  <div>
                    <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">Telefone do Responsável</label>
                    <input
                      type="tel"
                      id="parentPhone"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.parentPhone ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.parentPhone && <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Endereço Residencial</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rua, número, bairro, cidade, CEP"
              />
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
               <div className="flex items-start gap-3 mb-4">
                 <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                   <Wallet size={20} />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Configuração de Pagamento</h4>
                   <p className="text-xs text-blue-700 mt-1">Defina como será a cobrança inicial deste aluno.</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de Cobrança */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cobrança *</label>
                    <select
                      name="financialType"
                      value={formData.financialType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="monthly">Fixo Mensal (Recorrente)</option>
                      <option value="installment">Parcelado (Valor Total)</option>
                    </select>
                  </div>

                  {/* Dia de Vencimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dia de Vencimento *</label>
                    <select
                      name="dueDateDay"
                      value={formData.dueDateDay}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.dueDateDay ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      {[5, 10, 15, 20, 25, 30].map(day => (
                        <option key={day} value={day}>Dia {day}</option>
                      ))}
                    </select>
                    {errors.dueDateDay && <p className="mt-1 text-sm text-red-600">{errors.dueDateDay}</p>}
                  </div>

                  {/* Valor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.financialType === 'monthly' ? 'Valor da Mensalidade *' : 'Valor Total do Contrato *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">R$</span>
                      <input
                        type="text"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={`w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="0,00"
                      />
                    </div>
                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                  </div>

                  {/* Parcelas (apenas se parcelado) */}
                  {formData.financialType === 'installment' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Parcelas *</label>
                      <input
                        type="number"
                        name="installments"
                        value={formData.installments}
                        onChange={handleChange}
                        min="1"
                        max="24"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.installments ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Ex: 12"
                      />
                      {errors.installments && <p className="mt-1 text-sm text-red-600">{errors.installments}</p>}
                    </div>
                  )}
                </div>

                {/* Resumo do cálculo - Apenas para Parcelado */}
                {parseAmount(formData.amount) > 0 && formData.financialType === 'installment' && (
                  <div className="mt-4 p-3 bg-white border border-blue-200 rounded-md text-sm text-blue-800 shadow-sm">
                      <p>
                        Serão geradas <strong>{formData.installments || 0}</strong> parcelas de 
                        <strong> R$ {formData.installments > 0 ? (parseAmount(formData.amount) / parseInt(formData.installments)).toFixed(2).replace('.', ',') : '0,00'} </strong>
                        mensais.
                      </p>
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
              {student ? 'Editar Aluno' : 'Novo Cadastro de Aluno'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Preencha as informações nas abas abaixo</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corpo com Sidebar/Tabs e Conteúdo */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar de Navegação */}
          <div className="w-64 bg-gray-50 border-r flex flex-col py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              // Simples verificação de erro por aba (não exaustiva, mas visual)
              const hasError = (tab.id === 'personal' && (errors.name || errors.email || errors.phone || errors.password)) ||
                               (tab.id === 'school' && errors.grade) ||
                               (tab.id === 'parents' && (errors.parentEmail || errors.parentPhone));

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
            {/* Erro geral */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                 <div className="text-red-500 mt-0.5">⚠️</div>
                <div className="text-sm text-red-600">{errors.general}</div>
              </div>
            )}

            <form id="student-form" onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex-1">
                {renderTabContent()}
              </div>
            </form>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
           <div className="text-sm text-gray-500">
             {/* Indicador de passos opcional */}
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
                 key="btn-next"
                 type="button"
                 onClick={() => {
                   if (!validateTab(activeTab)) return;
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
                key="btn-save"
                type="submit"
                form="student-form"
                disabled={loading || !isSaveEnabled}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white flex items-center ${
                  loading || !isSaveEnabled 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
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
                    <Check size={16} className="mr-2" /> Salvar Cadastro
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

export default StudentForm;
