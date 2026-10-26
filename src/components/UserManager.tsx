'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  KeyRound, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  Bell, 
  Sparkles,
  X
} from 'lucide-react';
import { UserAccount, UserProfileType } from '@/types';
import Badge3D from '@/components/Badge3D';
import { sanitizeSearchInput } from '@/lib/security';

interface UserManagerProps {
  users: UserAccount[];
  onRefreshUsers: () => Promise<void> | void;
}

const PROFILE_OPTIONS: { type: UserProfileType; label: string; desc: string; icon: React.ElementType }[] = [
  {
    type: 'Editor de Notícias',
    label: 'Editor de Notícias',
    desc: 'Publica e edita reportagens e coberturas de polos',
    icon: FileText,
  },
  {
    type: 'Curador de Fotos',
    label: 'Curador de Fotos',
    desc: 'Adiciona fotos da galeria e banners do site',
    icon: ImageIcon,
  },
  {
    type: 'Publicador de Avisos',
    label: 'Publicador de Avisos',
    desc: 'Publica e gerencia avisos urgentes e informativos',
    icon: Bell,
  },
  {
    type: 'Operador de Conteúdo',
    label: 'Operador de Conteúdo',
    desc: 'Acesso completo a notícias, fotos e avisos (sem gestão de usuários)',
    icon: Sparkles,
  },
];

function formatCpfInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export default function UserManager({ users = [], onRefreshUsers }: UserManagerProps) {
  // Estados do formulário de cadastro
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [profileType, setProfileType] = useState<UserProfileType>('Operador de Conteúdo');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Busca e filtro na listagem
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de alteração de senha
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Usuários filtrados
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.cpf.includes(term) ||
        u.profileType.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Submissão do cadastro
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cpf,
          profileType,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Erro ao cadastrar operador');
        return;
      }

      setSuccessMessage('Operador cadastrado com sucesso!');
      setName('');
      setCpf('');
      setPassword('');
      setConfirmPassword('');
      setProfileType('Operador de Conteúdo');
      await onRefreshUsers();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage('Falha de conexão com o servidor ao cadastrar');
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar status ativo/inativo
  const handleToggleStatus = async (user: UserAccount) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          active: !user.active,
        }),
      });

      if (res.ok) {
        await onRefreshUsers();
      } else {
        const data = await res.json();
        alert('Erro: ' + (data.error || 'Falha ao alterar status'));
      }
    } catch {
      alert('Erro de conexão ao alterar status do operador');
    }
  };

  // Excluir operador
  const handleDeleteUser = async (user: UserAccount) => {
    if (!confirm(`Deseja realmente remover o operador ${user.name} (${user.cpf})? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await onRefreshUsers();
      } else {
        const data = await res.json();
        alert('Erro: ' + (data.error || 'Falha ao remover operador'));
      }
    } catch {
      alert('Erro de conexão ao remover operador');
    }
  };

  // Salvar nova senha
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    setModalError('');
    setModalSuccess('');

    if (newPassword !== confirmNewPassword) {
      setModalError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setModalError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUserForPassword.id,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error || 'Erro ao redefinir senha');
        return;
      }

      setModalSuccess('Senha atualizada com sucesso!');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setSelectedUserForPassword(null);
        setModalSuccess('');
      }, 1500);
    } catch {
      setModalError('Falha de conexão com o servidor');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. CABEÇALHO INSTITUCIONAL */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge3D variant="pill">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Controle de Acessos Operacionais</span>
              </Badge3D>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                • SEDUC-RO
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white pt-1">
              Gestão de Usuários Operadores
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed text-pretty">
              Cadastre comunicadores e operadores responsáveis por publicar notícias, gerenciar fotos do site e cadastrar avisos. Estes usuários possuem acesso restrito às suas atribuições e não têm privilégios de gestor.
            </p>
          </div>

          {/* Cards de Métricas Rápidas */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-center">
              <span className="block text-lg font-bold font-mono text-[#004A99] dark:text-[#00D8FF] tabular-nums">
                {users.length}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Total
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-center">
              <span className="block text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {users.filter((u) => u.active !== false).length}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Ativos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FORMULÁRIO DE CADASTRO DE NOVO OPERADOR */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-dashed border-slate-200 dark:border-[#1A365D] pb-3 mb-6">
          <UserPlus className="h-5 w-5 text-[#004A99] dark:text-[#00D8FF]" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Cadastrar Novo Usuário Operador
          </h3>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-3.5 flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome Completo do Operador <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-3.5 py-2.5 text-xs font-sans text-slate-900 dark:text-[#E6F4FF] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF] transition-all"
              />
            </div>

            {/* CPF */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                CPF do Operador (Login) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={cpf}
                maxLength={14}
                onChange={(e) => setCpf(formatCpfInput(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-3.5 py-2.5 text-xs font-mono tabular-nums text-slate-900 dark:text-[#E6F4FF] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF] transition-all"
              />
            </div>
          </div>

          {/* Tipo de Perfil */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tipo de Perfil &amp; Atribuição <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PROFILE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = profileType === opt.type;
                return (
                  <button
                    type="button"
                    key={opt.type}
                    onClick={() => setProfileType(opt.type)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] touch-manipulation select-none flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#004A99] dark:border-[#00D8FF] bg-[#004A99]/5 dark:bg-[#00D8FF]/10 ring-1 ring-[#004A99] dark:ring-[#00D8FF]'
                        : 'border-slate-200 dark:border-[#1A365D] bg-slate-50/50 dark:bg-[#061224]/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected
                            ? 'bg-[#004A99] text-white dark:bg-[#00D8FF] dark:text-slate-950'
                            : 'bg-slate-200 dark:bg-[#0C1E38] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Senha e Confirmação de Senha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Senha Inicial de Acesso <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-[#E6F4FF] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirmar Senha <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha digitada"
                className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-3.5 py-2.5 text-xs text-slate-900 dark:text-[#E6F4FF] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#004A99] dark:focus:ring-[#00D8FF] transition-all"
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004A99] hover:bg-[#003875] dark:bg-[#00D8FF] dark:hover:bg-cyan-300 text-white dark:text-slate-950 font-mono text-xs font-bold transition-all duration-150 ease-out active:scale-[0.97] touch-manipulation select-none cursor-pointer shadow-sm disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span>{submitting ? 'Cadastrando Operador...' : 'Cadastrar Usuário Operador'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. LISTAGEM DE USUÁRIOS CADASTRADOS */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dashed border-slate-200 dark:border-[#1A365D] pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#004A99] dark:text-[#00D8FF]" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Operadores Cadastrados ({filteredUsers.length})
            </h3>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
              maxLength={100}
              placeholder="Buscar por nome ou CPF..."
              className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] pl-9 pr-3 py-1.5 text-xs font-mono text-slate-900 dark:text-[#E6F4FF] placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#004A99] dark:focus:ring-[#00D8FF]"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224]/50">
            <p className="text-xs font-mono text-slate-500">
              Nenhum usuário operador cadastrado até o momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1A365D] text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-3 px-3">Operador</th>
                  <th className="py-3 px-3">CPF (Login)</th>
                  <th className="py-3 px-3">Perfil</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Cadastro</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredUsers.map((user) => {
                  const isActive = user.active !== false;
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#061224]/50 transition-colors"
                    >
                      {/* Nome e Avatar */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#004A99]/10 dark:bg-[#00D8FF]/10 text-[#004A99] dark:text-[#00D8FF] font-mono font-bold text-xs border border-[#004A99]/20">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user.name}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              Acesso Operador
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CPF */}
                      <td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {user.cpf}
                      </td>

                      {/* Tipo de Perfil */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20">
                          {user.profileType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActive ? 'Ativo' : 'Inativo'}</span>
                        </button>
                      </td>

                      {/* Data de Cadastro */}
                      <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                        {user.createdAt}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Alterar Senha */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForPassword(user);
                              setModalError('');
                              setModalSuccess('');
                            }}
                            title="Redefinir senha do operador"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-slate-600 dark:text-slate-300 hover:text-[#004A99] dark:hover:text-[#00D8FF] hover:border-slate-300 transition-all cursor-pointer active:scale-[0.92]"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            title="Remover operador"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 transition-all cursor-pointer active:scale-[0.92]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL DE REDEFINIÇÃO DE SENHA */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-[#1A365D] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#004A99] dark:text-[#00D8FF]" />
                <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Redefinir Senha do Operador
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForPassword(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              <p>
                Operador: <strong>{selectedUserForPassword.name}</strong>
              </p>
              <p className="font-mono text-slate-500">
                CPF: {selectedUserForPassword.cpf}
              </p>
            </div>

            {modalError && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-800 dark:text-rose-300">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nova Senha (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-3 py-2 text-xs text-slate-900 dark:text-[#E6F4FF] focus:outline-hidden focus:ring-1 focus:ring-[#004A99]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] px-3 py-2 text-xs text-slate-900 dark:text-[#E6F4FF] focus:outline-hidden focus:ring-1 focus:ring-[#004A99]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPassword(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A365D] text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-4 py-1.5 rounded-xl bg-[#004A99] dark:bg-[#00D8FF] text-white dark:text-slate-950 font-mono text-xs font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {updatingPassword ? 'Atualizando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
