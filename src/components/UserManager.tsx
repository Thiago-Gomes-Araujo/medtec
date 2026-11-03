'use client';

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  ShieldCheck,
  Search,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  SlidersHorizontal,
  Edit3,
  Plus,
  Info
} from 'lucide-react';
import type { AdminUsersData } from '@/components/admin/useAdminUsers';
import { usePermissoes } from '@/components/admin/usePermissoes';
import { getPerfisSelecionaveis, isPerfilAdministrador, podeAlterarUsuario, podeConcederRegra } from '@/lib/admin-usuarios';
import {
  medtecApi,
  ApiError,
  Usuario,
  Perfil,
  ModuloPermissoes,
  ModuloPermissoesExtras
} from '@/lib/api';

interface UserManagerProps {
  management: AdminUsersData;
}

function formatCpfInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export default function UserManager({ management }: UserManagerProps) {
  const {
    apiUsers, profiles, loadingUsers, loadingProfiles, errorUsers, errorProfiles,
    reloadUsers: loadUsers, reloadProfiles: loadProfiles,
  } = management;
  // Botões e opções seguem o /auth/me; quem não é Administrador não mexe em administradores.
  const { sessao, pode } = usePermissoes();
  // Aba ativa: 'usuarios' ou 'perfis'
  const [activeTab, setActiveTab] = useState<'usuarios' | 'perfis'>('usuarios');

  // Estados de Usuários
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);

  // Formulário de Cadastro de Usuário
  const [userName, setUserName] = useState('');
  const [userCpf, setUserCpf] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userProfileId, setUserProfileId] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');

  // Formulário de Perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Perfil | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [profileActive, setProfileActive] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Modal de Redefinição de Senha
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{ id: number; nome: string; cpf: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordModalError, setPasswordModalError] = useState('');
  const [passwordModalSuccess, setPasswordModalSuccess] = useState('');

  // Modal de Permissões Extras por Usuário
  const [selectedUserForExtras, setSelectedUserForExtras] = useState<Usuario | null>(null);
  const [extraModules, setExtraModules] = useState<ModuloPermissoesExtras[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [savingExtras, setSavingExtras] = useState(false);
  const [extrasError, setExtrasError] = useState('');
  const [extrasSuccess, setExtrasSuccess] = useState('');

  // Modal de Permissões do Perfil
  const [selectedProfileForPerms, setSelectedProfileForPerms] = useState<Perfil | null>(null);
  const [profileModules, setProfileModules] = useState<ModuloPermissoes[]>([]);
  const [selectedProfileRegraIds, setSelectedProfileRegraIds] = useState<number[]>([]);
  const [loadingProfilePerms, setLoadingProfilePerms] = useState(false);
  const [savingProfilePerms, setSavingProfilePerms] = useState(false);
  const [profilePermsError, setProfilePermsError] = useState('');
  const [profilePermsSuccess, setProfilePermsSuccess] = useState('');

  const selectableProfiles = getPerfisSelecionaveis(sessao, profiles);
  const createProfileId = selectableProfiles.some((p) => p.id === userProfileId) ? userProfileId : selectableProfiles[0]?.id;
  const canEditExtras = !!selectedUserForExtras && pode('usuarios_permissoes_extras', 'update') && podeAlterarUsuario(sessao, selectedUserForExtras);

  // Usuários exibidos com filtro de busca local se necessário
  const displayUsers = useMemo(() => {
    const filteredUsers = onlyActive ? apiUsers.filter((user) => user.ativo) : apiUsers;
    if (!searchTerm.trim()) return filteredUsers;
    const term = searchTerm.toLowerCase().trim();
    return filteredUsers.filter(
      (u) =>
        u.nome.toLowerCase().includes(term) ||
        u.cpf.includes(term) ||
        (u.perfil_nome && u.perfil_nome.toLowerCase().includes(term))
    );
  }, [apiUsers, searchTerm, onlyActive]);

  // Criar Usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (userPassword !== confirmPassword) {
      setUserFormError('As senhas digitadas não coincidem.');
      return;
    }

    if (userPassword.length < 8) {
      setUserFormError('A senha deve conter no mínimo 8 caracteres (exigência da API).');
      return;
    }

    const cleanCpf = userCpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setUserFormError('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    if (createProfileId === undefined) {
      setUserFormError('Escolha um perfil de acesso.');
      return;
    }

    setSubmittingUser(true);
    try {
      await medtecApi.usuarios.create({
        nome: userName,
        cpf: cleanCpf,
        password: userPassword,
        perfil_id: createProfileId,
        ativo: true,
      });

      setUserFormSuccess('Usuário cadastrado com sucesso no servidor oficial!');
      setUserName('');
      setUserCpf('');
      setUserPassword('');
      setConfirmPassword('');
      await loadUsers();

      setTimeout(() => setUserFormSuccess(''), 4000);
    } catch (err: unknown) {
      setUserFormError(ApiError.getFriendlyMessage(err));
    } finally {
      setSubmittingUser(false);
    }
  };

  // Alternar status ativo/inativo
  const handleToggleUserStatus = async (user: Usuario) => {
    try {
      await medtecApi.usuarios.update(user.id, {
        ativo: !user.ativo,
      });
      await loadUsers();
    } catch (err: unknown) {
      alert('Erro: ' + ApiError.getFriendlyMessage(err));
    }
  };

  // Excluir Usuário
  const handleDeleteUser = async (user: Usuario) => {
    if (!confirm(`Deseja realmente excluir o usuário ${user.nome} (${user.cpf})? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await medtecApi.usuarios.delete(user.id);
      await loadUsers();
    } catch (err: unknown) {
      alert('Não foi possível excluir: ' + ApiError.getFriendlyMessage(err));
    }
  };

  // Redefinir Senha
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    setPasswordModalError('');
    setPasswordModalSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordModalError('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordModalError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await medtecApi.usuarios.update(selectedUserForPassword.id, {
        password: newPassword,
      });

      setPasswordModalSuccess('Senha atualizada com sucesso! Todas as sessões anteriores foram encerradas.');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setSelectedUserForPassword(null);
        setPasswordModalSuccess('');
      }, 1800);
    } catch (err: unknown) {
      setPasswordModalError(ApiError.getFriendlyMessage(err));
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Abrir Modal de Permissões Extras por Usuário
  const handleOpenExtrasModal = async (user: Usuario) => {
    setSelectedUserForExtras(user);
    setExtrasError('');
    setExtrasSuccess('');
    setLoadingExtras(true);

    try {
      const res = await medtecApi.usuarios.getPermissoesExtras(user.id);
      if (res.success && res.data) {
        setExtraModules(res.data);
        // Coleta apenas os IDs das regras extras concedidas
        const activeExtraIds: number[] = [];
        res.data.forEach((mod) => {
          mod.regras.forEach((r) => {
            if (r.extra) activeExtraIds.push(r.id);
          });
        });
        setSelectedExtraIds(activeExtraIds);
      }
    } catch (err: unknown) {
      setExtrasError(ApiError.getFriendlyMessage(err));
    } finally {
      setLoadingExtras(false);
    }
  };

  // Salvar Permissões Extras do Usuário
  const handleSaveExtras = async () => {
    if (!selectedUserForExtras) return;
    setSavingExtras(true);
    setExtrasError('');
    setExtrasSuccess('');

    try {
      await medtecApi.usuarios.savePermissoesExtras(selectedUserForExtras.id, selectedExtraIds);
      setExtrasSuccess('Permissões extras salvas com sucesso!');
      setTimeout(() => {
        setSelectedUserForExtras(null);
        setExtrasSuccess('');
      }, 1500);
    } catch (err: unknown) {
      setExtrasError(ApiError.getFriendlyMessage(err));
    } finally {
      setSavingExtras(false);
    }
  };

  // Abrir Modal de Permissões do Perfil
  const handleOpenProfilePermsModal = async (perfil: Perfil) => {
    setSelectedProfileForPerms(perfil);
    setProfilePermsError('');
    setProfilePermsSuccess('');
    setLoadingProfilePerms(true);

    try {
      const res = await medtecApi.perfis.getPermissoes(perfil.id);
      if (res.success && res.data) {
        setProfileModules(res.data);
        const markedIds: number[] = [];
        res.data.forEach((mod) => {
          mod.regras.forEach((r) => {
            if (r.marcada) markedIds.push(r.id);
          });
        });
        setSelectedProfileRegraIds(markedIds);
      }
    } catch (err: unknown) {
      setProfilePermsError(ApiError.getFriendlyMessage(err));
    } finally {
      setLoadingProfilePerms(false);
    }
  };

  // Salvar Permissões do Perfil
  const handleSaveProfilePerms = async () => {
    if (!selectedProfileForPerms) return;
    setSavingProfilePerms(true);
    setProfilePermsError('');
    setProfilePermsSuccess('');

    try {
      await medtecApi.perfis.savePermissoes(selectedProfileForPerms.id, selectedProfileRegraIds);
      setProfilePermsSuccess('Permissões do perfil atualizadas com sucesso!');
      setTimeout(() => {
        setSelectedProfileForPerms(null);
        setProfilePermsSuccess('');
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.erroBruto === 'perfil_admin_imutavel') {
        setProfilePermsError('O perfil Administrador sempre possui todas as permissões e não pode ser alterado.');
      } else {
        setProfilePermsError(ApiError.getFriendlyMessage(err));
      }
    } finally {
      setSavingProfilePerms(false);
    }
  };

  // Salvar Perfil (Criar ou Editar)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setSubmittingProfile(true);

    try {
      if (editingProfile) {
        await medtecApi.perfis.update(editingProfile.id, {
          nome: profileName,
          descricao: profileDesc,
          ativo: profileActive,
        });
      } else {
        await medtecApi.perfis.create({
          nome: profileName,
          descricao: profileDesc,
          ativo: profileActive,
        });
      }

      setShowProfileModal(false);
      setEditingProfile(null);
      setProfileName('');
      setProfileDesc('');
      await Promise.all([loadProfiles(), loadUsers()]);
    } catch (err: unknown) {
      setProfileError(ApiError.getFriendlyMessage(err));
    } finally {
      setSubmittingProfile(false);
    }
  };

  // Excluir Perfil
  const handleDeleteProfile = async (perfil: Perfil) => {
    if (!confirm(`Deseja realmente excluir o perfil "${perfil.nome}"?`)) return;

    try {
      await medtecApi.perfis.delete(perfil.id);
      await Promise.all([loadProfiles(), loadUsers()]);
    } catch (err: unknown) {
      alert('Não foi possível excluir o perfil: ' + ApiError.getFriendlyMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      {(errorUsers || errorProfiles) && (
        <div role="alert" className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-2">
          {errorUsers && <p>Usuários: {errorUsers}</p>}
          {errorProfiles && <p>Perfis: {errorProfiles}</p>}
          <button type="button" onClick={() => { void loadUsers(); void loadProfiles(); }} className="font-bold underline cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}
      {loadingProfiles && <p role="status" className="text-xs text-slate-500">Carregando perfis da API...</p>}

      {/* 1. CABEÇALHO INSTITUCIONAL */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#004A99] dark:text-sky-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Controle de Acessos Operacionais • SEDUC-RO
            </p>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white pt-1">
              Gerenciamento de Equipe, Perfis e Permissões
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Gerencie operadores por CPF, perfis funcionais e matrizes de permissões integradas à API Backend oficial.
            </p>
          </div>

          {/* Abas Superiores */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#061224] p-1.5 rounded-lg border border-slate-200 dark:border-[#1A365D]">
            <button
              type="button"
              onClick={() => setActiveTab('usuarios')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'usuarios'
                  ? 'bg-white dark:bg-[#0C1E38] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Usuários e Senhas
            </button>
            {pode('perfis', 'index') && <button
              type="button"
              onClick={() => setActiveTab('perfis')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'perfis'
                  ? 'bg-white dark:bg-[#0C1E38] text-[#004A99] dark:text-[#00D8FF] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Perfis e Permissões
            </button>}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: USUÁRIOS E SENHAS                                             */}
      {/* ==================================================================== */}
      {activeTab === 'usuarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulário de Cadastro */}
          {pode('usuarios', 'create') && <div className="lg:col-span-5 bg-white dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100 dark:border-[#1A365D]">
              <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[#004A99] dark:text-cyan-400 flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Cadastrar Novo Usuário</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Acesso via CPF e senha individual</p>
              </div>
            </div>

            {userFormError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{userFormError}</span>
              </div>
            )}

            {userFormSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{userFormSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: João da Silva Santos"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224] focus:ring-2 focus:ring-[#004A99]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CPF do Usuário *
                </label>
                <input
                  type="text"
                  required
                  value={userCpf}
                  onChange={(e) => setUserCpf(formatCpfInput(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224] focus:ring-2 focus:ring-[#004A99]/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Perfil de Acesso *
                </label>
                <select
                  value={createProfileId ?? ''}
                  onChange={(e) => setUserProfileId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224] focus:ring-2 focus:ring-[#004A99]/20"
                >
                  {selectableProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.descricao ? `— ${p.descricao}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Senha (mín. 8 dígitos) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-3 pr-8 py-2.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingUser || loadingProfiles || !!errorProfiles || selectableProfiles.length === 0}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>{submittingUser ? 'Cadastrando na API...' : 'Cadastrar Usuário'}</span>
              </button>
            </form>
          </div>}

          {/* Listagem de Usuários */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#0C1E38] border border-slate-200/90 dark:border-[#1A365D] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1A365D]">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Equipe Cadastrada ({displayUsers.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Contas sincronizadas com o banco oficial
                  </p>
                </div>

                {/* Filtro e Busca */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome ou CPF..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlyActive(!onlyActive)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
                      onlyActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-[#1A365D] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Ativos
                  </button>
                </div>
              </div>

              {loadingUsers ? (
                <div className="py-8 text-center text-xs text-slate-500">Carregando usuários da API...</div>
              ) : errorUsers && apiUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">Não foi possível carregar os usuários.</div>
              ) : displayUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">Nenhum usuário encontrado.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-[#1A365D]">
                  {displayUsers.map((user) => (
                    <div
                      key={user.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#061224] px-2 rounded-lg transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {user.nome}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.ativo
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                            }`}
                          >
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span>CPF: {user.cpf}</span>
                          <span>•</span>
                          <span>Perfil: {user.perfil_nome || `Perfil #${user.perfil_id}`}</span>
                        </div>
                      </div>

                      {/* Ações por Usuário */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {!podeAlterarUsuario(sessao, user) && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Só o Administrador altera</span>
                        )}
                        {/* Permissões Extras */}
                        {pode('usuarios_permissoes_extras', 'show') && <button
                          type="button"
                          onClick={() => handleOpenExtrasModal(user)}
                          title="Permissões Extras do Usuário"
                          className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                        >
                          <SlidersHorizontal size={13} />
                          <span>Extras</span>
                        </button>}

                        {/* Trocar Senha */}
                        {pode('usuarios', 'update') && podeAlterarUsuario(sessao, user) && <button
                          type="button"
                          onClick={() => setSelectedUserForPassword(user)}
                          title="Redefinir Senha"
                          className="p-1.5 rounded-md border border-slate-200 dark:border-[#1A365D] bg-white dark:bg-[#0C1E38] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <KeyRound size={14} />
                        </button>}

                        {/* Alternar Ativo */}
                        {pode('usuarios', 'update') && podeAlterarUsuario(sessao, user) && <button
                          type="button"
                          onClick={() => handleToggleUserStatus(user)}
                          title={user.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                          className={`px-2 py-1 rounded-md text-xs font-bold cursor-pointer ${
                            user.ativo
                              ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                              : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                          }`}
                        >
                          {user.ativo ? 'Desativar' : 'Ativar'}
                        </button>}

                        {/* Excluir */}
                        {pode('usuarios', 'destroy') && podeAlterarUsuario(sessao, user) && <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          title="Excluir Usuário"
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: PERFIS E PERMISSÕES                                            */}
      {/* ==================================================================== */}
      {activeTab === 'perfis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0C1E38] p-6 rounded-2xl border border-slate-200 dark:border-[#1A365D]">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Perfis de Acesso Cadastrados ({profiles.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cada perfil define o conjunto padrão de permissões atribuído aos usuários.
              </p>
            </div>
            {pode('perfis', 'create') && <button
              type="button"
              onClick={() => {
                setEditingProfile(null);
                setProfileName('');
                setProfileDesc('');
                setProfileActive(true);
                setShowProfileModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Novo Perfil</span>
            </button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-[#0C1E38] border border-slate-200 dark:border-[#1A365D] rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{p.nome}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.ativo
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      }`}
                    >
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {p.descricao || 'Sem descrição cadastrada'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#1A365D] flex items-center justify-between gap-2">
                  {pode('perfis_permissoes', 'show') && <button
                    type="button"
                    onClick={() => handleOpenProfilePermsModal(p)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#004A99] dark:text-[#00D8FF] hover:underline cursor-pointer"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Permissões</span>
                  </button>}

                  <div className="flex items-center gap-1">
                    {pode('perfis', 'update') && <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(p);
                        setProfileName(p.nome);
                        setProfileDesc(p.descricao || '');
                        setProfileActive(p.ativo);
                        setShowProfileModal(true);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                      title="Editar Perfil"
                    >
                      <Edit3 size={14} />
                    </button>}
                    {!isPerfilAdministrador(p) && pode('perfis', 'destroy') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProfile(p)}
                        className="p-1 rounded text-red-500 hover:text-red-700 cursor-pointer"
                        title="Excluir Perfil"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: REDEFINIR SENHA DO USUÁRIO                                    */}
      {/* ==================================================================== */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1E38] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-[#1A365D] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound size={16} className="text-[#004A99] dark:text-cyan-400" />
                Redefinir Senha
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUserForPassword(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Usuário: <strong>{selectedUserForPassword.nome}</strong> (CPF {selectedUserForPassword.cpf})
            </p>

            {passwordModalError && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs">{passwordModalError}</div>
            )}
            {passwordModalSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs">{passwordModalSuccess}</div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nova Senha (mín. 8 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha segura"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPassword(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {updatingPassword ? 'Salvando...' : 'Salvar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PERMISSÕES EXTRAS POR USUÁRIO                                 */}
      {/* ==================================================================== */}
      {selectedUserForExtras && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1E38] rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-[#1A365D] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A365D]">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#004A99] dark:text-cyan-400" />
                  Permissões Extras: {selectedUserForExtras.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Conceda exceções específicas além das permissões já herdadas do perfil ({selectedUserForExtras.perfil_nome}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForExtras(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {!podeAlterarUsuario(sessao, selectedUserForExtras) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-lg text-xs flex items-center gap-2">
                <Info size={15} className="shrink-0" />
                <span>Somente o Administrador pode alterar administradores.</span>
              </div>
            )}

            {extrasError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs">{extrasError}</div>
            )}
            {extrasSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs">{extrasSuccess}</div>
            )}

            {loadingExtras ? (
              <div className="py-12 text-center text-xs text-slate-500">Carregando permissões do usuário...</div>
            ) : (
              <div className="space-y-4">
                {extraModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] space-y-2.5"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Módulo: {mod.nome}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mod.regras.map((regra) => {
                        const isInherited = regra.do_perfil;
                        const isExtraChecked = selectedExtraIds.includes(regra.id);
                        // Só se concede o que se tem; linhas de administradores ficam travadas para quem não é admin.
                        const isLocked = !canEditExtras || !podeConcederRegra(sessao, mod, regra);

                        return (
                          <label
                            key={regra.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition ${
                              isInherited || isLocked
                                ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-80 cursor-not-allowed'
                                : isExtraChecked
                                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800'
                                : 'bg-white dark:bg-[#0C1E38] border-slate-200 dark:border-[#1A365D]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isInherited || isLocked}
                              checked={isInherited || isExtraChecked}
                              onChange={(e) => {
                                if (isInherited || isLocked) return;
                                if (e.target.checked) {
                                  setSelectedExtraIds([...selectedExtraIds, regra.id]);
                                } else {
                                  setSelectedExtraIds(selectedExtraIds.filter((id) => id !== regra.id));
                                }
                              }}
                              className="mt-0.5 rounded border-slate-300 text-[#004A99] focus:ring-[#004A99]"
                            />
                            <div className="flex-1">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {regra.descricao} ({regra.acao})
                              </span>
                              {isInherited && (
                                <span className="text-[10px] text-slate-500 font-medium block">
                                  Herdada do perfil ({selectedUserForExtras.perfil_nome})
                                </span>
                              )}
                              {!isInherited && regra.extra && regra.concedido_por && (
                                <span className="text-[10px] text-sky-700 dark:text-sky-300 font-medium block">
                                  Concedido por: {regra.concedido_por}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1A365D]">
              <span className="text-[11px] text-slate-500">
                Regras do perfil e regras que você não tem não podem ser alteradas nesta tela.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForExtras(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveExtras}
                  disabled={savingExtras || loadingExtras || !canEditExtras}
                  className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingExtras ? 'Salvando...' : 'Salvar Permissões Extras'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: MATRIZ DE PERMISSÕES DO PERFIL                                */}
      {/* ==================================================================== */}
      {selectedProfileForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1E38] rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-[#1A365D] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A365D]">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#004A99] dark:text-cyan-400" />
                  Matriz de Permissões: {selectedProfileForPerms.nome}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Marque ou desmarque as ações autorizadas para todos os usuários com este perfil.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfileForPerms(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {profilePermsError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs">{profilePermsError}</div>
            )}
            {profilePermsSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs">{profilePermsSuccess}</div>
            )}

            {isPerfilAdministrador(selectedProfileForPerms) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 rounded-lg text-xs flex items-center gap-2">
                <Info size={15} className="shrink-0" />
                <span>O perfil Administrador possui todas as permissões do sistema de forma imutável.</span>
              </div>
            )}

            {loadingProfilePerms ? (
              <div className="py-12 text-center text-xs text-slate-500">Carregando permissões do perfil...</div>
            ) : (
              <div className="space-y-4">
                {profileModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-[#1A365D] bg-slate-50 dark:bg-[#061224] space-y-2.5"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Módulo: {mod.nome}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mod.regras.map((regra) => {
                        const isChecked = selectedProfileRegraIds.includes(regra.id);
                        const isAdmin = isPerfilAdministrador(selectedProfileForPerms) || !pode('perfis_permissoes', 'update');

                        return (
                          <label
                            key={regra.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition ${
                              isChecked
                                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800'
                                : 'bg-white dark:bg-[#0C1E38] border-slate-200 dark:border-[#1A365D]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isAdmin}
                              checked={isChecked}
                              onChange={(e) => {
                                if (isAdmin) return;
                                if (e.target.checked) {
                                  setSelectedProfileRegraIds([...selectedProfileRegraIds, regra.id]);
                                } else {
                                  setSelectedProfileRegraIds(selectedProfileRegraIds.filter((id) => id !== regra.id));
                                }
                              }}
                              className="rounded border-slate-300 text-[#004A99] focus:ring-[#004A99]"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {regra.descricao} ({regra.acao})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1A365D]">
              <span className="text-[11px] text-slate-500">
                Alterações entram em vigor na próxima requisição dos usuários.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfileForPerms(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfilePerms}
                  disabled={savingProfilePerms || loadingProfilePerms || isPerfilAdministrador(selectedProfileForPerms) || !pode('perfis_permissoes', 'update')}
                  className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingProfilePerms ? 'Salvando...' : 'Salvar Permissões'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CRIAR / EDITAR PERFIL                                         */}
      {/* ==================================================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0C1E38] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-[#1A365D] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingProfile ? 'Editar Perfil' : 'Novo Perfil de Acesso'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {profileError && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs">{profileError}</div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Perfil *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ex: Curador Pedagógico"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição das Atribuições
                </label>
                <textarea
                  rows={2}
                  value={profileDesc}
                  onChange={(e) => setProfileDesc(e.target.value)}
                  placeholder="Descreva as funções deste perfil..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1A365D] text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-[#061224]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={profileActive}
                    onChange={(e) => setProfileActive(e.target.checked)}
                    className="rounded border-slate-300 text-[#004A99]"
                  />
                  <span>Perfil Ativo no Sistema</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="px-4 py-2 rounded-lg bg-[#004A99] hover:bg-[#003875] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {submittingProfile ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
