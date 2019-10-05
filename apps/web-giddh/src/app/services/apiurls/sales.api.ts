let URL = 'company/:companyUniqueName/accounts/:accountUniqueName/';
export const SALES_API_V2 = {
  GENERATE_SALES: `v2/${URL}invoices/generate-sales`,
  GENERATE_GENERIC_ITEMS: `company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate`,
  UPDATE_VOUCHER: URL + 'vouchers'
};
export const SALES_API_V4 = {
  GENERATE_SALES: `v4/${URL}invoices/generate-sales`,
  GENERATE_GENERIC_ITEMS: `v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate`,
  UPDATE_VOUCHER: `v4/${URL}vouchers`
};
