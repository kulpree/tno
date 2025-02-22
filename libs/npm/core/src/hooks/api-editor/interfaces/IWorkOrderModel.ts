import { IAuditColumnsModel, IUserModel, WorkOrderStatusName, WorkOrderTypeName } from '..';

export interface IWorkOrderModel extends IAuditColumnsModel {
  id: number;
  workType: WorkOrderTypeName;
  status: WorkOrderStatusName;
  requestorId?: number;
  requestor?: IUserModel;
  assignedId?: number;
  assigned?: IUserModel;
  description: string;
  note: string;
  configuration: any;
}
