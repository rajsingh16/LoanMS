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
 
export const centerMeetingService = {
  getAllMeetings: async (): Promise<CenterMeetingRecord[]> => {
    const res = await apiFetch(MEETING_BASE);
    const json = await res.json();
    return json.data ?? json;
  },
 
  deleteMeeting: async (id: string): Promise<void> => {
    const res = await apiFetch(`${MEETING_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) { const json = await res.json(); throw new Error(json.message || 'Failed to delete meeting'); }
  },
 
  exportCSV: async (records: CenterMeetingRecord[]): Promise<void> => {
    const headers = ['Meeting Id', 'Display Sequence', 'Assigned To', 'Center Name', 'Center Id', 'Meeting Type', 'Meeting Status', 'Schedule Date', 'Schedule Time', 'Meeting End Date'];
    const csv = [headers.join(','), ...records.map(r => [r.meetingId, r.displaySequence, r.assignedTo, r.centerName, r.centerId, r.meetingType, r.meetingStatus, r.scheduleDate, r.scheduleTime, r.meetingEndDate].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `center_meetings_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
  },
};