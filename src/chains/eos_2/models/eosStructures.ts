import { EosEntityName, EosAsset, EosDate } from './generalModels'
import { EosPublicKey } from './cryptoModels'
import { ChainActionType } from '../../../models'
import { EosChainActionType } from './chainActionTypeModels'

// Raw data Types from the EOS Chain

// Spec - https://developers.eos.io/eosio-nodeos/reference#get_table_rows
export type EOSGetTableRowsParams = {
  /** Contract to retrieve data from */
  code: EosEntityName
  /** Contract data table name */
  table: string
  /** Account that owns the data */
  scope: EosEntityName
  /** number of named index 1, 2, 3 - default = 1 */
  index_position: number
  /** Type of data stored in key field (as a string)- default 'i64' */
  key_type?: string
  /** Rows to return - Default = -1 - no limit */
  limit?: number
  /** First row number to return - default = 0 */
  lower_bound?: number
  /** Navigate table in reverse order - default = false */
  reverse: false
  /** Navigate table in reverse order - default = false */
  show_payer: Boolean
  /** Last row number to return - default = -1 */
  upper_bound?: number
  /** Defaults to true */
  json: boolean
}

export type EosAuthorizationKeyStruct = {
  key: EosPublicKey
  weight: number
}

/** EOS Raw Data Structure for Authorization - i.e. account, permissions, and weights */
export type EosAuthorizationStruct = {
  threshold: number
  accounts: {
    permission: {
      actor: EosEntityName
      permission: EosEntityName
    }
    weight: number
  }[]
  keys: EosAuthorizationKeyStruct[]
  waits: {
    wait_sec: number
    weight: number
  }[]
}

/** EOS Raw Data Structure for Permission - i.e. permission name, and authorization */
export type EosPermissionStruct = {
  perm_name: EosEntityName
  parent: EosEntityName | ''
  required_auth: EosAuthorizationStruct
}

/** EOS Raw Data Structure for Account - i.e. including name, resources, and permissions */
export type EosAccountStruct = {
  account_name: EosEntityName
  head_block_num: number
  head_block_time: EosDate
  privileged: boolean
  last_code_update: EosDate
  created: EosDate
  core_liquid_balance: EosAsset
  ram_quota: number
  net_weight: number
  cpu_weight: number
  net_limit: {
    used: number
    available: number
    max: number
  }
  cpu_limit: {
    used: number
    available: number
    max: number
  }
  ram_usage: number
  permissions: EosPermissionStruct[]
  total_resources: {
    owner: EosEntityName
    net_weight: EosAsset
    cpu_weight: EosAsset
    ram_bytes: number
  }
  self_delegated_bandwidth: any
  refund_request: any
  voter_info: any
}

export type EosActionAuthorizationStruct = {
  actor: EosEntityName
  permission: EosEntityName
}

export type EosDecomposeReturn = {
  chainActionType: ChainActionType | EosChainActionType
  args: any
  partial?: boolean
}
