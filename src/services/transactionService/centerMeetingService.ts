import { apiFetch } from '../../lib/api';
 
export interface CenterMeetingRecord {
  id: string;
  meetingId: string;
  displaySequence: number;
  assignedTo: string;
  centerName: string;
  centerId: string;
  meetingType: string;
  meetingStatus: string;
  scheduleDate: string;
  scheduleTime: string;
  meetingEndDate: string;
  branchId?: string;
  branchName?: string;
  centerUuid?: string;
  fieldOfficerId?: string;
  meetingEndTime?: string;
  meetingLocation?: string;
  agenda?: string;
  remarks?: string;
}
 
export interface CenterMeetingFilterOptions {
  branch: string;
  center?: string;
  meeting?: string;
  meetingType?: string;
  meetingStatus: string;
  scheduleDateFrom: string;
  scheduleDateTo: string;
  assignedTo?: string;
}
 
const MEETING_BASE = '/api/center-meetings';

export interface MeetingOptions { branches: { id: string; branch_name: string; branch_code?: string }[]; centers: { id: string; center_name: string; center_code?: string; branch_id: string }[]; fieldOfficers: { id: string; first_name: string; last_name: string; branch_id: string }[]; }
export type MeetingInput = Omit<CenterMeetingRecord, 'id' | 'meetingId' | 'displaySequence' | 'assignedTo' | 'centerName' | 'centerId' | 'meetingStatus'> & { branchId: string; centerUuid: string; fieldOfficerId: string; meetingType: string; scheduleDate: string; scheduleTime: string; meetingEndDate: string; meetingEndTime: string };
async function response<T>(res: Response): Promise<T> { const body = await res.json().catch(() => ({})); if (!res.ok) throw new Error(body?.error?.message || body?.message || `Request failed (${res.status})`); return (body?.data ?? body) as T; }
const csvCell = (value: unknown) => { const text = String(value ?? ''); const safe = /^[=+\-@]/.test(text) ? `'${text}` : text; return `"${safe.replace(/"/g, '""')}"`; };
 
export const centerMeetingService = {
  getAllMeetings: async (): Promise<CenterMeetingRecord[]> => {
    const data = await response<CenterMeetingRecord[]>(await apiFetch(MEETING_BASE));
    return Array.isArray(data) ? data : [];
  },
  getOptions: async (): Promise<MeetingOptions> => response<MeetingOptions>(await apiFetch(`${MEETING_BASE}/options`)),
  createMeeting: async (data: MeetingInput): Promise<CenterMeetingRecord> => response<CenterMeetingRecord>(await apiFetch(MEETING_BASE, { method: 'POST', body: JSON.stringify(data) })),
  updateMeeting: async (id: string, data: MeetingInput): Promise<CenterMeetingRecord> => response<CenterMeetingRecord>(await apiFetch(`${MEETING_BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
 
  deleteMeeting: async (id: string): Promise<void> => {
    await response<void>(await apiFetch(`${MEETING_BASE}/${id}`, { method: 'DELETE' }));
  },
 
  exportCSV: async (records: CenterMeetingRecord[]): Promise<void> => {
    const headers = ['Meeting Id', 'Display Sequence', 'Assigned To', 'Center Name', 'Center Id', 'Meeting Type', 'Meeting Status', 'Schedule Date', 'Schedule Time', 'Meeting End Date'];
    const csv = [headers.map(csvCell).join(','), ...records.map(r => [r.meetingId, r.displaySequence, r.assignedTo, r.centerName, r.centerId, r.meetingType, r.meetingStatus, r.scheduleDate, r.scheduleTime, r.meetingEndDate].map(csvCell).join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `center_meetings_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
  },
};
