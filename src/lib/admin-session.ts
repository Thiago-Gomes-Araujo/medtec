import type { AuthUser } from './api/types';

// Classificação legada de gestor Rails. Não valida sessão, atividade do usuário
// nem as condições adicionais de autorização dos módulos.
export function isRailsGestor(user: Pick<AuthUser, 'perfil_nome' | 'perfil_id' | 'id'>): boolean {
  return user.perfil_nome === 'Administrador' || user.perfil_id === 3 || user.id === 1;
}

export function getRailsSessionFields(user: AuthUser) {
  return {
    isGestor: isRailsGestor(user),
    username: user.cpf,
    name: user.nome,
    profileType: user.perfil_nome,
  };
}

// Perfis do seed Rails com regras de dúvidas: Administrador (classificado como gestor) e Gestor.
export function canAccessDuvidas(session: { isGestor?: boolean; profileType?: string }): boolean {
  return session.isGestor === true || session.profileType === 'Gestor';
}

// O contrato de projetos dá as permissões aos mesmos perfis.
export const canAccessProjetos = canAccessDuvidas;

type LocalSessionFieldsSource = {
  isGestor?: boolean;
  user?: AuthUser['cpf'];
  name?: AuthUser['nome'];
  profileType?: AuthUser['perfil_nome'];
};

// Preserva o default local legado; esta projeção não valida a resposta.
export function getLocalSessionFields(session: LocalSessionFieldsSource) {
  return {
    isGestor: session.isGestor !== false,
    username: session.user,
    name: session.name,
    profileType: session.profileType,
  };
}
