import { useFormikContext } from 'formik';
import React from 'react';
import { FormikText, IIngestModel } from 'tno-core';

import * as styled from './styled';

export const Image: React.FC = (props) => {
  const { values } = useFormikContext<IIngestModel>();

  return (
    <styled.IngestType>
      <FormikText
        label="Path to Files"
        name="configuration.path"
        value={values.configuration.path}
      />
      <FormikText
        label="File Name Expression (i.e. Code)"
        name="configuration.fileName"
        value={values.configuration.fileName}
      />
    </styled.IngestType>
  );
};
