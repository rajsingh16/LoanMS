export interface Village {
  id: string;
  villageId: string;
  villageName: string;
  villageCode: string;
  branchId: string;
  branchName: string;
  status: 'active' | 'inactive';
  villageClassification: string;
  pincode: string;
  closeDate?: string;
  city: string;
  isPrimaryHealthCentre: boolean;
  isPoliticallyInfluenced: boolean;
  
  // General Information
  countryName: string;
  district: string;
  postOffice: string;
  mohallaName: string;
  panchayatName: string;
  policeStation: string;
  contactPersonName: string;
  language: string;
  customerBaseExpected: number;
  
  // MFI Information
  mfi1Name?: string;
  mfi1ApproxCust?: number;
  mfi2Name?: string;
  mfi2ApproxCust?: number;
  mfi3Name?: string;
  mfi3ApproxCust?: number;
  mfi4Name?: string;
  mfi4ApproxCust?: number;
  
  // Distance Information (in KMs)
  distanceFromBranch: number;
  mainRoadDistance?: number;
  schoolDistance?: number;
  nearestSchoolName?: string;
  bankDistance: number;
  nearestBankName: string;
  hospitalDistance: number;
  nearestHospitalName: string;
  marketDistance?: number;
  nearestMarketName?: string;
  policeStationDistance: number;
  
  // Amenities
  numberOfSchools?: number;
  totalClinics?: number;
  totalKiryanaStores?: number;
  totalGeneralStores?: number;
  totalTailors?: number;
  totalVegetableStalls?: number;
  totalFruitStalls?: number;
  totalTeaStalls?: number;
  totalDairies?: number;
  totalCattle?: number;
  totalHotels?: number;
  totalStationeryShops?: number;
  privateHospitalBeds?: number;
  governmentHospitalBeds?: number;
  totalAashaWorkers?: number;
  
  // Population
  population: number;
  menPopulation?: number;
  womenPopulation?: number;
  literateMen?: number;
  literateWomen?: number;
  
  // Road and House Type
  totalKutchaHouses?: number;
  totalPakkaHouses?: number;
  roadType: string;
  schoolType: string;
  hospitalType: string;
  
  // Religion
  religionMajority: string;
  category: string;
  casteMajority?: string;
  
  // Additional Information
  anganwadiName?: string;
  pradhanName?: string;
  gramPanchayat?: string;
  maujaName?: string;
  contactPersonNumber?: string;
  approvedOn?: string;
  approvedBy?: string;
  mfi1Detail?: string;
  mfi2Detail?: string;
  mfi3Detail?: string;
  mfi4Detail?: string;
  latitude?: number;
  longitude?: number;
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface VillageFormData {
  // General Information
  countryName: string;
  branchId: string;
  villageName: string;
  villageClassification: string;
  pincode: string;
  district: string;
  postOffice: string;
  mohallaName: string;
  panchayatName: string;
  policeStation: string;
  contactPersonName: string;
  language: string;
  customerBaseExpected: number;
  
  // MFI Information
  mfi1Name?: string;
  mfi1ApproxCust?: number;
  mfi2Name?: string;
  mfi2ApproxCust?: number;
  mfi3Name?: string;
  mfi3ApproxCust?: number;
  mfi4Name?: string;
  mfi4ApproxCust?: number;
  
  // Distance Information
  distanceFromBranch: number;
  mainRoadDistance?: number;
  schoolDistance?: number;
  nearestSchoolName?: string;
  bankDistance: number;
  nearestBankName: string;
  hospitalDistance: number;
  nearestHospitalName: string;
  marketDistance?: number;
  nearestMarketName?: string;
  policeStationDistance: number;
  
  // Amenities
  numberOfSchools?: number;
  totalClinics?: number;
  totalKiryanaStores?: number;
  totalGeneralStores?: number;
  totalTailors?: number;
  totalVegetableStalls?: number;
  totalFruitStalls?: number;
  totalTeaStalls?: number;
  totalDairies?: number;
  totalCattle?: number;
  totalHotels?: number;
  totalStationeryShops?: number;
  privateHospitalBeds?: number;
  governmentHospitalBeds?: number;
  totalAashaWorkers?: number;
  
  // Population
  population: number;
  menPopulation?: number;
  womenPopulation?: number;
  literateMen?: number;
  literateWomen?: number;
  
  // Road and House Type
  totalKutchaHouses?: number;
  totalPakkaHouses?: number;
  roadType: string;
  schoolType: string;
  hospitalType: string;
  
  // Religion
  religionMajority: string;
  category: string;
  casteMajority?: string;
}

export interface VillageFilterOptions {
  branch?: string;
  pincode?: string;
  village?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}