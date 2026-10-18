import type { RoleName, TicketCategory } from '../types/domain.types';
import type { CreateCategoryDTO, ServiceResult } from '../types/service.types';

export function validateAndBuildCategory(params: {
  dto: CreateCategoryDTO;
  companyId: string;
  activeRole: RoleName;
  existingCategories: TicketCategory[];
}): ServiceResult<TicketCategory> {
  const { dto, companyId, activeRole, existingCategories } = params;

  if (activeRole !== 'ADMIN') {
    return {
      ok: false,
      error: {
        title: 'Permissão de administrador necessária',
        message: 'Apenas administradores podem criar ou editar categorias de atendimento.',
      },
    };
  }

  const cleanName = dto.name.trim();
  if (cleanName.length < 3) {
    return {
      ok: false,
      error: {
        title: 'Nome inválido',
        message: 'O nome da categoria deve ter pelo menos 3 caracteres.',
        field: 'name',
      },
    };
  }

  const normalized = cleanName.toLowerCase();
  const duplicate = existingCategories.find(
    (c) =>
      c.companyId === companyId &&
      c.deletedAt === null &&
      c.name.trim().toLowerCase() === normalized
  );

  if (duplicate) {
    return {
      ok: false,
      error: {
        title: 'Categoria já existente',
        message: `Já existe uma categoria ativa chamada "${cleanName}" na sua organização.`,
        field: 'name',
      },
    };
  }

  const category: TicketCategory = {
    id: `cat-${crypto.randomUUID().slice(0, 8)}`,
    companyId,
    name: cleanName,
    description: dto.description.trim() || 'Sem descrição informada.',
    active: true,
    deletedAt: null,
    createdAt: new Date().toISOString(),
  };

  return {
    ok: true,
    data: category,
    message: `Categoria "${cleanName}" criada com sucesso.`,
  };
}
