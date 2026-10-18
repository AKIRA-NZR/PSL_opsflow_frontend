import type { RoleName, User } from '../types/domain.types';
import type { CreateUserDTO, ServiceResult } from '../types/service.types';

export function validateAndBuildUser(params: {
  dto: CreateUserDTO;
  companyId: string;
  activeRole: RoleName;
  existingUsers: User[];
}): ServiceResult<User> {
  const { dto, companyId, activeRole, existingUsers } = params;

  if (activeRole !== 'ADMIN') {
    return {
      ok: false,
      error: {
        title: 'Permissão insuficiente',
        message: 'Apenas administradores podem adicionar novos membros à equipe.',
      },
    };
  }

  const cleanName = dto.name.trim();
  const cleanEmail = dto.email.trim().toLowerCase();

  if (cleanName.length < 3 || !cleanEmail.includes('@')) {
    return {
      ok: false,
      error: {
        title: 'Dados incompletos',
        message: 'Preencha um nome válido e um endereço de e-mail corporativo.',
      },
    };
  }

  const duplicate = existingUsers.find(
    (u) =>
      u.companyId === companyId &&
      u.deletedAt === null &&
      u.email.toLowerCase() === cleanEmail
  );

  if (duplicate) {
    return {
      ok: false,
      error: {
        title: 'E-mail já cadastrado',
        message: `O endereço "${cleanEmail}" já está vinculado a outro membro desta empresa.`,
        field: 'email',
      },
    };
  }

  const newUser: User = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    companyId,
    name: cleanName,
    email: cleanEmail,
    department: dto.department.trim() || 'Operações',
    roles: dto.roles.length > 0 ? dto.roles : ['EMPLOYEE'],
    active: true,
    deletedAt: null,
    createdAt: new Date().toISOString(),
  };

  return {
    ok: true,
    data: newUser,
    message: `${cleanName} foi adicionado(a) à equipe.`,
  };
}
