import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  BookOpen,
  Boxes,
  CreditCard,
  Banknote,
  BarChart3,
  Settings,
  Plus,
  Search,
  Receipt,
  ChevronRight,
  Bell,
  Sparkles,
  LayoutGrid,
  Crown,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useModal } from "./contexts/ModalContext";
import Students from "./pages/Students";
import Tutorings from "./pages/Tutorings";
import Materials from "./pages/Materials";
import Payments from "./pages/Payments";
import { authService, getImageUrl } from "./services/api";
import { studentsApi } from "./services/studentsApi";
import { tutoringsApi } from "./services/tutoringsApi";
import { materialsApi } from "./services/materialsApi";
import { paymentsApi } from "./services/paymentsApi";
import UserConfigForm from "./components/UserConfig/UserConfigForm";

// =====================================================
// Reforço Escolar — UI clara (sem degradê / sem cores escuras)
// - React + Tailwind + shadcn + framer-motion
// - Visual clean: tons claros, bordas suaves, microanimações
// - Variáveis e funções em português
// =====================================================

// Helper para converter hex para rgba (para fundos transparentes)
const hexToRgba = (hex, alpha) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const darkenHex = (hex, amount = 0.1) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * (1 - amount))));
  const g = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * (1 - amount))));
  const b = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * (1 - amount))));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Nenhum dado exemplar: Dashboard não usa mais mocks.

const menu = [
  { chave: "visao", titulo: "Visão Geral", icone: Home },
  { chave: "alunos", titulo: "Alunos", icone: Users },
  { chave: "reforcos", titulo: "Reforços", icone: BookOpen },
  { chave: "materiais", titulo: "Materiais", icone: Boxes },
  { chave: "financeiro-aluno", titulo: "Pagamentos", icone: CreditCard },
  { chave: "financeiro-empresa", titulo: "Sistema", icone: Banknote },
  { chave: "relatorios", titulo: "Relatórios", icone: BarChart3 },
  { chave: "config", titulo: "Configurações", icone: Settings },
];

// ---------- Componentes de layout ---------- 
function Marca({ user }) {
  const primaryColor = user?.primaryColor || "#0ea5e9";
  const [imgError, setImgError] = useState(false);
  
  const logoUrl = useMemo(() => {
    // Para alunos, usa o avatar como logo se não tiver logoUrl
    const url = user?.logoUrl || (user?.role === 'STUDENT' ? user?.avatarUrl : null);
    if (!url) return null;
    const timestamp = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
    return `${getImageUrl(url)}?t=${timestamp}`;
  }, [user?.logoUrl, user?.avatarUrl, user?.role, user?.updatedAt]);

  useEffect(() => { setImgError(false); }, [logoUrl]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {logoUrl && !imgError ? (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="size-9 rounded-2xl object-contain bg-white border" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="size-9 rounded-2xl shadow-inner" style={{ backgroundColor: primaryColor }} />
        )}
        {(!logoUrl || imgError) && <Sparkles className="absolute -right-1 -bottom-1 h-4 w-4 text-amber-400" />}
      </div>
      <div>
        <div className="font-extrabold tracking-tight leading-none">Reforço</div>
        <div className="text-[10px] uppercase text-muted-foreground">Painel</div>
      </div>
    </div>
  );
}

function Topo({ user, onLogout, onOpenMenu }) {
  const primaryColor = user?.primaryColor || "#0ea5e9";
  const [imgError, setImgError] = useState(false);

  const logoUrl = useMemo(() => {
    // Para alunos, usa o avatar como logo se não tiver logoUrl (que alunos não têm)
    const url = user?.logoUrl || (user?.role === 'STUDENT' ? user?.avatarUrl : null);
    if (!url) return null;
    const timestamp = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
    return `${getImageUrl(url)}?t=${timestamp}`;
  }, [user?.logoUrl, user?.avatarUrl, user?.role, user?.updatedAt]);

  useEffect(() => { setImgError(false); }, [logoUrl]);

  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMenu}
            className="rounded-xl md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            {logoUrl && !imgError ? (
               <img 
                 src={logoUrl} 
                 alt="Logo" 
                 className="size-9 rounded-2xl object-contain bg-white border" 
                 onError={() => setImgError(true)}
               />
            ) : (
               <div className="size-9 rounded-2xl shadow-inner" style={{ backgroundColor: primaryColor }} />
            )}
          </div>
          <div className="font-extrabold tracking-tight leading-none">Grupo REP</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl"><Bell className="h-5 w-5" /></Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-800 rounded-xl"
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}

// Navegação móvel (drawer lateral)
function MobileDrawerNav({ aberto, aoFechar, ativo, aoTrocar, user }) {
  if (!aberto) return null;
  const primaryColor = user?.primaryColor || "#0ea5e9";
  
  // Filtra itens do menu baseado no perfil do usuário
  const filteredMenu = React.useMemo(() => {
    if (user?.role === 'STUDENT') {
      return menu.filter(item => 
        ['reforcos', 'financeiro-aluno', 'config'].includes(item.chave)
      );
    }
    return menu;
  }, [user]);
  
  return (
    <div className="md:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={aoFechar}
        aria-hidden="true"
      />
      {/* Painel lateral */}
      <motion.div
        initial={{ x: -320, opacity: 1 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white border-r shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
             <Marca user={user} />
             <div className="font-semibold">Grupo REP</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={aoFechar}
            className="rounded-xl"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-2 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icone = item.icone;
            const isAtivo = ativo === item.chave;
            return (
              <button
                key={item.chave}
                onClick={() => aoTrocar(item.chave)}
                className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition border`}
                style={isAtivo ? { 
                    backgroundColor: hexToRgba(primaryColor, 0.1), 
                    color: primaryColor, 
                    borderColor: hexToRgba(primaryColor, 0.3) 
                } : { borderColor: 'transparent' }}
                aria-current={isAtivo ? "page" : undefined}
              >
                <Icone className="h-5 w-5" />
                <span className="text-sm font-semibold truncate">{item.titulo}</span>
              </button>
            );
          })}
        </nav>
      </motion.div>
    </div>
  );
}

function Sidebar({ ativo, aoTrocar, user }) {
  const primaryColor = user?.primaryColor || "#0ea5e9";
  const [imgError, setImgError] = useState(false);

  // Adiciona timestamp se houver avatarUrl para evitar cache
  const avatarUrl = useMemo(() => {
    if (!user?.avatarUrl) return null;
    // Usa updatedAt se disponível para cache busting eficiente, senão usa Date.now() (menos eficiente mas funcional)
    const timestamp = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
    return `${getImageUrl(user.avatarUrl)}?t=${timestamp}`;
  }, [user?.avatarUrl, user?.updatedAt]);

  // Reseta erro quando a URL muda
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  // Filtra itens do menu baseado no perfil do usuário
  const filteredMenu = React.useMemo(() => {
    if (user?.role === 'STUDENT') {
      return menu.filter(item => 
        ['reforcos', 'financeiro-aluno', 'config'].includes(item.chave)
      );
    }
    return menu;
  }, [user]);

  return (
    <aside className="hidden md:flex md:flex-col w-72 shrink-0 border-r bg-white/80 backdrop-blur-xl rounded-r-3xl overflow-hidden">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {avatarUrl && !imgError ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="size-9 rounded-2xl object-cover bg-slate-100" 
                  onError={() => setImgError(true)}
                />
            ) : (
                <div className="size-9 rounded-2xl shadow-inner flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>
                    {user?.name?.charAt(0) || "U"}
                </div>
            )}
            <div className="leading-tight">
              <div className="font-semibold truncate max-w-[9rem]" title={user?.name || user?.email}>{user?.name || (user?.email ? user.email.split('@')[0] : 'Usuário')}</div>
              <div className="text-[11px] uppercase text-muted-foreground">{user?.role || 'Perfil'}</div>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3"/>Pro</Badge>
        </div>
      </div>
      <nav className="p-3 space-y-2">
        {filteredMenu.map((item) => {
          const Icone = item.icone;
          const isAtivo = ativo === item.chave;
          return (
            <motion.button
              key={item.chave}
              onClick={() => aoTrocar(item.chave)}
              whileHover={{ scale: 1.01 }}
              className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition border`}
              style={isAtivo ? { 
                  backgroundColor: hexToRgba(primaryColor, 0.1), 
                  color: primaryColor, 
                  borderColor: hexToRgba(primaryColor, 0.3),
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              } : { borderColor: 'transparent' }}
            >
              <Icone className="h-5 w-5" />
              <span className="text-sm font-semibold">{item.titulo}</span>
              <ChevronRight className={`ml-auto h-4 w-4 ${isAtivo ? "opacity-100" : "opacity-50"}`} />
            </motion.button>
          );
        })}
      </nav>
      <div className="mt-auto p-5 text-xs text-muted-foreground">
        <div className="rounded-2xl p-4 border bg-white/70">
          <div className="font-semibold mb-1">Dica</div>
          Use o menu para navegar entre módulos.
        </div>
      </div>
    </aside>
  );
}

function CartaoKPI({ titulo, valor, subtitulo, destaque=false, primaryColor }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`transition overflow-hidden`} style={destaque ? { borderColor: hexToRgba(primaryColor, 0.3) } : {}}>
        {destaque ? (
          <div className="p-5 text-white" style={{ backgroundColor: primaryColor }}>
            <div className="text-sm/5 opacity-90">{titulo}</div>
            <div className="text-4xl font-extrabold tracking-tight mt-1">{valor}</div>
            {subtitulo && <div className="text-xs/5 opacity-90 mt-1">{subtitulo}</div>}
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight">{titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{valor}</div>
              {subtitulo && (
                <div className="text-xs text-muted-foreground mt-1">{subtitulo}</div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
}

// ---------- Seções ----------
function SecaoVisaoGeral({ user }) {
  const [stats, setStats] = useState({
    activeStudents: '--',
    pendingPayments: '--',
    lowStock: '--'
  });
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const primaryColor = user?.primaryColor || "#0ea5e9";

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        
        const results = await Promise.allSettled([
          studentsApi.getStats(),
          paymentsApi.getAll({ status: 'PENDING', limit: 1 }),
          materialsApi.getStats(),
          tutoringsApi.getAll({ status: 'SCHEDULED', limit: 5 })
        ]);

        if (!mounted) return;

        const studentsRes = results[0].status === 'fulfilled' ? results[0].value : null;
        const paymentsRes = results[1].status === 'fulfilled' ? results[1].value : null;
        const materialsRes = results[2].status === 'fulfilled' ? results[2].value : null;
        const tutoringsRes = results[3].status === 'fulfilled' ? results[3].value : null;

        setStats({
          activeStudents: studentsRes?.active ?? (studentsRes?.total ?? 0),
          pendingPayments: paymentsRes?.pagination?.total ?? 0,
          lowStock: materialsRes?.lowStockCount ?? 0
        });

        setUpcomingClasses(tutoringsRes?.tutorings || []);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => { mounted = false; };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="grid gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border bg-white/80 backdrop-blur-xl">
        <div className="relative p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-white/80">
              <LayoutGrid className="h-3.5 w-3.5" /> Painel de Reforço Escolar
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl tracking-tight" style={{ fontFamily: "'Caveat', cursive", fontWeight: 'normal' }}>
              Gerencie alunos, reforços e finanças com <span style={{ color: primaryColor }}>Leveza</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-prose">
              Visão geral dos principais indicadores do sistema.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CartaoKPI titulo="Alunos ativos" valor={stats.activeStudents} subtitulo="no período" destaque primaryColor={primaryColor} />
            <CartaoKPI titulo="Cobranças pendentes" valor={stats.pendingPayments} subtitulo="CORA" destaque primaryColor={primaryColor} />
            <CartaoKPI titulo="Itens críticos" valor={stats.lowStock} subtitulo="Estoque" destaque primaryColor={primaryColor} />
          </div>
        </div>
      </div>

      {/* Próximas aulas */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4"/> Próximas aulas de reforço</CardTitle>
            <Badge variant="secondary" className="gap-1"><Crown className="h-3 w-3"/>Destaque</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Próxima aula</TableHead>
                <TableHead>Plano</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma aula agendada para breve.
                  </TableCell>
                </TableRow>
              ) : (
                upcomingClasses.map((aula) => (
                  <TableRow key={aula.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-medium">{aula.student?.name || 'Aluno'}</TableCell>
                    <TableCell>{aula.subject}</TableCell>
                    <TableCell>{aula.topic || '--'}</TableCell>
                    <TableCell>{formatDate(aula.nextClass)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{aula.plan || 'Avulso'}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecaoAlunos({ user }) {
  return <Students embedded user={user} />;
}

function SecaoReforcos({ user }) {
  return <Tutorings embedded user={user} />;
}

function SecaoMateriais({ user }) {
  return <Materials embedded user={user} />;
}

function SecaoFinanceiroAluno({ user }) {
  return <Payments embedded user={user} />;
}

function SecaoFinanceiroEmpresa() {
  const [loading, setLoading] = useState(true);
  const [calcData, setCalcData] = useState({
    studentCount: 0,
    basePrice: 149.00,
    extraPrice: 0,
    totalPrice: 149.00
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Busca apenas 1 para pegar o total (limit=1)
        const data = await studentsApi.getAll({ page: 1, limit: 1 });
        const count = data.total || 0;
        
        const base = 149.00;
        const extraCount = Math.max(0, count - 20);
        const extra = extraCount * 4.75;
        const total = base + extra;

        setCalcData({
          studentCount: count,
          basePrice: base,
          extraPrice: extra,
          totalPrice: total
        });
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-end">
          <Button className="gap-2 rounded-xl"><Receipt className="h-4 w-4" /> Nova fatura</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : calcData.studentCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de alunos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Base</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 149,00</div>
            <p className="text-xs text-muted-foreground">
              Até 20 alunos inclusos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adicional</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(calcData.extraPrice)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.max(0, calcData.studentCount - 20)} alunos extras (x R$ 4,75)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900">Total Mensal</CardTitle>
            <Banknote className="h-4 w-4 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(calcData.totalPrice)}</div>
            <p className="text-xs text-slate-600">
              Previsão atual
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>Detalhamento da Cobrança</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
               <TableHeader>
                   <TableRow>
                       <TableHead>Item</TableHead>
                       <TableHead className="text-right">Qtd.</TableHead>
                       <TableHead className="text-right">Valor Unit.</TableHead>
                       <TableHead className="text-right">Total</TableHead>
                   </TableRow>
               </TableHeader>
               <TableBody>
                   <TableRow>
                       <TableCell>Plano Base (até 20 alunos)</TableCell>
                       <TableCell className="text-right">1</TableCell>
                       <TableCell className="text-right">R$ 149,00</TableCell>
                       <TableCell className="text-right">R$ 149,00</TableCell>
                   </TableRow>
                   <TableRow>
                       <TableCell>Alunos Excedentes</TableCell>
                       <TableCell className="text-right">{Math.max(0, calcData.studentCount - 20)}</TableCell>
                       <TableCell className="text-right">R$ 4,75</TableCell>
                       <TableCell className="text-right">{formatCurrency(calcData.extraPrice)}</TableCell>
                   </TableRow>
                   <TableRow className="font-bold bg-slate-50">
                       <TableCell colSpan={3}>Total Estimado</TableCell>
                       <TableCell className="text-right">{formatCurrency(calcData.totalPrice)}</TableCell>
                   </TableRow>
               </TableBody>
           </Table>
        </CardContent>
      </Card>


      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Histórico de Faturas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Banco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma fatura encontrada.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecaoRelatorios() {
  const [loading, setLoading] = useState(true);
  const [studentsStats, setStudentsStats] = useState({ total: 0, active: 0, inactive: 0, byGrade: [] });
  const [tutoringsStats, setTutoringsStats] = useState({ total: 0, scheduled: 0, completed: 0, canceled: 0, bySubject: [] });
  const [materialsStats, setMaterialsStats] = useState({ totalItems: 0, totalStock: 0, lowStockCount: 0 });
  const [paymentsReport, setPaymentsReport] = useState({ stats: { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 }, payments: [], period: {} });
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  });

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const [stu, tut, mat, pay] = await Promise.all([
          studentsApi.getStats(),
          tutoringsApi.getStats(),
          materialsApi.getStats(),
          paymentsApi.getReport(period.startDate, period.endDate)
        ]);
        setStudentsStats(stu || {});
        setTutoringsStats(tut || {});
        setMaterialsStats(mat || {});
        setPaymentsReport(pay || {});
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [period.startDate, period.endDate]);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">Relatórios</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            type="month"
            className="rounded-xl"
            onChange={(e) => {
              const value = e.target.value; // yyyy-mm
              if (value) {
                const [y, m] = value.split('-').map((v) => parseInt(v));
                const start = new Date(y, m - 1, 1);
                const end = new Date(y, m, 0);
                setPeriod({ startDate: start.toISOString(), endDate: end.toISOString() });
              }
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : studentsStats.active}</div>
            <p className="text-xs text-muted-foreground">Total: {studentsStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas Agendadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : tutoringsStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Total: {tutoringsStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : materialsStats.totalStock}</div>
            <p className="text-xs text-muted-foreground">Críticos: {materialsStats.lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento do Período</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loading ? '...' : formatCurrency(paymentsReport.stats?.paidAmount)}</div>
            <p className="text-xs text-muted-foreground">Previsto: {formatCurrency(paymentsReport.stats?.totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Pagamentos no período</CardTitle>
          <div className="text-xs text-muted-foreground">
            {paymentsReport.period?.startDate?.slice(0, 10)} a {paymentsReport.period?.endDate?.slice(0, 10)}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(paymentsReport.payments || []).map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/80">
                    <TableCell>{p.student?.name}</TableCell>
                    <TableCell className="font-medium">{p.reference}</TableCell>
                    <TableCell>{p.dueDate ? new Date(p.dueDate).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'PAID' ? 'secondary' : 'outline'} className={p.status === 'PAID' ? 'bg-green-100 text-green-700' : ''}>
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!paymentsReport.payments || paymentsReport.payments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Sem registros no período</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>Alunos por série</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Série</TableHead>
                  <TableHead>Qtde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(studentsStats.byGrade || []).map((g) => (
                  <TableRow key={g.grade} className="hover:bg-slate-50/80">
                    <TableCell className="font-medium">{g.grade}</TableCell>
                    <TableCell>{g.count}</TableCell>
                  </TableRow>
                ))}
                {(!studentsStats.byGrade || studentsStats.byGrade.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">Sem dados</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>Top disciplinas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Qtde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tutoringsStats.bySubject || []).map((s) => (
                  <TableRow key={s.subject} className="hover:bg-slate-50/80">
                    <TableCell className="font-medium">{s.subject}</TableCell>
                    <TableCell>{s.count}</TableCell>
                  </TableRow>
                ))}
                {(!tutoringsStats.bySubject || tutoringsStats.bySubject.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">Sem dados</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



export default function Dashboard({ user, onLogout, onUserUpdate }) {
  const [aba, setAba] = useState("visao");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const secondaryColor = user?.secondaryColor || "#f8fafc";
  const primaryColor = user?.primaryColor || "#0ea5e9";
  const fontFamily = user?.fontFamily || "Inter";
  const textColor = user?.textColor || "#1e293b";

  useEffect(() => {
    document.body.style.fontFamily = fontFamily;
    document.body.style.color = textColor;
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--primary-color-hover', darkenHex(primaryColor, 0.1));
    
    return () => {
      document.body.style.fontFamily = '';
      document.body.style.color = '';
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--primary-color-hover');
    };
  }, [fontFamily, textColor, primaryColor]);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: secondaryColor }}>
      <Topo user={user} onLogout={onLogout} onOpenMenu={() => setMenuMobileAberto(true)} />

      {/* Navegação mobile (drawer) */}
      <MobileDrawerNav
        aberto={menuMobileAberto}
        aoFechar={() => setMenuMobileAberto(false)}
        ativo={aba}
        aoTrocar={(chave) => {
          setAba(chave);
          setMenuMobileAberto(false);
        }}
        user={user}
      />

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-4 md:py-10 flex gap-6">
        <Sidebar ativo={aba} aoTrocar={setAba} user={user} />

        <main className="flex-1 min-w-0">
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {menu.find(m => m.chave === aba)?.titulo}
              </h1>
              <p className="text-sm text-muted-foreground">Gerencie seus dados de forma eficiente</p>
            </div>
          </motion.header>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {aba === "visao" && <SecaoVisaoGeral user={user} />}
            {aba === "alunos" && <SecaoAlunos user={user} />}
            {aba === "reforcos" && <SecaoReforcos user={user} />}
            {aba === "materiais" && <SecaoMateriais user={user} />}
            {aba === "financeiro-aluno" && <SecaoFinanceiroAluno user={user} />}
            {aba === "financeiro-empresa" && <SecaoFinanceiroEmpresa />}
            {aba === "relatorios" && <SecaoRelatorios />}
            {aba === "config" && <UserConfigForm user={user} onUserUpdate={onUserUpdate} />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
