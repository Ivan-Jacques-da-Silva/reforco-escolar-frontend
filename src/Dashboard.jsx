import React, { useMemo, useState } from "react";
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
  CheckCircle2,
  XCircle,
  Bell,
  Sparkles,
  LayoutGrid,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Students from "./pages/Students";

// =====================================================
// Reforço Escolar — UI clara (sem degradê / sem cores escuras)
// - React + Tailwind + shadcn + framer-motion
// - Visual clean: tons claros, bordas suaves, microanimações
// - Variáveis e funções em português
// =====================================================

// ---------- Mock de dados ----------
const dadosAlunosExemplo = [
  { id: "A001", nome: "Ana Souza", serie: "7º Ano", telefone: "(55) 99999-1111", status: "ativo", mensalidade: 149.9 },
  { id: "A002", nome: "Bruno Lima", serie: "8º Ano", telefone: "(55) 98888-2222", status: "ativo", mensalidade: 149.9 },
  { id: "A003", nome: "Carla Mendes", serie: "9º Ano", telefone: "(55) 97777-3333", status: "pendente", mensalidade: 149.9 },
  { id: "A004", nome: "Diego Santos", serie: "1º EM", telefone: "(55) 96666-4444", status: "inativo", mensalidade: 149.9 },
];

const dadosReforcosExemplo = [
  { id: "R101", alunoId: "A001", aluno: "Ana Souza", disciplina: "Matemática", assunto: "Equações do 1º grau", plano: "Pacote 8 aulas", proximaAula: "15/09/2025 15:00" },
  { id: "R102", alunoId: "A002", aluno: "Bruno Lima", disciplina: "Português", assunto: "Interpretação de texto", plano: "Pacote 4 aulas", proximaAula: "16/09/2025 10:00" },
  { id: "R103", alunoId: "A003", aluno: "Carla Mendes", disciplina: "Física", assunto: "Cinemática", plano: "Aula avulsa", proximaAula: "17/09/2025 14:30" },
];

const dadosMateriaisExemplo = [
  { sku: "MAT-001", nome: "Caderno 96 folhas", quantidade: 40, minimo: 10 },
  { sku: "MAT-002", nome: "Lápis HB nº2", quantidade: 120, minimo: 50 },
  { sku: "MAT-003", nome: "Borracha branca", quantidade: 25, minimo: 20 },
  { sku: "MAT-004", nome: "Apontador", quantidade: 8, minimo: 15 },
];

const dadosCobrancasAlunoExemplo = [
  { id: "C001", aluno: "Ana Souza", referencia: "Mensalidade 09/2025", valor: 149.9, status: "pago", gateway: "CORA" },
  { id: "C002", aluno: "Bruno Lima", referencia: "Mensalidade 09/2025", valor: 149.9, status: "pendente", gateway: "CORA" },
  { id: "C003", aluno: "Carla Mendes", referencia: "Mensalidade 09/2025", valor: 149.9, status: "em_processamento", gateway: "CORA" },
];

const dadosFinanceiroEmpresaExemplo = [
  { id: "F001", descricao: "Mensalidade Escola X (15 alunos)", valor: 118.0, status: "pago", banco: "SICOOB" },
  { id: "F002", descricao: "Mensalidade Escola Y (32 alunos)", valor: 158.4, status: "pendente", banco: "SICOOB" },
];

const menu = [
  { chave: "visao", titulo: "Visão Geral", icone: Home },
  { chave: "alunos", titulo: "Alunos", icone: Users },
  { chave: "reforcos", titulo: "Reforços", icone: BookOpen },
  { chave: "materiais", titulo: "Materiais", icone: Boxes },
  { chave: "financeiro-aluno", titulo: "Financeiro (Aluno)", icone: CreditCard },
  { chave: "financeiro-empresa", titulo: "Financeiro (Empresa)", icone: Banknote },
  { chave: "relatorios", titulo: "Relatórios", icone: BarChart3 },
  { chave: "config", titulo: "Configurações", icone: Settings },
];

// ---------- Componentes de layout ----------
function Marca() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="size-9 rounded-2xl bg-sky-400 shadow-inner" />
        <Sparkles className="absolute -right-1 -bottom-1 h-4 w-4 text-amber-400" />
      </div>
      <div>
        <div className="font-extrabold tracking-tight leading-none">Reforço</div>
        <div className="text-[10px] uppercase text-muted-foreground">Painel</div>
      </div>
    </div>
  );
}

function Topo({ user, onLogout }) {
  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 h-14 flex items-center justify-between">
        <Marca />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl"><Bell className="h-5 w-5" /></Button>
          <div className="flex items-center gap-2 rounded-2xl px-2 py-1 bg-slate-200 text-slate-900">
            <div className="size-6 rounded-xl bg-white/70 border" />
            <div className="text-xs leading-tight">
              <div className="font-semibold">{user?.email ? user.email.split('@')[0] : 'Ivan'}</div>
              <div className="opacity-70">Admin</div>
            </div>
          </div>
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

function Sidebar({ ativo, aoTrocar }) {
  return (
    <aside className="hidden md:flex md:flex-col w-72 shrink-0 border-r bg-white/80 backdrop-blur-xl rounded-r-3xl overflow-hidden">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <Marca />
          <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3"/>Pro</Badge>
        </div>
      </div>
      <nav className="p-3 space-y-2">
        {menu.map((item) => {
          const Icone = item.icone;
          const isAtivo = ativo === item.chave;
          return (
            <motion.button
              key={item.chave}
              onClick={() => aoTrocar(item.chave)}
              whileHover={{ scale: 1.01 }}
              className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition border ${
                isAtivo
                  ? "bg-sky-100 text-sky-900 border-sky-300 shadow"
                  : "hover:bg-slate-50 border-transparent"
              }`}
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

function CartaoKPI({ titulo, valor, subtitulo, destaque=false }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`transition overflow-hidden ${destaque ? "border-sky-200" : ""}`}>
        {destaque ? (
          <div className="p-5 bg-sky-500/90 text-white">
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
function SecaoVisaoGeral() {
  const ativos = dadosAlunosExemplo.filter((a) => a.status === "ativo").length;
  const pendentes = dadosCobrancasAlunoExemplo.filter((c) => c.status !== "pago").length;
  const baixoEstoque = dadosMateriaisExemplo.filter((m) => m.quantidade <= m.minimo).length;

  return (
    <div className="grid gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border bg-white/80 backdrop-blur-xl">
        <div className="relative p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-white/80">
              <LayoutGrid className="h-3.5 w-3.5" /> Painel de Reforço Escolar
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
              Gerencie alunos, reforços e finanças com <span className="text-sky-600">leveza</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-prose">
              Visão geral do dia, status de cobranças e estoque — tudo em um só lugar.
            </p>
            <div className="mt-4 flex gap-2">
              <Button className="rounded-xl bg-sky-500 hover:bg-sky-600">Nova ação</Button>
              <Button variant="outline" className="rounded-xl">Ajuda</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CartaoKPI titulo="Alunos ativos" valor={ativos} subtitulo="no período" destaque />
            <CartaoKPI titulo="Cobranças pendentes" valor={pendentes} subtitulo="CORA" destaque />
            <CartaoKPI titulo="Itens críticos" valor={baixoEstoque} subtitulo="Estoque" destaque />
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
              {dadosReforcosExemplo.map((r) => (
                <TableRow key={r.id} className="hover:bg-slate-50/80">
                  <TableCell>{r.aluno}</TableCell>
                  <TableCell>{r.disciplina}</TableCell>
                  <TableCell>{r.assunto}</TableCell>
                  <TableCell>{r.proximaAula}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.plano}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SecaoAlunos() {
  return <Students />;
}

function SecaoReforcos() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Agenda de reforços</div>
          <div className="text-sm text-muted-foreground">Gerencie aulas, pacotes e conteúdos</div>
        </div>
        <Button className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600"><Plus className="h-4 w-4" /> Nova aula</Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Próximas aulas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
              {dadosReforcosExemplo.map((r) => (
                <TableRow key={r.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-medium">{r.aluno}</TableCell>
                  <TableCell>{r.disciplina}</TableCell>
                  <TableCell>{r.assunto}</TableCell>
                  <TableCell>{r.proximaAula}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.plano}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SecaoMateriais() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Estoque de materiais</div>
          <div className="text-sm text-muted-foreground">Itens escolares e insumos</div>
        </div>
        <Button className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600"><Plus className="h-4 w-4" /> Novo item</Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Itens cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Qtd.</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosMateriaisExemplo.map((m) => {
                const critico = m.quantidade <= m.minimo;
                return (
                  <TableRow key={m.sku} className="hover:bg-slate-50/80">
                    <TableCell className="font-mono text-xs">{m.sku}</TableCell>
                    <TableCell className="font-medium">{m.nome}</TableCell>
                    <TableCell>{m.quantidade}</TableCell>
                    <TableCell>{m.minimo}</TableCell>
                    <TableCell>
                      {critico ? (
                        <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3"/> Repor</Badge>
                      ) : (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 gap-1"><CheckCircle2 className="h-3 w-3"/> OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SecaoFinanceiroAluno() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Cobranças (Gateway CORA)</div>
          <div className="text-sm text-muted-foreground">Simulação de integração</div>
        </div>
        <Button className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600"><Receipt className="h-4 w-4" /> Gerar cobrança</Button>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Mensalidades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gateway</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosCobrancasAlunoExemplo.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-medium">{c.aluno}</TableCell>
                  <TableCell>{c.referencia}</TableCell>
                  <TableCell>R$ {c.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    {c.status === "pago" && <Badge className="bg-emerald-600 hover:bg-emerald-600">Pago</Badge>}
                    {c.status === "pendente" && <Badge className="bg-amber-500 hover:bg-amber-500">Pendente</Badge>}
                    {c.status === "em_processamento" && <Badge variant="secondary">Processando</Badge>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{c.gateway}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SecaoFinanceiroEmpresa() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Recebíveis (SICOOB)</div>
          <div className="text-sm text-muted-foreground">Faturas do cliente para sua empresa</div>
        </div>
        <Button className="gap-2 rounded-xl bg-sky-500 hover:bg-sky-600"><Receipt className="h-4 w-4" /> Gerar fatura</Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Faturas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
              {dadosFinanceiroEmpresaExemplo.map((f) => (
                <TableRow key={f.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-medium">{f.descricao}</TableCell>
                  <TableCell>R$ {f.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    {f.status === "pago" && <Badge className="bg-emerald-600 hover:bg-emerald-600">Pago</Badge>}
                    {f.status === "pendente" && <Badge className="bg-amber-500 hover:bg-amber-500">Pendente</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{f.banco}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SecaoRelatorios() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle>Relatórios (mock)</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Exportações e gráficos podem entrar aqui (alunos, frequência, faturamento, estoque). Somente UI.
      </CardContent>
    </Card>
  );
}

function SecaoConfig() {
  const [alunosAtuais, setAlunosAtuais] = useState(15);
  const precoBase = 100; // base simbólica
  const precoPorAluno = 1.2; // por aluno (ajustável)
  const total = useMemo(() => precoBase + alunosAtuais * precoPorAluno, [alunosAtuais]);

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Plano e precificação</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 p-6">
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Alunos atuais</Label>
              <Input
                type="number"
                value={alunosAtuais}
                onChange={(e) => setAlunosAtuais(parseInt(e.target.value || "0"))}
                min={0}
                className="rounded-xl"
              />
            </div>
            <div className="text-sm text-muted-foreground">Base: R$ {precoBase.toFixed(2)} • Por aluno: R$ {precoPorAluno.toFixed(2)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CartaoKPI titulo="Total simulado" valor={`R$ ${total.toFixed(2)}`} subtitulo="mensal" destaque />
            <CartaoKPI titulo="Margem estimada" valor={`R$ ${(total * 0.35).toFixed(2)}`} subtitulo="exemplo" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle>Integrações (mock)</CardTitle>
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
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [aba, setAba] = useState("visao");

  return (
    <div className="min-h-screen bg-slate-50">
      <Topo user={user} onLogout={onLogout} />

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-10 flex gap-6">
        <Sidebar ativo={aba} aoTrocar={setAba} />

        <main className="flex-1">
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {menu.find(m => m.chave === aba)?.titulo}
              </h1>
              <p className="text-sm text-muted-foreground">Somente front-end (dados fictícios)</p>
            </div>
            <div className="hidden md:flex gap-2">
              <Button variant="outline" className="rounded-xl">Ajuda</Button>
              <Button className="rounded-xl bg-sky-500 hover:bg-sky-600">Nova ação</Button>
            </div>
          </motion.header>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {aba === "visao" && <SecaoVisaoGeral />}
            {aba === "alunos" && <SecaoAlunos />}
            {aba === "reforcos" && <SecaoReforcos />}
            {aba === "materiais" && <SecaoMateriais />}
            {aba === "financeiro-aluno" && <SecaoFinanceiroAluno />}
            {aba === "financeiro-empresa" && <SecaoFinanceiroEmpresa />}
            {aba === "relatorios" && <SecaoRelatorios />}
            {aba === "config" && <SecaoConfig />}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
