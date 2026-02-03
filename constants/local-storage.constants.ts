export class LocalStorageKeysCache {
  static readonly GET_ALL_RULES: string = process.env
    .NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP
    ? `get-all-rules_${process.env.NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP}`
    : 'get-all-rules'

  static readonly GET_ALL_BET_GROUPS: string = process.env
    .NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP
    ? `get-all-bet-groups_${process.env.NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP}`
    : 'get-all-bet-groups'

  static readonly GET_ALL_BET_GROUP_ROLES: string = process.env
    .NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP
    ? `get-all-bet-group_roles_${process.env.NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP}`
    : 'get-all-bet-group_roles'
  static readonly GET_ALL_REQUEST_STATUS: string = process.env
    .NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP
    ? `get-all-request_status_${process.env.NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP}`
    : 'get-all-request_status'
  static readonly GET_USER_INFO: string = process.env
    .NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP
    ? `get-user-info_${process.env.NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP}`
    : 'get-user-info'
  static readonly GET_BET_GROUPS_BY_USER_ID: string = process.env
    .NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP
    ? `get-bet-groups-by-user-id_${process.env.NEXT_PUBLIC_AMBIENTE_BRAZUERAO_WEB_APP}`
    : 'get-bet-groups-by-user-id'
}
