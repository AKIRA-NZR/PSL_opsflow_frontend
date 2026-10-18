import React from 'react';
import { ROLE_LABELS, type RoleName } from '@opsflow/domain';
import { COMPONENT_TOKENS } from '@opsflow/ui';

export const RolePill: React.FC<{ role: RoleName }> = ({ role }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${COMPONENT_TOKENS.rolePill[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
};
