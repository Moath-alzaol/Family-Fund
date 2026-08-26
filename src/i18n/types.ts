import type { RequestStatus, RequestType } from '@/domain/types';

export interface Strings {
  appName: string;
  appTagline: string;

  signIn: {
    title: string;
    subtitle: string;
    username: string;
    password: string;
    submit: string;
    submitting: string;
    genericError: string;
    footer: string;
  };

  greeting: { morning: string; evening: string };

  tabs: {
    home: string;
    requests: string;
    fund: string;
    settings: string;
  };

  requestTypes: Record<RequestType, { label: string; description: string; glyph: string }>;
  status: Record<RequestStatus, string>;
  role: Record<'admin' | 'member', string>;

  home: {
    fundCardLabel: string;
    collectedThisMonth: string;
    remainingToComplete: (jod: string) => string;
    commitmentsLabel: string;
    paid: string;
    unpaid: string;
    remaining: (jod: string) => string;
    notPaidYet: (name: string) => string;
    myBalanceLabel: string;
    detailsLink: string;
    pendingRequestsTitle: string;
    viewAll: string;
    noPendingTitle: string;
    noPendingSubtitle: string;
  };

  requestsScreen: {
    title: string;
    filterAll: string;
    filterPending: string;
    filterApproved: string;
    filterRejected: string;
    emptyTitle: string;
    emptyPendingSubtitle: string;
    emptyOtherSubtitle: string;
  };

  fund: {
    eyebrow: string;
    subtitle: string;
    tabActivity: string;
    tabReport: string;
    emptyActivity: string;
    reportSummaryLabel: (period: string) => string;
    totalContributions: string;
    totalExpenses: string;
    netChange: string;
    monthlyContributionsLabel: string;
    expectedTotal: string;
  };

  members: {
    title: string;
    subtitle: (count: number) => string;
    youSuffix: string;
    monthlyCommitmentLabel: (jod: string) => string;
    personalBalanceLabel: string;
    thisMonthLabel: string;
    addMemberButton: string;
  };

  balances: {
    title: string;
    yourBalanceLabel: string;
    historyLabel: string;
    emptyHistory: string;
    brothersLabel: string;
    paidThisMonthCheck: string;
    notPaidRemaining: (jod: string) => string;
  };

  requestDetail: {
    title: string;
    statusPendingText: (adminName: string) => string;
    statusApprovedText: (name: string) => string;
    statusRejectedText: (name: string) => string;
    requestFromLabel: string;
    typeLabel: string;
    amountLabel: string;
    affectsLabel: (x: string) => string;
    affectsPersonalUp: string;
    affectsPersonalDown: string;
    affectsPersonalDownFundUp: string;
    affectsFundDown: string;
    beneficiaryLabel: (name: string) => string;
    noteLabel: string;
    requestDateLabel: string;
    approvedDateLabel: string;
    rejectedDateLabel: string;
    rejectionReasonLabel: string;
    noAmountDeducted: string;
    rejectButton: string;
    approveButton: string;
    pendingNotice: (name: string) => string;
    guardSuffix: string;
    approveSuccess: string;
  };

  rejectModal: {
    cancel: string;
    title: string;
    helper: string;
    placeholder: string;
    errorEmpty: string;
    confirm: string;
    success: string;
  };

  createRequest: {
    title: string;
    typeLabel: string;
    amountLabel: string;
    beneficiaryLabel: string;
    beneficiaryPlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    submitButton: string;
    submitDirectButton: string;
    directNote: string;
    successTitle: string;
    successPendingSubtitle: (adminName: string) => string;
    successDirectSubtitle: string;
    availableBalanceHint: (jod: string) => string;
    commitmentHint: (balance: string, commitment: string) => string;
    commitmentWarning: string;
    fundBalanceHint: (jod: string) => string;
    validationTypeRequired: string;
    validationAmountRequired: string;
    validationNoteRequired: string;
    validationBeneficiaryRequired: string;
  };

  addMember: {
    title: string;
    lead: string;
    nameLabel: string;
    namePlaceholder: string;
    commitmentLabel: string;
    commitmentPlaceholder: string;
    submit: string;
    successTitle: string;
    credentialsNote: string;
    usernameLabel: string;
    passwordLabel: string;
    done: string;
  };

  settings: {
    title: string;
    lead: string;
    autoDeduction: string;
    autoDeductionValue: string;
    partialPayment: string;
    partialPaymentValue: string;
    negativeBalance: string;
    negativeBalanceValue: string;
    bankLink: string;
    bankLinkValue: string;
    adminDepositLabel: string;
    adminDepositHint: string;
    language: string;
    languageArabic: string;
    languageEnglish: string;
    changePasswordLink: string;
    membersLink: string;
    logout: string;
  };

  changePassword: {
    title: string;
    lead: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    tooShort: string;
    mismatch: string;
    submit: string;
    success: string;
  };

  common: {
    currency: string;
    loading: string;
    errorGeneric: string;
    back: string;
  };

  validation: {
    amountRequired: string;
    withdrawalInsufficient: (jod: string) => string;
    contributionAlreadyPaid: string;
    contributionInsufficientBalance: (jod: string) => string;
    contributionAmountMismatch: (jod: string) => string;
    expenseInsufficientFund: (jod: string) => string;
  };

  ledgerEntry: {
    deposit: string;
    withdrawal: string;
    contributionPersonal: string;
    contributionFund: (name: string) => string;
    expense: (beneficiary: string) => string;
    openingBalance: string;
    adjustment: string;
  };

  errors: {
    insufficientPersonalBalance: string;
    insufficientBalanceForContribution: string;
    commitmentNotPayable: string;
    insufficientFundBalance: string;
    adminOnly: string;
    invalidInput: string;
    invalidRequestState: string;
    notAuthenticated: string;
    unknown: string;
  };
}
