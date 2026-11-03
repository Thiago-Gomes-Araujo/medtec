import type { AuthUser } from './api/types';

// Só identifica quem entrou: o que a pessoa pode fazer vem das permissões do /auth/me.
export function getRailsSessionFields(user: AuthUser) {
  return {
    username: user.cpf,
    name: user.nome,
    profileType: user.perfil_nome,
  };
}

type LocalSessionFieldsSource = {
  user?: AuthUser['cpf'];
  name?: AuthUser['nome'];
  profileType?: AuthUser['perfil_nome'];
};

// Projeção da sessão local (ADMIN_USER), que não tem permissões; não valida a resposta.
export function getLocalSessionFields(session: LocalSessionFieldsSource) {
  return {
    username: session.user,
    name: session.name,
    profileType: session.profileType,
  };
}
