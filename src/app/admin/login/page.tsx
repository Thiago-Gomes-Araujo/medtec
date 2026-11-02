'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Monitor,
  Check,
  Info
} from 'lucide-react';

import { fetchWithTimeout, setStoredTokens } from '@/lib/api';
import { getSafeAdminReturnTarget } from '@/lib/admin-auth-navigation';

// /api/auth espera até 5 s em cada uma das duas consultas à API antes de responder.
const LOGIN_TIMEOUT_MS = 15000;

export default function AdminLoginPage() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanCpf = cpf.trim();
    if (!cleanCpf || !password) {
      setError('Informe o CPF e a senha para acessar o painel.');
      setLoading(false);
      return;
    }

    try {
      // O servidor autentica e cria o cookie necessário para acessar o painel.
      const res = await fetchWithTimeout('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanCpf, password }),
      }, LOGIN_TIMEOUT_MS);

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.tokens) {
          setStoredTokens(data.tokens);
        }
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTarget = getSafeAdminReturnTarget(searchParams.get('redirect'));
        router.push(redirectTarget);
        router.refresh();
        return;
      }

      setError(data.error || 'Credenciais inválidas. Verifique seu CPF e senha.');
    } catch {
      setError('Falha de conexão com o servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0b1729] overflow-x-hidden max-w-[100vw]">
      
      {/* =========================================
          LADO ESQUERDO: BANNER MEDIAÇÃO TECNOLÓGICA
          ========================================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0b1729] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden select-none border-r border-slate-800/40">
        
        {/* Glow de fundo sutil */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo do painel esquerdo */}
        <div className="relative z-10 flex items-center gap-2.5 text-slate-300">
          <Monitor size={18} className="text-slate-300" />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">
            Educação Sem Distâncias
          </span>
        </div>

        {/* Centro com Logo circular e Frases de Impacto (Tudo Centralizado) */}
        <div className="relative z-10 max-w-lg my-auto py-8 mx-auto text-center flex flex-col items-center">
          {/* Logo circular com glow centralizado */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 rounded-full bg-sky-400/20 blur-xl scale-110" />
            <div className="relative w-48 h-48 xl:w-56 xl:h-56 rounded-full overflow-hidden border-2 border-sky-400/40 shadow-2xl flex items-center justify-center bg-[#0d223f]">
              <Image
                src="/logo-medtec.png"
                alt="Mediação Tecnológica"
                width={256}
                height={256}
                priority
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Categoria em Dourado / Âmbar */}
          <div className="text-[11px] font-bold text-[#f59e0b] tracking-[0.18em] uppercase mb-3">
            Mediação Tecnológica
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl xl:text-[40px] font-bold text-white leading-[1.18] tracking-tight text-center">
            Conectando pessoas.<br />
            Transformando futuros.
          </h1>

          {/* Subtítulo */}
          <p className="text-slate-300 text-sm xl:text-base font-normal mt-3.5 leading-relaxed max-w-md text-center">
            A educação vai além da sala de aula.
          </p>

          {/* Traço de acento dourado centralizado */}
          <div className="w-12 h-1 bg-[#f59e0b] rounded-full mt-5 mx-auto" />
        </div>

        {/* Rodapé do painel esquerdo */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-300/90 font-medium">
          <Check size={16} className="text-[#f59e0b] stroke-[2.5]" />
          <span>Conhecimento que chega mais longe.</span>
        </div>

      </div>

      {/* =========================================
          LADO DIREITO: FORMULÁRIO DO PAINEL GESTOR
          ========================================= */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white dark:bg-[#081528] p-6 sm:p-10 md:p-14 min-h-screen text-slate-900 dark:text-[#E6F4FF] transition-colors duration-200">
        
        <div className="w-full max-w-[390px] mx-auto">
          
          {/* Topo do Formulário */}
          <div className="text-center mb-6">
            {/* Logo Circular do MEDTEC (Tamanho Aumentado e Nitidez Máxima) */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4">
              <Image
                src="/logo-medtec.png"
                alt="Logo Painel Gestor MEDTEC"
                width={256}
                height={256}
                priority
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            {/* Badge Acesso Administrativo */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-[#005ca9] dark:text-[#00D8FF] uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005ca9] dark:bg-[#00D8FF]" />
              <span>Acesso Administrativo</span>
            </div>

            {/* Título */}
            <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">
              Painel Gestor MEDTEC
            </h2>

            {/* Subtítulo */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Notícias, fotos e avisos em um só lugar.
            </p>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Campo CPF */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                CPF do Operador ou Gestor
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00 (com ou sem pontuação)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-sm text-slate-800 dark:text-[#E6F4FF] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005ca9]/20 dark:focus:ring-cyan-500/20 focus:border-[#005ca9] dark:focus:border-cyan-400 transition-all bg-white dark:bg-[#0C1E38]"
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Informe o seu CPF cadastrado no sistema
              </p>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Senha de acesso
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-[#005ca9] dark:text-[#00D8FF] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-sm text-slate-800 dark:text-[#E6F4FF] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#005ca9]/20 dark:focus:ring-cyan-500/20 focus:border-[#005ca9] dark:focus:border-cyan-400 transition-all bg-white dark:bg-[#0C1E38]"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox Manter conectado */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#005ca9] dark:text-[#00D8FF] focus:ring-[#005ca9] cursor-pointer"
                />
                <span>Manter conectado</span>
              </label>
            </div>

            {/* Botão Acessar Painel */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-lg bg-[#005ca9] hover:bg-[#004e8f] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2.5 group cursor-pointer disabled:opacity-70 active:scale-[0.99]"
            >
              <span>{loading ? 'Acessando...' : 'Acessar painel de controle'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

          </form>

          {/* Aviso de acesso institucional */}
          <div className="mt-4 p-2.5 bg-slate-50 dark:bg-[#0C1E38] border border-slate-100 dark:border-[#1A365D] rounded-md text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info size={14} className="text-[#005ca9] dark:text-[#00D8FF] shrink-0" />
            <span>Acesso restrito a gestores e técnicos autorizados da SEDUC-RO.</span>
          </div>

          {/* Divisor */}
          <div className="border-t border-slate-100 dark:border-[#1A365D] my-6" />

          {/* Links de Rodapé */}
          <div className="space-y-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao portal público</span>
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={14} className="text-slate-400" />
              <span>Ambiente de acesso seguro</span>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Esqueceu a Senha */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1E38] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-slate-200 dark:border-[#1A365D]">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-cyan-950/60 text-[#005ca9] dark:text-[#00D8FF] flex items-center justify-center mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recuperação de Acesso</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Para redefinir sua senha de gestor do MEDTEC, solicite suporte à coordenação de tecnologia educacional da SEDUC.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-[#061224] rounded-lg text-xs font-mono text-slate-700 dark:text-cyan-300 border border-slate-200/60 dark:border-[#1A365D]">
              suporte.medtec@seduc.ro.gov.br
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 bg-[#005ca9] hover:bg-[#004e8f] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
