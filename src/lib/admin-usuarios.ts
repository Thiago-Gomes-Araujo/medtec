import { pode, type SessaoPermissoes } from '@/lib/api/permissoes';
import type { AcaoPermissao, ModuloPermissoesExtras, Perfil, RegraExtra, Usuario } from '@/lib/api/types';

// O perfil Administrador é fixo na API (não pode ser apagado nem ter as permissões alteradas)
// e as listagens não trazem o campo admin: o nome identifica o perfil, não libera nada.
const PERFIL_ADMINISTRADOR = 'Administrador';

export function isPerfilAdministrador(perfil: Pick<Perfil, 'nome'>): boolean {
  return perfil.nome === PERFIL_ADMINISTRADOR;
}

export function isUsuarioAdministrador(usuario: Pick<Usuario, 'perfil_nome'>): boolean {
  return usuario.perfil_nome === PERFIL_ADMINISTRADOR;
}

// Administrador só é alterado por Administrador (ROTAS_FRONT.md, seção 6).
export function podeAlterarUsuario(sessao: SessaoPermissoes, usuario: Pick<Usuario, 'perfil_nome'>): boolean {
  return sessao.admin || !isUsuarioAdministrador(usuario);
}

export function getPerfisSelecionaveis<T extends Pick<Perfil, 'nome'>>(sessao: SessaoPermissoes, perfis: T[]): T[] {
  return sessao.admin ? perfis : perfis.filter(perfil => !isPerfilAdministrador(perfil));
}

// A tela de permissões extras traz o nome do módulo ("Usuarios Permissoes Extras");
// a chave do /auth/me é o nome da rota ("usuarios_permissoes_extras").
export function getChaveDoModulo(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

// Quem não é Administrador só concede regras que ele mesmo tem (ROTAS_FRONT.md, seção 9).
export function podeConcederRegra(sessao: SessaoPermissoes, modulo: Pick<ModuloPermissoesExtras, 'nome'>, regra: Pick<RegraExtra, 'acao'>): boolean {
  return sessao.admin || pode(getChaveDoModulo(modulo.nome), regra.acao as AcaoPermissao, sessao);
}
