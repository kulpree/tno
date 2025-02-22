import React from 'react';
import { useAppDispatch, useAppSelector } from 'store';
import { IMinisterModel } from 'store/hooks/subscriber/interfaces/IMinisterModel';
import {
  IActionModel,
  ICacheModel,
  IContributorModel,
  IDataLocationModel,
  IHolidayModel,
  IIngestTypeModel,
  ILicenseModel,
  IMetricModel,
  IProductModel,
  IRoleModel,
  ISeriesModel,
  ISettingModel,
  ISourceActionModel,
  ISourceModel,
  ITagModel,
  ITonePoolModel,
  ITopicModel,
  ITopicScoreRuleModel,
  IUserModel,
} from 'tno-core';

import {
  storeActions,
  storeCache,
  storeContributors,
  storeDataLocations,
  storeHolidays,
  storeIngestTypes,
  storeLicenses,
  storeMetrics,
  storeMinisters,
  storeProducts,
  storeRoles,
  storeSeries,
  storeSettings,
  storeSourceActions,
  storeSources,
  storeTags,
  storeTonePools,
  storeTopics,
  storeUsers,
  updateCache,
} from '.';
import { ILookupState } from './interfaces';

export interface ILookupStore {
  storeCache: (cache: ICacheModel[]) => void;
  updateCache: (cache: ICacheModel) => void;
  storeActions: (actions: IActionModel[]) => void;
  storeTopics: (topics: ITopicModel[]) => void;
  storeProducts: (contentTypes: IProductModel[]) => void;
  storeSources: (sources: ISourceModel[]) => void;
  storeLicenses: (licenses: ILicenseModel[]) => void;
  storeSeries: (series: ISeriesModel[]) => void;
  storeContributors: (contributors: IContributorModel[]) => void;
  storeSourceActions: (actions: ISourceActionModel[]) => void;
  storeTags: (tags: ITagModel[]) => void;
  storeTonePools: (contentTypes: ITonePoolModel[]) => void;
  storeHolidays: (users: IHolidayModel[]) => void;
  storeMinisters: (ministers: IMinisterModel[]) => void;
  storeTopicScoreRules: (topicScores: ITopicScoreRuleModel[]) => void;
  storeIngestTypes: (ingestTypes: IIngestTypeModel[]) => void;
  storeRoles: (roles: IRoleModel[]) => void;
  storeMetrics: (metrics: IMetricModel[]) => void;
  storeUsers: (users: IUserModel[]) => void;
  storeDataLocations: (dataLocations: IDataLocationModel[]) => void;
  storeSettings: (settings: ISettingModel[]) => void;
}

export const useLookupStore = (): [ILookupState, ILookupStore] => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((store) => store.lookup);

  const controller = React.useMemo(
    () => ({
      storeCache: (cache: ICacheModel[]) => {
        dispatch(storeCache(cache));
      },
      updateCache: (cache: ICacheModel) => {
        dispatch(updateCache(cache));
      },
      storeActions: (actions: IActionModel[]) => {
        dispatch(storeActions(actions));
      },
      storeTopics: (topics: ITopicModel[]) => {
        dispatch(storeTopics(topics));
      },
      storeTopicScoreRules: (rules: ITopicScoreRuleModel[]) => {
        dispatch(storeTopicScoreRules(rules));
      },
      storeProducts: (contentTypes: IProductModel[]) => {
        dispatch(storeProducts(contentTypes));
      },
      storeSources: (sources: ISourceModel[]) => {
        dispatch(storeSources(sources));
      },
      storeLicenses: (licenses: ILicenseModel[]) => {
        dispatch(storeLicenses(licenses));
      },
      storeIngestTypes: (ingestTypes: IIngestTypeModel[]) => {
        dispatch(storeIngestTypes(ingestTypes));
      },
      storeRoles: (roles: IRoleModel[]) => {
        dispatch(storeRoles(roles));
      },
      storeSeries: (series: ISeriesModel[]) => {
        dispatch(storeSeries(series));
      },
      storeContributors: (contributors: IContributorModel[]) => {
        dispatch(storeContributors(contributors));
      },
      storeSourceActions: (actions: ISourceActionModel[]) => {
        dispatch(storeSourceActions(actions));
      },
      storeMetrics: (metrics: IMetricModel[]) => {
        dispatch(storeMetrics(metrics));
      },
      storeTags: (tags: ITagModel[]) => {
        dispatch(storeTags(tags));
      },
      storeTonePools: (tonePools: ITonePoolModel[]) => {
        dispatch(storeTonePools(tonePools));
      },
      storeUsers: (users: IUserModel[]) => {
        dispatch(storeUsers(users));
      },
      storeDataLocations: (dataLocations: IDataLocationModel[]) => {
        dispatch(storeDataLocations(dataLocations));
      },
      storeSettings: (settings: ISettingModel[]) => {
        dispatch(storeSettings(settings));
      },
      storeHolidays: (holidays: IHolidayModel[]) => {
        dispatch(storeHolidays(holidays));
      },
      storeMinisters: (ministers: IMinisterModel[]) => {
        dispatch(storeMinisters(ministers));
      },
    }),
    [dispatch],
  );

  return [state, controller];
};
function storeTopicScoreRules(rules: ITopicScoreRuleModel[]): any {
  throw new Error('Function not implemented.');
}
