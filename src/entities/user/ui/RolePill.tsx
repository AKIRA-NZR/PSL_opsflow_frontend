import React from 'react';
import { ROLE_LABELS, type RoleName } from '@opsflow/domain';

export const RolePill: React.FC<{ role: RoleName }> = ({ role }) => {
  const styles: Record<RoleName, string> = {
    ADMIN: 'bg-[#1c1d33] text-[#a5b4fc] border-[#2e3154]',
    TECHNICIAN: 'bg-[#14222e] text-[#7dd3fc] border-[#223a4e]',
    EMPLOYEE: 'bg-[#1b1b1b] text-[#c4c7c8] border-[#2e2e2e]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${styles[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
};
