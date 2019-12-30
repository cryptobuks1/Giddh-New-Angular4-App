import { AccountFlat, SearchDataSet, SearchRequest } from '../../models/api-models/Search';
import { SearchActions } from '../../actions/search.actions';
import * as _ from '../../lodash-optimized';
import { BaseResponse } from '../../models/api-models/BaseResponse';
import { CustomActions } from '../customActions';
import { COMMON_ACTIONS } from '../../actions/common.const';

export interface SearchState {
	value?: AccountFlat[];
	searchLoader: boolean;
	search: boolean;
	searchDataSet: SearchDataSet[];
	searchRequest: SearchRequest;
	searchPaginationInfo: {
		totalPages: number;
		totalItems: number;
		page: number;
		count: number
	};
}

export const initialState: SearchState = {
	value: [],
	searchLoader: false,
	search: false,
	searchRequest: null,
	searchDataSet: [{
		queryType: '',
		balType: 'CREDIT',
		queryDiffer: '',
		amount: '',
		closingBalanceType: 'DEBIT',
		openingBalanceType: 'DEBIT'
	}],
	searchPaginationInfo: {
		totalPages: 0,
		totalItems: 0,
		page: 0,
		count: 0
	}
};

export function searchReducer(state = initialState, action: CustomActions): SearchState {
	switch (action.type) {
		case COMMON_ACTIONS.RESET_APPLICATION_DATA: {
			return Object.assign({}, state, initialState);
		}
		case SearchActions.SEARCH_RESPONSE: {
			// let searchResp: BaseResponse<SearchResponse[], SearchRequest> = action.payload;
			let searchResp: BaseResponse<any, SearchRequest> = action.payload;
			if (searchResp.status === 'success') {
				return Object.assign({}, state, {
					searchPaginationInfo: {
						totalPages: searchResp.body.totalPages,
						totalItems: searchResp.body.totalItems,
						page: searchResp.body.page,
						count: searchResp.body.count,
					},
					value: flattenSearchGroupsAndAccounts(searchResp.body.results, searchResp.body.groupName),
					searchLoader: false,
					search: true
				});
			}
			return Object.assign({}, state, {
				search: false,
				searchLoader: false
			});
		}
		case SearchActions.SEARCH_REQUEST: {
			return Object.assign({}, state, {
				searchLoader: true,
				searchRequest: action.payload.request
			});
		}
		case SearchActions.RESET_SEARCH_STATE: {
			return Object.assign({}, state, {
				value: [],
				searchLoader: false,
				search: false,
				searchRequest: null,
				searchDataSet: [{
					queryType: '',
					balType: 'CREDIT',
					queryDiffer: '',
					amount: '',
					closingBalanceType: 'DEBIT',
					openingBalanceType: 'DEBIT'
				}]
			});
		}
		default: {
			return state;
		}
	}
}

// const flattenSearchGroupsAndAccounts = (rawList: SearchResponse[]) => {
//   let listofUN;
//   listofUN = rawList.map((obj) => {
//     let uniqueList: AccountFlat[] = [];
//     if (!(_.isNull(obj.childGroups)) && obj.childGroups.length > 0) {
//       uniqueList = flattenSearchGroupsAndAccounts(obj.childGroups as SearchResponse[]) as AccountFlat[];
//       _.each(obj.accounts, (account) => {
//         let accountFlat: AccountFlat = {
//           parent: obj.groupName,
//           closeBalanceType: account.closingBalance.type,
//           closingBalance: Number(account.closingBalance.amount),
//           openBalanceType: account.openingBalance.type,
//           creditTotal: Number(account.creditTotal),
//           debitTotal: Number(account.debitTotal),
//           openingBalance: Number(account.openingBalance),
//           uniqueName: account.uniqueName,
//           name: account.name
//         };
//         uniqueList.push(accountFlat);
//         return accountFlat.openingBalance = account.openingBalance.amount;
//       });
//       return uniqueList;
//     } else {
//       _.each(obj.accounts, (account) => {
//         let accountFlat: AccountFlat = {
//           parent: obj.groupName,
//           closeBalanceType: account.closingBalance.type,
//           closingBalance: Number(account.closingBalance.amount),
//           openBalanceType: account.openingBalance.type,
//           creditTotal: Number(account.creditTotal),
//           debitTotal: Number(account.debitTotal),
//           openingBalance: Number(account.openingBalance),
//           uniqueName: account.uniqueName,
//           name: account.name
//         };
//         uniqueList.push(accountFlat);
//         return accountFlat.openingBalance = account.openingBalance.amount;
//       });
//       return uniqueList;
//     }
//   });
//   return _.flatten(listofUN);
// };

const flattenSearchGroupsAndAccounts = (accountList, groupName) => {
	let uniqueList: AccountFlat[] = [];
	_.each(accountList, (account) => {
		let accountFlat: AccountFlat = {
			parent: groupName,
			closeBalanceType: account.closingBalance.type,
			closingBalance: Number(account.closingBalance.amount),
			openBalanceType: account.openingBalance.type,
			creditTotal: Number(account.creditTotal),
			debitTotal: Number(account.debitTotal),
			openingBalance: Number(account.openingBalance),
			uniqueName: account.uniqueName,
			name: account.name
		};
		uniqueList.push(accountFlat);
		return accountFlat.openingBalance = account.openingBalance.amount;
	});
	return uniqueList;
};

// const flattenSearchGroupsAndAccounts = (rawList) => {
//   let listofUN;
//   listofUN = _.map(rawList, (obj: any) => {
//     let uniqueList;
//     if (!(_.isNull(obj.childGroups)) && obj.childGroups.length > 0) {
//       uniqueList = flattenSearchGroupsAndAccounts(obj.childGroups);
//       _.each(obj.accounts, (account) => {
//         account.parent = obj.groupName;
//         account.closeBalType = account.closingBalance.type;
//         account.closingBalance = account.closingBalance.amount;
//         account.openBalType = account.openingBalance.type;
//         return account.openingBalance = account.openingBalance.amount;
//       });
//       uniqueList.push(obj.accounts);
//       return uniqueList;
//     } else {
//       _.each(obj.accounts, (account) => {
//         account.parent = obj.groupName;
//         account.closeBalType = account.closingBalance.type;
//         account.closingBalance = account.closingBalance.amount;
//         account.openBalType = account.openingBalance.type;
//         return account.openingBalance = account.openingBalance.amount;
//       });
//       return obj.accounts;
//     }
//   });
//   return _.flatten(listofUN);
// };
