import { ContentTypeName } from 'tno-core';

import { ISortBy } from '../../list-view/interfaces';

export interface IPaperFilter {
  pageIndex: number;
  pageSize: number;
  hasTopic: boolean;
  includeHidden: boolean;
  onlyHidden: boolean;
  onlyPublished: boolean;
  contentTypes: ContentTypeName[];
  sourceIds: number[];
  otherSource: string;
  productIds: number[];
  ownerId: number | '';
  userId: number | '';
  timeFrame: number | '';
  excludeSourceIds: number[];
  // Actions
  onTicker: boolean;
  commentary: boolean;
  topStory: boolean;
  homepage: boolean;
  sort: ISortBy[];
}
