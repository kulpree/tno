import { WorkflowStatusName } from '../constants';
import { ISortPageFilter } from '.';

export interface IContentReferenceFilter extends ISortPageFilter {
  source?: string;
  sources?: string[];
  uid?: string;
  topic?: string;
  status?: WorkflowStatusName;
  offset?: number;
  partition?: number;
  publishedOn?: string;
  publishedStartOn?: string;
  publishedEndOn?: string;
  updatedOn?: string;
  updatedStartOn?: string;
  updatedEndOn?: string;
}
