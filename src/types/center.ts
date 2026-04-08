export interface Center {
  id: string;
  centerCode: string;
  centerName: string;
  branchId: string;
  branchName: string;
  centerDay: string;
  centerTime: string;
  status: 'active' | 'inactive';
  blacklisted: boolean;
  assignedTo: string;
  assignedToName: string;
  bcCenterId?: string;
  parentCenterId?: string;
  contactPersonName?: string;
  contactPersonNumber?: string;
  address1: string;
  address2?: string;
  landmark?: string;
  pincode?: string;
  villageId: string;
  villageName: string;
  city?: string;
  meetingPlace?: string;
  latitude?: number;
  longitude?: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  memberCount: number;
}

export interface CenterFormData {
  branchId: string;
  centerName: string;
  centerDay: string;
  centerTime: string;
  assignedTo: string;
  contactPersonName?: string;
  contactPersonNumber?: string;
  address1: string;
  address2?: string;
  landmark?: string;
  villageId: string;
  pincode?: string;
  city?: string;
  meetingPlace?: string;
  latitude?: number;
  longitude?: number;
  status?: 'active' | 'inactive';
  blacklisted?: boolean;
  bcCenterId?: string;
  parentCenterId?: string;
}

export interface CenterFilterOptions {
  branch?: string;
  center?: string;
  status?: string;
  assignedTo?: string;
  createdOn?: string;
}