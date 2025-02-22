import { UserStatusName } from '../constants';
import {
  IAuditColumnsModel,
  IFilterModel,
  IFolderModel,
  INotificationModel,
  IOrganizationModel,
  IReportInstanceModel,
  IReportModel,
} from '.';

export interface IUserModel extends IAuditColumnsModel {
  id: number;
  key: string;
  username: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  lastLoginOn?: Date;
  isEnabled: boolean;
  status: UserStatusName;
  emailVerified: boolean;
  isSystemAccount: boolean;
  preferences?: any;
  note: string;
  roles?: string[];
  organizations?: IOrganizationModel[];
  folders?: IFolderModel[];
  filters?: IFilterModel[];
  reports?: IReportModel[];
  reportInstances?: IReportInstanceModel[];
  notifications?: INotificationModel[];
  // This model is often used to identify the user is subscribed to a report or notification.
  isSubscribed?: boolean;
}
