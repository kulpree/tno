import { DateFilter } from 'components/date-filter';
import { determinecolumns } from 'features/home/constants';
import moment from 'moment';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from 'store/hooks';
import { ActionName, FlexboxTable, IContentModel, Row } from 'tno-core';

import * as styled from './styled';

/** Component that displays top stories defaulting to today's date and adjustable via a date filter. */
export const TopStories: React.FC = () => {
  const [{ filterAdvanced }, { findContent }] = useContent();
  const navigate = useNavigate();
  const [topStories, setTopStories] = React.useState<IContentModel[]>([]);

  React.useEffect(() => {
    findContent({
      actions: [ActionName.TopStory],
      contentTypes: [],
      publishedStartOn: moment(filterAdvanced.startDate).toISOString(),
      publishedEndOn: moment(filterAdvanced.endDate).toISOString(),
      quantity: 100,
    }).then((data) => setTopStories(data.items));
  }, [findContent, filterAdvanced]);

  return (
    <styled.TopStories>
      <DateFilter />
      <Row className="table-container">
        <FlexboxTable
          rowId="id"
          columns={determinecolumns('all')}
          isMulti
          groupBy={(item) => item.original.source?.name ?? ''}
          onRowClick={(e: any) => {
            navigate(`/view/${e.original.id}`);
          }}
          data={topStories}
          pageButtons={5}
          showPaging={false}
        />
      </Row>
    </styled.TopStories>
  );
};
