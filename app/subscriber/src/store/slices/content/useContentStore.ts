import {
  IContentListAdvancedFilter,
  IContentListFilter,
} from 'features/content/list-view/interfaces';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'store';
import { IContentModel, IPaged } from 'tno-core';

import {
  addContent,
  removeContent,
  storeContent,
  storeFilter,
  storeFilterAdvanced,
  updateContent,
} from '.';
import { IContentState } from './interfaces';

export interface IContentProps {
  filter: IContentListFilter;
}

export interface IContentStore {
  storeFilter: (filter: IContentListFilter) => void;
  storeFilterAdvanced: (filter: IContentListAdvancedFilter) => void;
  storeContent: (content: IPaged<IContentModel>) => void;
  addContent: (content: IContentModel[]) => void;
  updateContent: (content: IContentModel[]) => void;
  removeContent: (content: IContentModel[]) => void;
}

export const useContentStore = (props?: IContentProps): [IContentState, IContentStore] => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((store) => store.content);

  const controller = React.useMemo(
    () => ({
      storeFilter: (filter: IContentListFilter) => {
        dispatch(storeFilter(filter));
      },
      storeFilterAdvanced: (filter: IContentListAdvancedFilter) => {
        dispatch(storeFilterAdvanced(filter));
      },
      storeContent: (content: IPaged<IContentModel>) => {
        dispatch(storeContent(content));
      },
      addContent: (content: IContentModel[]) => {
        dispatch(addContent(content));
      },
      updateContent: (content: IContentModel[]) => {
        dispatch(updateContent(content));
      },
      removeContent: (content: IContentModel[]) => {
        dispatch(removeContent(content));
      },
    }),
    [dispatch],
  );

  return [state, controller];
};
