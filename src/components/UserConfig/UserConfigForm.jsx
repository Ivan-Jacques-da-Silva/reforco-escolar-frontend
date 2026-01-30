import React, { useState, useEffect } from "react";
import {
  Users,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModal } from "../../contexts/ModalContext";
import { authService, getImageUrl } from "../../services/api";

const UserConfigForm = ({ user, onUserUpdate }) => {
  const { showModal } = useModal();
  // Estado para Perfil
  const [perfil, setPerfil] = useState({
    nome: user?.name || "",
    email: user?.email || "",
    senha: "",
    confirmarSenha: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para Tema
  const [tema, setTema] = useState({
    primaria: user?.primaryColor || "#0ea5e9", // sky-500 default
    secundaria: user?.secondaryColor || "#f8fafc", // slate-50 default
    fonte: user?.fontFamily || "Inter",
    texto: user?.textColor || "#1e293b"
  });

  // Estado para Imagens
  const [avatarFile, setAvatarFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(getImageUrl(user?.avatarUrl));
  const [logoPreview, setLogoPreview] = useState(getImageUrl(user?.logoUrl));
  const [avatarError, setAvatarError] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setPerfil(prev => ({
        ...prev,
        nome: user.name || "",
        email: user.email || ""
      }));
      setTema({
        primaria: user.primaryColor || "#0ea5e9",
        secundaria: user.secondaryColor || "#f8fafc",
        fonte: user.fontFamily || "Inter",
        texto: user.textColor || "#1e293b"
      });
      // Adiciona timestamp para forçar atualização do cache da imagem
      setAvatarPreview(user.avatarUrl ? `${getImageUrl(user.avatarUrl)}?t=${user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now()}` : null);
      setAvatarError(false);
      setLogoPreview(getImageUrl(user.logoUrl));
    }
  }, [user]);

  const handlePerfilChange = (e) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const handleTemaChange = (e) => {
    const { name, value } = e.target;
    setTema(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarError(false);
      } else if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      }
    }
  };

  const salvarTudo = async () => {
    if (perfil.senha && perfil.senha !== perfil.confirmarSenha) {
      showModal({ title: "Erro", message: "As senhas não coincidem!", type: "error" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', perfil.nome);
    formData.append('email', perfil.email);
    if (perfil.senha) formData.append('password', perfil.senha);
    formData.append('primaryColor', tema.primaria);
    formData.append('secondaryColor', tema.secundaria);
    formData.append('fontFamily', tema.fonte);
    formData.append('textColor', tema.texto);
    
    if (avatarFile) formData.append('avatar', avatarFile);
    if (logoFile) formData.append('logo', logoFile);

    const res = await authService.updateProfile(formData);
    setLoading(false);
    
    if (res.success) {
      showModal({ title: "Sucesso", message: "Configurações salvas com sucesso!", type: "success" });
      // Limpar senha
      setPerfil(prev => ({ ...prev, senha: "", confirmarSenha: "" }));
      if (onUserUpdate) onUserUpdate(res.data.user);
    } else {
      showModal({ title: "Erro", message: "Erro ao salvar: " + res.error, type: "error" });
    }
  };

  return (
    <div className="grid gap-6">
      {/* Configuração de Perfil */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Configuração de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center sm:flex-row gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-200 flex items-center justify-center">
                {avatarPreview && !avatarError ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <Users className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-[var(--primary-color)] rounded-full text-white cursor-pointer hover:bg-[var(--primary-color-hover)] transition shadow-sm">
                <Camera className="w-4 h-4" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </label>
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="font-medium">Sua Foto</h3>
              <p className="text-sm text-muted-foreground">Isso será exibido no seu perfil.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input 
                id="nome" 
                name="nome" 
                value={perfil.nome} 
                onChange={handlePerfilChange} 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={perfil.email} 
                onChange={handlePerfilChange} 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Nova Senha</Label>
              <div className="relative">
                <Input 
                  id="senha" 
                  name="senha" 
                  type={showPassword ? "text" : "password"} 
                  value={perfil.senha} 
                  onChange={handlePerfilChange} 
                  className="rounded-xl pr-10"
                  placeholder="Deixe em branco para manter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <div className="relative">
                <Input 
                  id="confirmarSenha" 
                  name="confirmarSenha" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={perfil.confirmarSenha} 
                  onChange={handlePerfilChange} 
                  className="rounded-xl pr-10"
                  placeholder="Repita a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={salvarTudo} disabled={loading} className="rounded-xl">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {user?.role !== 'STUDENT' && (
      <>
      {/* Configuração de Tema */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Logo Upload */}
           <div className="flex flex-col items-center sm:flex-row gap-6 border-b pb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-200 flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Sparkles className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2 p-1.5 bg-[var(--primary-color)] rounded-full text-white cursor-pointer hover:bg-[var(--primary-color-hover)] transition shadow-sm">
                <Upload className="w-4 h-4" />
                <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
              </label>
            </div>
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="font-medium">Logo da Escola</h3>
              <p className="text-sm text-muted-foreground">Será exibido no topo e em relatórios.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaria">Cor Primária (Destaques)</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="primaria" 
                  name="primaria" 
                  type="color" 
                  value={tema.primaria} 
                  onChange={handleTemaChange} 
                  className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{tema.primaria}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secundaria">Cor Secundária (Fundo)</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="secundaria" 
                  name="secundaria" 
                  type="color" 
                  value={tema.secundaria} 
                  onChange={handleTemaChange} 
                  className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{tema.secundaria}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="texto">Cor do Texto</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="texto" 
                  name="texto" 
                  type="color" 
                  value={tema.texto} 
                  onChange={handleTemaChange} 
                  className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{tema.texto}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fonte">Fonte do Sistema</Label>
              <select
                id="fonte"
                name="fonte"
                value={tema.fonte}
                onChange={handleTemaChange}
                className="w-full h-10 px-3 py-2 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Inter">Inter (Padrão)</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
              </select>
              <p className="text-xs text-muted-foreground">
                A fonte "Leveza" (Caveat) será mantida em destaques.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
             <Button onClick={salvarTudo} disabled={loading} variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50 rounded-xl">
               {loading ? "Aplicando..." : "Aplicar Tema"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrações (Mantido) */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Integrações</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 p-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">CORA (Cobranças aluno)</div>
            <Badge variant="secondary">Sandbox conectado</Badge>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">SICOOB (Recebíveis empresa)</div>
            <Badge variant="secondary">Webhook ativo</Badge>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
};

export default UserConfigForm;
