import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns';
import { id } from 'date-fns/locale';

export function getCalendarDays(year: number, month: number) {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
}

export function formatMonthYear(year: number, month: number) {
  return format(new Date(year, month), 'MMMM yyyy', { locale: id });
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  // Create Date object using local parameters to avoid timezone offset shifts
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, month, day);
  
  return dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function cleanString(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export interface KelasItem {
  id: string;
  name: string;
  waliKelas: string;
  gedung: 'A' | 'B';
}

export function findKelas(kelas: KelasItem[], queryIdOrName: string): KelasItem | null {
  if (!queryIdOrName) return null;
  const target = String(queryIdOrName).trim();
  const targetLower = target.toLowerCase();
  
  // 1. Match by id
  let found = kelas.find(k => String(k.id) === target);
  if (found) return found;
  
  // 2. Match by exact/case-insensitive name
  found = kelas.find(k => k.name.trim().toLowerCase() === targetLower);
  if (found) return found;
  
  // 3. Match by normalized name (e.g. X.1 vs X-1)
  const normalizedTarget = cleanString(target);
  found = kelas.find(k => cleanString(k.name) === normalizedTarget);
  return found || null;
}
