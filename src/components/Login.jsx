import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from '../services/api';

const Login = ({ onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFillExample = () => {
    setFormData({
      email: "admin@reforcoescolar.com",
      password: "123456",
    });
    if (error) setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validação básica
    if (!formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Por favor, insira um email válido");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess("Login realizado com sucesso!");
        setTimeout(() => {
          onLogin(result.data.user);
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header com botão voltar */}
        <motion.div 
          className="flex items-center mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 p-2 hover:bg-blue-50 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">EduReforço</h1>
              <p className="text-xs text-gray-600">Área do Professor</p>
            </div>
          </div>
        </motion.div>

        {/* Card de Login */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                Bem-vindo de volta!
              </CardTitle>
              <p className="text-gray-600">
                Faça login para acessar o sistema de gestão
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Digite sua senha"
                      className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 focus:outline-none"
                      disabled={isLoading}
                      title={showPassword ? "Ocultar senha" : "Ver senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mensagens de erro/sucesso */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </motion.div>
                )}

                {/* Botão de Login */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                {/* Links adicionais */}
                <div className="text-center space-y-2">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    disabled={isLoading}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Informações de demonstração */}
        <motion.div
          className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={handleFillExample}
          title="Clique para preencher as credenciais de administrador"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <GraduationCap size={20} className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                Acesso Admin (Demo)
              </h4>
              <p className="text-xs text-blue-700">
                Clique aqui para preencher automaticamente o login de administrador.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
