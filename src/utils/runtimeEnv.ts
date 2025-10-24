type RuntimeEnv = Record<string, unknown>;

type ExtendedRuntimeEnv = RuntimeEnv | undefined;

export function getRuntimeEnvValue(key: string): string | undefined {
  const scopedGlobal = globalThis as typeof globalThis & { __BRICONOMY_ENV__?: ExtendedRuntimeEnv };
  const runtimeEnv = scopedGlobal.__BRICONOMY_ENV__ ?? {};
  const directValue = runtimeEnv[key];
  if (typeof directValue === 'string') {
    return directValue;
  }
  if (typeof directValue === 'number' || typeof directValue === 'boolean') {
    return String(directValue);
  }
  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const metaValue = meta.env?.[key];
  if (typeof metaValue === 'string') {
    return metaValue;
  }
  if (typeof metaValue === 'number' || typeof metaValue === 'boolean') {
    return String(metaValue);
  }
  return undefined;
}
