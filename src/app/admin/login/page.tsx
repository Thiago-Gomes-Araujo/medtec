'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck, Tv } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('medtec2025');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      setError('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071e3d] via-slate-900 to-[#05549d] flex flex-col justify-center items-center p-4">
      
      {/* Card de Login */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
        
        {/* Topo / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-lg mb-2">
            <Tv size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Painel Gestor MEDTEC
          </h1>
          <p className="text-xs text-slate-500">
            Acesso administrativo para publicação de notícias, fotos e avisos
          </p>
        </div>

        {/* Dica de Acesso */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-primary">
            <ShieldCheck size={14} />
            <span>Credenciais padrão para acesso:</span>
          </div>
          <div className="flex justify-between font-mono pt-1 text-slate-700">
            <span>Usuário: <b>admin</b></span>
            <span>Senha: <b>medtec2025</b></span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Usuário
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
              />
              <User size={18} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
              />
              <KeyRound size={18} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-deep text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
          >
            <span>{loading ? 'Entrando...' : 'Acessar Painel de Controle'}</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-slate-500 hover:text-primary font-medium">
            ← Voltar para o Portal Público
          </Link>
        </div>

      </div>

    </div>
  );
}

