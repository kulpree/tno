import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIngestTypes } from 'store/hooks/admin';
import { Col, FlexboxTable, IconButton, IIngestTypeModel, Row } from 'tno-core';

import { columns } from './constants';
import { IngestTypeFilter } from './IngestTypeFilter';
import * as styled from './styled';

export const IngestTypeList: React.FC = () => {
  const navigate = useNavigate();
  const [{ ingestTypes }, api] = useIngestTypes();

  const [items, setItems] = React.useState<IIngestTypeModel[]>([]);

  React.useEffect(() => {
    if (!ingestTypes.length) {
      api.findAllIngestTypes().then((data) => {
        setItems(data);
      });
    } else {
      setItems(ingestTypes);
    }
  }, [api, ingestTypes]);

  return (
    <styled.IngestTypeList>
      <Row className="add-ingest" justifyContent="flex-end">
        <Col flex="1 1 0">
          Ingest types provide a way to identify the ingest that the content represents. Each ingest
          service is configured to listen to one or more of these ingest types.
        </Col>
        <IconButton
          iconType="plus"
          label="Add New Ingest Type"
          onClick={() => navigate('/admin/ingest/types/0')}
        />
      </Row>
      <IngestTypeFilter
        onFilterChange={(filter) => {
          if (filter && filter.length) {
            const value = filter.toLocaleLowerCase();
            setItems(
              ingestTypes.filter(
                (i) =>
                  i.name.toLocaleLowerCase().includes(value) ||
                  i.description.toLocaleLowerCase().includes(value),
              ),
            );
          } else {
            setItems(ingestTypes);
          }
        }}
      />
      <FlexboxTable
        rowId="id"
        data={items}
        columns={columns}
        showSort={true}
        onRowClick={(row) => navigate(`${row.original.id}`)}
        pagingEnabled={false}
      />
    </styled.IngestTypeList>
  );
};
