import { IReportModel } from 'tno-core';

import { defaultReportTemplate } from './defaultReportTemplate';

export const defaultReport: IReportModel = {
  id: 0,
  name: '',
  description: '',
  ownerId: 0,
  templateId: 0,
  template: defaultReportTemplate,
  settings: {
    viewOnWebOnly: false,
    subject: {
      text: '',
      showTodaysDate: false,
    },
    headline: {
      showSource: false,
      showShortName: false,
      showPublishedOn: false,
      showSentiment: false,
    },
    content: {
      includeStory: false,
      showImage: false,
      useThumbnail: false,
      highlightKeywords: false,
    },
    sections: {
      hideEmpty: false,
      usePageBreaks: false,
    },
    instance: {
      excludeHistorical: false,
      excludeReports: [],
    },
  },
  isEnabled: false,
  isPublic: false,
  sortOrder: 0,
  sections: [],
  subscribers: [],
  instances: [],
};
