import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowRight,
  GraduationCap,
  Target,
  Heart,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">EduReforço</h1>
              <p className="text-xs text-gray-600">Excelência em Educação</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              onClick={handleLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Área do Professor
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl text-gray-800 mb-6 leading-tight"
              style={{ fontFamily: "'Caveat', cursive", fontWeight: 'normal' }}
            >
              Gerencie alunos, reforços e finanças com
              <span className="text-blue-600"> Leveza</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Oferecemos aulas personalizadas de reforço escolar para alunos do ensino fundamental e médio. 
              Nossa metodologia comprovada ajuda estudantes a superar dificuldades e alcançar excelência acadêmica.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Agende uma Aula Gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
              >
                Saiba Mais
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { number: "500+", label: "Alunos Atendidos", icon: Users },
              { number: "95%", label: "Taxa de Aprovação", icon: Trophy },
              { number: "3", label: "Anos de Experiência", icon: Clock },
              { number: "15+", label: "Disciplinas", icon: BookOpen }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nossos Serviços</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos soluções educacionais personalizadas para cada necessidade
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Reforço Individual",
                description: "Aulas personalizadas focadas nas dificuldades específicas de cada aluno",
                icon: Target,
                features: ["Atenção exclusiva", "Ritmo personalizado", "Material adaptado"]
              },
              {
                title: "Grupos Pequenos",
                description: "Turmas reduzidas para maior interação e aprendizado colaborativo",
                icon: Users,
                features: ["Máximo 4 alunos", "Interação social", "Custo acessível"]
              },
              {
                title: "Preparação para Provas",
                description: "Preparação intensiva para vestibulares, ENEM e concursos",
                icon: Trophy,
                features: ["Simulados", "Técnicas de estudo", "Acompanhamento"]
              }
            ].map((service, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                      <service.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Nossa Metodologia</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Abordagem pedagógica comprovada que respeita o ritmo de cada estudante
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { step: "01", title: "Diagnóstico", description: "Avaliamos as dificuldades e potenciais do aluno" },
              { step: "02", title: "Planejamento", description: "Criamos um plano de estudos personalizado" },
              { step: "03", title: "Execução", description: "Aplicamos metodologias ativas de ensino" },
              { step: "04", title: "Acompanhamento", description: "Monitoramos o progresso continuamente" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-blue-100 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">O que dizem nossos alunos</h2>
            <p className="text-xl text-gray-600">Depoimentos reais de quem transformou sua vida acadêmica</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Maria Silva",
                grade: "9º Ano",
                text: "Melhorei muito em matemática! As aulas são claras e o professor tem muita paciência.",
                rating: 5
              },
              {
                name: "João Santos",
                grade: "2º EM",
                text: "Consegui passar no vestibular graças ao reforço. Recomendo para todos!",
                rating: 5
              },
              {
                name: "Ana Costa",
                grade: "8º Ano",
                text: "Agora entendo física de verdade. As explicações são muito didáticas.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                    <div>
                      <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.grade}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Entre em Contato</h2>
            <p className="text-xl text-gray-600">Estamos prontos para ajudar seu filho a alcançar o sucesso acadêmico</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Informações de Contato</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-blue-600 mr-4" />
                  <span className="text-gray-700">(55) 99999-9999</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-blue-600 mr-4" />
                  <span className="text-gray-700">contato@edureforco.com.br</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-blue-600 mr-4" />
                  <span className="text-gray-700">Rua da Educação, 123 - Centro</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Agende sua Aula Gratuita</h3>
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Heart className="mr-2 w-5 h-5" />
                    Quero Começar Agora!
                  </Button>
                  <p className="text-center text-gray-600 mt-4 text-sm">
                    Primeira aula gratuita • Sem compromisso • Avaliação completa
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">EduReforço</h3>
                <p className="text-sm text-gray-400">Excelência em Educação</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Transformando vidas através da educação de qualidade
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 EduReforço. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;