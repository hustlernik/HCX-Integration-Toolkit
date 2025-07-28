export function getISTTimestamp(): string {
  const offset = 5.5 * 60;
  const tzOffset = offset * 60 * 1000;
  const istDate = new Date(Date.now() + tzOffset);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const yyyy = istDate.getUTCFullYear();
  const mm = pad(istDate.getUTCMonth() + 1);
  const dd = pad(istDate.getUTCDate());
  const hh = pad(istDate.getUTCHours());
  const min = pad(istDate.getUTCMinutes());
  const ss = pad(istDate.getUTCSeconds());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}+05:30`;
}
