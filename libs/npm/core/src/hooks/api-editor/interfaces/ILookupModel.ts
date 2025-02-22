import {
  IActionModel,
  IContributorModel,
  IDataLocationModel,
  IHolidayModel,
  IIngestTypeModel,
  ILicenseModel,
  IMetricModel,
  IMinisterModel,
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
} from '.';

export interface ILookupModel {
  actions: IActionModel[];
  topics: ITopicModel[];
  rules: ITopicScoreRuleModel[];
  products: IProductModel[];
  sources: ISourceModel[];
  licenses: ILicenseModel[];
  ingestTypes: IIngestTypeModel[];
  roles: IRoleModel[];
  series: ISeriesModel[];
  contributors: IContributorModel[];
  sourceActions: ISourceActionModel[];
  metrics: IMetricModel[];
  tags: ITagModel[];
  tonePools: ITonePoolModel[];
  users: IUserModel[];
  dataLocations: IDataLocationModel[];
  settings: ISettingModel[];
  holidays: IHolidayModel[];
  ministers: IMinisterModel[];
}
