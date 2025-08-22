type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  correlationId?: string;
  apiCallId?: string;
  endpoint?: string;
  [k: string]: any;
}

const PRETTY =
  process.env.LOG_PRETTY === '1' || (process.env.NODE_ENV !== 'production' && process.stdout.isTTY);
const MAX_VAL_LEN = Number(process.env.LOG_MAX_VAL_LEN || 5000);

//eslint-disable-next-line
function color(level: LogLevel): (_: string) => string {
  const codes: Record<LogLevel, [number, number]> = {
    debug: [36, 39],
    info: [32, 39],
    warn: [33, 39],
    error: [31, 39],
  };
  const [o, c] = codes[level];
  return (s: string) => (PRETTY ? `\u001b[${o}m${s}\u001b[${c}m` : s);
}

function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (k, v) => {
    if (typeof v === 'bigint') return v.toString();
    if (typeof v === 'string') return v.length > MAX_VAL_LEN ? v.slice(0, MAX_VAL_LEN) + '…' : v;
    if (typeof v === 'object' && v !== null) {
      if (seen.has(v)) return '[Circular]';
      seen.add(v);
    }
    return v;
  });
}

function kvPairs(ctx?: LogContext): string {
  if (!ctx) return '';
  const parts: string[] = [];
  for (const [k, v] of Object.entries(ctx)) {
    if (v === undefined) continue;
    let val: string;
    if (v instanceof Error) val = `${v.name}:${v.message}`;
    else if (typeof v === 'object') val = safeStringify(v);
    else val = String(v);
    if (val.length > MAX_VAL_LEN) val = val.slice(0, MAX_VAL_LEN) + '…';
    const needsQuote = /\s|\{|\}|\[|\]|"|,|=/.test(val);
    parts.push(`${k}=${needsQuote ? JSON.stringify(val) : val}`);
  }
  return parts.join(' ');
}

function fmt(level: LogLevel, msg: string, ctx?: LogContext) {
  const t = new Date().toISOString();
  if (PRETTY) {
    const lvl = color(level)(level.toUpperCase());
    return [t, lvl, msg, kvPairs(ctx)].filter(Boolean).join(' ');
  }
  const base = { ...(ctx || {}), t, level, msg } as Record<string, any>;
  return safeStringify(base);
}

export const logger = {
  debug(msg: string, arg1?: any, ctx?: LogContext) {
    const merged = { ...(ctx || {}) };
    if (arg1 !== undefined) merged.note = arg1;
    console.debug(fmt('debug', msg, merged));
  },
  info(msg: string, arg1?: any, ctx?: LogContext) {
    const merged = { ...(ctx || {}) };
    if (arg1 !== undefined) merged.note = arg1;
    console.log(fmt('info', msg, merged));
  },
  warn(msg: string, arg1?: any, ctx?: LogContext) {
    const merged = { ...(ctx || {}) };
    if (arg1 !== undefined) merged.note = arg1;
    console.warn(fmt('warn', msg, merged));
  },
  error(msg: string, error?: any, ctx?: LogContext) {
    const merged = { ...(ctx || {}) } as Record<string, any>;
    if (error && typeof error === 'object') {
      merged.error = {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        status: error?.status,
        statusText: error?.statusText,
        stack: error?.stack,
      };
    } else if (error) {
      merged.error = String(error);
    }
    console.error(fmt('error', msg, merged));
  },
};
