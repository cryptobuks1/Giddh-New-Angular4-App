export class AdvanceReceiptAdjustment {
    tdsTaxUniqueName: string;
    tdsAmount: TdsAmount;
    description: string;
    adjustments: Adjustment[] = [new Adjustment()];
}

export class Adjustment {
    voucherNumber: string;
    dueAmount: DueAmount;
    voucherDate: string;
    taxRate: number;
    uniqueName: string;
    taxUniqueName: string;

    constructor() {
        this.voucherNumber = '';
        this.voucherDate = '';
        this.taxRate = 0;
        this.uniqueName = '';
        this.taxUniqueName = '';
        // tslint:disable-next-line: no-use-before-declare
        this.dueAmount = new DueAmount();
    }
}

export class DueAmount {
    amountForAccount: number;
    amountForCompany: number;
    constructor() {
        this.amountForAccount = 0;
        this.amountForCompany = 0;
    }
}

export interface TdsAmount {
    amountForAccount?: any;
}



export class AdjustAdvancePaymentModal {
    customerName: string;
    customerUniquename: string;
    voucherDate: string;
    balanceDue: any;
    dueDate: string;
    grandTotal: any = 0;
    gstTaxesTotal: number;
    subTotal: number;
    totalTaxableValue: number;
}

export class AdvanceReceiptRequest {
    invoiceDate: string;
    accountUniqueName: string;
}
