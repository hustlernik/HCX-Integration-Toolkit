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

function color(level: LogLevel): (s: string) => string {
  const codes: Record<LogLevel, [number, number]> = {
    debug: [36, 39], // cyan
    info: [32, 39], // green
    warn: [33, 39], // yellow
    error: [31, 39], // red
  };
  const [open, close] = codes[level];
  return (s: string) => (PRETTY ? `\u001b[${open}m${s}\u001b[${close}m` : s);
}

function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'string') {
      return value.length > MAX_VAL_LEN ? value.slice(0, MAX_VAL_LEN) + '…' : value;
    }
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}

function kvPairs(ctx?: LogContext): string {
  if (!ctx) return '';
  const parts: string[] = [];
  for (const [k, v] of Object.entries(ctx)) {
    if (v === undefined) continue;
    let val: string;
    if (v instanceof Error) {
      val = `${v.name}:${v.message}`;
    } else if (typeof v === 'object') {
      val = safeStringify(v);
    } else {
      val = String(v);
    }
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
    const line = [t, lvl, msg, kvPairs(ctx)].filter(Boolean).join(' ');
    return line;
  }
  const base = { t, level, msg, ...ctx } as Record<string, any>;
  return safeStringify(base);
}

function buildCtx(arg1?: any, arg2?: LogContext): LogContext | undefined {
  const ctx: LogContext = { ...(arg2 || {}) };
  if (
    arg1 instanceof Error ||
    (arg1 && typeof arg1 === 'object' && ('message' in arg1 || 'stack' in arg1))
  ) {
    const err: any = arg1 as any;

    ctx.err = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      status: err?.status,
      statusText: err?.statusText,
      stack: err?.stack,
    };
  } else if (arg1 !== undefined) {
    ctx.note = arg1;
  }
  return Object.keys(ctx).length ? ctx : undefined;
}

export const logger = {
  debug(msg: string, arg1?: any, ctx?: LogContext) {
    console.debug(fmt('debug', msg, buildCtx(arg1, ctx)));
  },
  info(msg: string, arg1?: any, ctx?: LogContext) {
    console.log(fmt('info', msg, buildCtx(arg1, ctx)));
  },
  warn(msg: string, arg1?: any, ctx?: LogContext) {
    console.warn(fmt('warn', msg, buildCtx(arg1, ctx)));
  },
  error(msg: string, err?: any, ctx?: LogContext) {
    console.error(fmt('error', msg, buildCtx(err, ctx)));
  },
};
