import { ILedger, ILedgerTransactionItem, IInvoiceRequest } from '../interfaces/ledger.interface';

/*
 * Model for ledger create api request
 * POST call
 * API:: ( ledger create) company/:companyUniqueName/accounts/:accountUniqueName/ledgers
 * in tranasaction there is a field isStock
 * if isStock is true we have to send inventory object inside it please see IInventory interface
 * I have also attaches responses in this file Please have a look
 */
export class LedgerRequest implements ILedger {
  public transactions: ILedgerTransactionItem[];
  public voucherType: string;
  public entryDate: string;
  public taxes?: string[];
  public applyApplicableTaxes?: boolean;
  public isInclusiveTax: boolean;
  public unconfirmedEntry: boolean;
  public attachedFile: string;
  public tag?: string;
  public description?: string;
  public generateInvoice: boolean;
  public chequeNumber?: string;
  public clearanceDate?: string;
  public invoiceRequest: IInvoiceRequest;
}

/*
 * for reference Please see the responses attached
 * Response 1):
 * {
 *     "transactions":[{"amount":"20", "particular":"sales", "type":"debit"}],
 *     "voucherType":"sales",
 *     "entryDate":"13-04-2017",
 *     "applyApplicableTaxes":true,
 *     "isInclusiveTax": true,
 *     "unconfirmedEntry":false,
 *     "attachedFile":"",
 *     "tag":null,
 *     "description":"",
 *     "generateInvoice": false,
 *     "chequeNumber":"123456",
 *     "clearanceDate": "03-01-2017",
 * 	"invoiceRequest": {
 *     	"invoice": {
 *     		"entries": [{
 * 			"transactions": [{
 * 				"accountUniqueName": "sales",
 * 				"description": "test desciption with sms @2000/ .05 paise"
 * 			}]
 * 		}]
 *      }
 *   }
 * Response 2):
 *   {
 *     "transactions":[{"amount":"20", "particular":"msg91", "type":"debit", "isStock": true,
 *     "inventory":{"stock" :{ "name": "redSweet", "uniqueName":"redsweet7"  },"quantity":20, "unit":{ "name":"box" , "code":"nos" }}}],
 *     "voucherType":"sales",
 *     "entryDate":"13-04-2017",
 *     "taxes":["1488196651373t80mszivw3", "1488196672667jfrk88128o", "14909676100377f3j7d3cx6"],
 *     "applyApplicableTaxes":true,
 *     "isInclusiveTax": true,
 *     "unconfirmedEntry":false,
 *     "attachedFile":"",
 *     "tag":null,
 *     "description":"",
 *     "generateInvoice": false,
 *     "chequeNumber":"123456",
 *     "clearanceDate": "03-01-2017",
 * 	"invoiceRequest": {
 *     	"invoice": {
 *     		"entries": [{
 * 			"transactions": [{
 * 				"accountUniqueName": "sales",
 * 				"description": "test desciption with sms @2000/ .05 paise"
 * 			}]
 * 		}]
 *      }
 *   }
 * }
 */
