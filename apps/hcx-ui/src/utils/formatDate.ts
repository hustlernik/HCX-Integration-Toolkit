export function hasDateField(obj: unknown): obj is { date: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'date' in obj &&
    typeof (obj as Record<string, unknown>).date === 'string'
  );
}

export const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
