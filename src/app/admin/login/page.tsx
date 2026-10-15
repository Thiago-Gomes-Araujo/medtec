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

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
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

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTarget = searchParams.get('redirect') || '/admin';
        router.push(redirectTarget);
        router.refresh();
      } else {
        setError(data.error || 'Credenciais inválidas. Verifique seu usuário e senha.');
      }
    } catch {
      setError('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0b1729]">
      
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
                unoptimized
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
          <h1 className="text-3xl xl:text-[40px] font-extrabold text-white leading-[1.18] tracking-tight text-center">
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
      <div className="flex-1 flex flex-col justify-center items-center bg-white p-6 sm:p-10 md:p-14 min-h-screen">
        
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
                unoptimized
                priority
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            {/* Badge Acesso Administrativo */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-[#005ca9] uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005ca9]" />
              <span>Acesso Administrativo</span>
            </div>

            {/* Título */}
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight">
              Painel Gestor MEDTEC
            </h2>

            {/* Subtítulo */}
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Notícias, fotos e avisos em um só lugar.
            </p>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Campo Usuário */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005ca9]/20 focus:border-[#005ca9] transition-all bg-white"
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Senha de acesso
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-[#005ca9] hover:underline cursor-pointer"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005ca9]/20 focus:border-[#005ca9] transition-all bg-white"
                />
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox Manter conectado */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#005ca9] focus:ring-[#005ca9] cursor-pointer"
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
          <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] text-slate-500 flex items-center gap-2">
            <Info size={14} className="text-[#005ca9] shrink-0" />
            <span>Acesso restrito a gestores e técnicos autorizados da SEDUC-RO.</span>
          </div>

          {/* Divisor */}
          <div className="border-t border-slate-100 my-6" />

          {/* Links de Rodapé */}
          <div className="space-y-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#005ca9] flex items-center justify-center mx-auto">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Recuperação de Acesso</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Para redefinir sua senha de gestor do MEDTEC, solicite suporte à coordenação de tecnologia educacional da SEDUC.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700">
              suporte.medtec@seduc.ro.gov.br
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 bg-[#005ca9] text-white rounded-lg text-xs font-semibold hover:bg-[#004e8f] transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
