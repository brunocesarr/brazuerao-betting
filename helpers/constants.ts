import { GroupRole, RequestStatus } from '@/types/domain'

export class Dates {
  static readonly EXPIRATION_DATE_BET: string = '2026-01-28T17:59:59'
}

export class DefaultValues {
  static groupRoles: GroupRole[] = []
  static requestStatus: RequestStatus[] = []
  static adminGroupRule?: GroupRole = this.groupRoles.find(
    (rule) => rule.name.toUpperCase() === 'ADMIN'
  )
  static pendingRequestStatus?: RequestStatus = this.requestStatus.find(
    (status) => status.status.toUpperCase() === 'PENDING'
  )
  static approvedRequestStatus?: RequestStatus = this.requestStatus.find(
    (status) => status.status.toUpperCase() === 'APPROVED'
  )
}

export enum RequestStatusEnum {
  approved = 'APPROVED',
  rejected = 'REJECTED',
  pending = 'PENDING',
}

export enum RuleTypeEnum {
  champion = 'EXACT_CHAMPION',
  position = 'EXACT_POSITION',
  zone = 'ZONE_MATCH',
}
