/**
 * Tratamento Padronizado de Erros da API MEDTEC
 * Conforme convenções de erros de docs/rotas_front.md
 */

import { ApiErrorResponse } from './types';

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors: string[];
  public readonly erroBruto?: string;
  public readonly timestamp?: string;
  public readonly raw?: unknown;

  constructor(
    message: string,
    status: number,
    errors: string[] = [],
    erroBruto?: string,
    timestamp?: string,
    raw?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.erroBruto = erroBruto;
    this.timestamp = timestamp;
    this.raw = raw;
  }

  /**
   * Verifica se o erro corresponde a token expirado (aciona renovação)
   */
  public isTokenExpired(): boolean {
    return this.status === 401 && this.errors.includes('token_expirado');
  }

  /**
   * Verifica se o erro é de autenticação (não autenticado, token revogado, usuário inativo)
   */
  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Verifica se o erro é de permissão/autorização insuficiente (403 sem_permissao)
   */
  public isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Verifica se o erro é de recurso não encontrado (404)
   */
  public isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Verifica se o erro é de validação de dados em formulário (422)
   */
  public isValidationError(): boolean {
    return this.status === 422;
  }

  /**
   * Verifica se o erro é de limite de requisições excedido (429 muitas_tentativas)
   */
  public isRateLimited(): boolean {
    return this.status === 429;
  }

  /**
   * Converte a resposta de erro bruta para mensagem amigável ao usuário em português
   */
  public static getFriendlyMessage(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.errors.includes('credenciais_invalidas')) {
        return 'CPF ou senha incorretos. Verifique suas credenciais.';
      }
      if (error.errors.includes('cpf_senha_obrigatorios')) {
        return 'Informe o CPF e a senha para continuar.';
      }
      if (error.errors.includes('usuario_inativo')) {
        return 'Este usuário está inativo no sistema. Contate a administração da SEDUC.';
      }
      if (error.errors.includes('token_revogado')) {
        return 'Sua sessão foi encerrada em outro local ou sua senha foi alterada. Faça login novamente.';
      }
      if (error.errors.includes('token_expirado')) {
        return 'Sua sessão expirou. Faça login novamente.';
      }
      if (error.errors.includes('nao_autenticado')) {
        return 'Você precisa estar autenticado para realizar esta ação.';
      }
      if (error.errors.includes('sem_permissao')) {
        return 'Você não possui permissão para executar esta operação.';
      }
      if (error.errors.includes('muitas_tentativas')) {
        return 'Muitas tentativas em pouco tempo. Aguarde 1 minuto e tente novamente.';
      }
      if (error.status === 404) {
        return 'O registro solicitado não foi encontrado no servidor.';
      }
      if (error.status === 422 && error.errors.length > 0) {
        return error.errors.join('. ');
      }
      if (error.status >= 500) {
        return 'Falha de comunicação com o servidor. Tente novamente em instantes.';
      }
      if (error.message) {
        return error.message;
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou a URL da API.';
      }
      return error.message;
    }

    return 'Ocorreu um erro inesperado ao processar a operação.';
  }

  /**
   * Mapeia lista de erros de validação (status 422) para um dicionário de campos
   * Exemplo: ["Cpf inválido", "Nome não pode ficar em branco"] => { cpf: "Cpf inválido", nome: "Nome não pode..." }
   */
  public static mapFieldErrors(errors: string[]): Record<string, string> {
    const fieldMap: Record<string, string> = {};

    for (const msg of errors) {
      const lower = msg.toLowerCase();
      if (lower.includes('cpf')) {
        fieldMap.cpf = msg;
      } else if (lower.includes('nome')) {
        fieldMap.nome = msg;
      } else if (lower.includes('senha') || lower.includes('password')) {
        fieldMap.password = msg;
      } else if (lower.includes('perfil')) {
        fieldMap.perfil_id = msg;
      } else if (lower.includes('titulo')) {
        fieldMap.titulo = msg;
      } else if (lower.includes('imagem')) {
        fieldMap.imagem = msg;
      } else if (lower.includes('sigla')) {
        fieldMap.sigla_uf = msg;
      } else {
        fieldMap.geral = fieldMap.geral ? `${fieldMap.geral}; ${msg}` : msg;
      }
    }

    return fieldMap;
  }

  /**
   * Constrói uma instância de ApiError a partir de resposta HTTP e JSON parseado
   */
  public static fromResponse(status: number, data: unknown): ApiError {
    const errorBody = (data && typeof data === 'object' ? data : {}) as Partial<ApiErrorResponse>;

    const message =
      errorBody.message ||
      (status === 404
        ? 'Registro não encontrado'
        : status === 403
        ? 'Sem permissão'
        : status === 401
        ? 'Acesso não autenticado'
        : `Erro na requisição (Status ${status})`);

    const errors = Array.isArray(errorBody.errors)
      ? errorBody.errors
      : [`http_${status}`];

    return new ApiError(
      message,
      status,
      errors,
      errorBody.erro_bruto,
      errorBody.timestamp,
      data
    );
  }
}
