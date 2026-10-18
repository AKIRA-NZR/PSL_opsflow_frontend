export interface DocumentMetaOptions {
  title: string;
  description?: string;
}

const DEFAULT_DESCRIPTION =
  'OPSFLOW — Plataforma corporativa para gestão de chamados, ativos de TI, triagem operacional e monitoramento de SLA em tempo real.';

export function updateDocumentMeta({
  title,
  description = DEFAULT_DESCRIPTION,
}: DocumentMetaOptions): void {
  if (typeof document === 'undefined') return;

  const formattedTitle = title.includes('OPSFLOW')
    ? title
    : `${title} · OPSFLOW`;
  document.title = formattedTitle;

  let metaDesc = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]'
  );
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  let ogTitle = document.querySelector<HTMLMetaElement>(
    'meta[property="og:title"]'
  );
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', formattedTitle);
}

