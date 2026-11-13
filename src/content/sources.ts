/** Sources [S#] (spec §11) with publisher, NASA-primary flag and the Phase 3 audit result. */
import spec from './generated/spec.json';
import { AUDIT_DATE, SOURCE_AUDIT, type AuditStatus } from './sourceAudit';

export interface Source {
  id: string;
  title: string;
  url: string;
  urls: string[];
  publisher: string;
  isNasaPrimary: boolean;
  audit: AuditStatus | 'not-audited';
  verifiedAt?: string;
  note?: string;
}

const NASA_HOSTS = /(^|\.)nasa\.gov$|^catalog\.data\.gov$/;

export const SPEC_VERSION: string = spec.specVersion;

export const SOURCES: Source[] = spec.sources.map((s) => {
  const host = new URL(s.url).hostname.replace(/^www\./, '');
  const a = SOURCE_AUDIT[s.id];
  const out: Source = {
    ...s,
    publisher: host,
    isNasaPrimary: NASA_HOSTS.test(host),
    audit: a?.status ?? 'not-audited',
  };
  if (a?.status === 'ok') out.verifiedAt = AUDIT_DATE;
  if (a?.note) out.note = a.note;
  return out;
});

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}
