import { INameUniqueName } from "../api-models/Inventory";

export interface IRegistration {
  iciciCorporateDetails :{
    corpId: string,
    userId: string,
    accountNo: number,
    URN: string
  },
  account : {
    name :string,
    uniqueName : string
  }
}
