export interface LoanProduct {
  id: string;
  productGroupId: string;
  productId: string;
  productCode: string;
  productName: string;
  interestRate: number;
  tenureInMonths: number;
  minLoanAmount?: number;
  maxLoanAmount?: number;
  minTenure?: number;
  maxTenure?: number;
  defaultTenure?: number;
  interestCalculationMethod?: string;
  repaymentFrequency?: string;
  lpfCalcType: string;
  lpfValue: number;
  lpfDeductType: string;
  securityValue: number;
  docChargeType: string;
  docChargeValue: number;
  principalRepaymentFrequency: string;
  interestRepaymentFrequency: string;
  moratoriumPeriod: number;
  insuranceId?: string;
  insuranceDeductType?: string;
  irrWithInsurance: number;
  netOffCalculationValue: number;
  netOffCalculationFor: string;
  netOffCalculationType: string;
  interestCalculationOn: string;
  isSameDateEmi: boolean;
  documentProductAmount: number;
  totalInstallment: number;
  isFixedDayEmi: boolean;
  isTopUp: boolean;
  documentProductName: string;
  documentProductCode: string;
  vendorProductId: string;
  emiCalculationType: string;
  securityCalculationType: string;
  bounceChargeValue: number;
  bounceChargeCalculationType: string;
  preCloserType: string;
  preCloserValue: number;
  penalChargeType: string;
  penalValue: number;
  healthCareProduct: string;
  healthCareDeductType: string;
  loanAmount: number;
  status: 'active' | 'inactive';
  flexibleEmi: boolean;
  isDynamicRepayment: boolean;
  eirInterestRate: number;
  effectiveStartDate: string;
  effectiveEndDate: string;
  emiStartSequence: number;
  emiEndSequence: number;
  emiAmount: number;
  // Phase 8: explicit contractual defaults. They remain optional for legacy
  // products; schedule eligibility rejects an account whose snapshot lacks them.
  trancheTreatment?: 'sanctioned_amount' | 'disbursed_to_date';
  subsequentDisbursementTreatment?: 'prohibit_after_schedule' | 'require_authorized_reschedule';
  businessDayConvention?: 'none' | 'next_business_day';
  firstInstallmentRule?: 'one_period_after_first_completed_disbursement';
  feesTreatment?: 'scheduled' | 'excluded';
  penaltyTreatment?: 'assessed_separately' | 'excluded';
  businessCalendar?: string;
  firstInstallmentOverrideAllowed?: boolean;
  roundingPolicy?: 'half_up_2dp' | 'half_even_2dp';
  interestRateBasis?: 'annual_nominal';
  feeAllocationOrder?: 'fees_interest_principal';
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface ProductGroup {
  id: string;
  productGroupCode: string;
  productGroupName: string;
  productGroupSegment: string;
  productGroupType: string;
  status: 'active' | 'inactive';
  secureGroup: boolean;
  qualifiedGroup: boolean;
  borrowedGroup: boolean;
  cycleIncreaseFlag: boolean;
  clmSchemeId?: string;
  minClientPerCenter: number;
  isQrCollectionEnable: boolean;
  clmLenderId?: string;
  firstEmiType: string;
  disbursementAccountHead: string;
  hospiCashHead: string;
  upiCollectionHead: string;
  bcMigratedAccountHead: string;
  minIrr: number;
  maxIrr: number;
  isProduct: boolean;
  isTranchDisb: boolean;
  daysInYear: number;
  bcId: string;
  exclusivePartner: boolean;
  roundingOff: number;
  eligibleGender: string;
  vendorId?: string;
  yearlyMinHouseholdIncome?: number;
  yearlyMaxHouseholdIncome?: number;
  cashAccountHead: string;
  neftAccountHead: string;
  principalHead: string;
  interestIncomeHead: string;
  lpfIncomeHead: string;
  interestReversalHead: string;
  brokenInterestHead: string;
  extendedIntCollectionHead: string;
  loanWriteOffHead: string;
  loanWaiverHead: string;
  writeOffCollHead: string;
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface District {
  id: string;
  districtCode: string;
  districtName: string;
  countryId: string;
  stateId: string;
  stateName: string;
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface Insurance {
  id: string;
  insuranceId: string;
  insuranceCode: string;
  insuranceType: string;
  insuranceName: string;
  premiumCalType: string;
  premiumValue: number;
  paymentFrequency: string;
  durationInMonths: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  isCoApplicantCovered: boolean;
  insuranceGlHead: string;
  insuranceRecHead: string;
  insuranceControlRecHead: string;
  writeOffInsuranceHead: string;
  insertedOn: string;
  insertedBy: string;
  updatedOn?: string;
  updatedBy?: string;
}

export interface ProductFilterOptions {
  productGroupId?: string;
  productId?: string;
  status?: string;
  insertedOnFrom?: string;
  insertedOnTo?: string;
}

export interface ProductGroupFilterOptions {
  businessPartner?: string;
  status?: string;
}

export interface DistrictFilterOptions {
  status?: string;
}
