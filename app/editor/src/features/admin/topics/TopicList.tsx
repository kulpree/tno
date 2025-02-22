import { FormikForm } from 'components/formik';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTopics } from 'store/hooks/admin';
import {
  Button,
  ButtonVariant,
  Col,
  FieldSize,
  FlexboxTable,
  FormikSelect,
  FormikText,
  FormPage,
  getEnumStringOptions,
  ITopicModel,
  Row,
  TopicTypeName,
} from 'tno-core';

import { defaultTopic } from './constants';
import * as styled from './styled';
import { TopicFilter } from './TopicFilter';
import { useColumns } from './useColumns';

/**
 * Provides a list of all topics.
 * Provides CRUD form for topics.
 * @returns Component
 */
export const TopicList: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [, api] = useTopics();

  const [loading, setLoading] = React.useState(false);
  const [topics, setTopics] = React.useState<ITopicModel[]>([]);
  const [items, setItems] = React.useState<ITopicModel[]>([]);
  const [topicFilter, setTopicFilter] = React.useState('');

  const topicTypeOptions = getEnumStringOptions(TopicTypeName);

  React.useEffect(() => {
    if (!items.length && !loading && !topicFilter) {
      setLoading(true);
      api
        .findAllTopics()
        .then((data) => {
          setTopics(data.filter((t) => t.id !== 1));
          setItems(data.filter((t) => t.id !== 1 && t.isEnabled));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [api, items.length, loading, topicFilter]);

  const handleRemove = async (topicId: number) => {
    const topic = items.find((i) => i.id === topicId);
    if (!topic) return;
    try {
      setLoading(true);
      const removedTopic = await api.updateTopic({ ...topic, isEnabled: false });
      setItems(items.filter((t) => t.id !== topic.id));
      setTopics(topics.map((item) => (item.id === topic.id ? removedTopic : item)));
      navigate('/admin/topics');
      toast.success(`${topic.name} has successfully been deleted.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ITopicModel) => {
    try {
      setLoading(true);
      var results = [...items];
      let updatedTopics: ITopicModel[];
      const existsTopic = topics.find((x) => x.name === values.name);
      if (values.id === 0) {
        if (!existsTopic) {
          const result = await api.addTopic(values);
          results = [...items, result];
          updatedTopics = [...topics, result];
        } else {
          if (existsTopic.isEnabled) {
            toast.warn(`${values.name} already exists.`);
            return;
          } else {
            const result = await api.updateTopic({
              ...existsTopic,
              isEnabled: values.isEnabled,
              topicType: values.topicType,
            });
            results = [...items, result];
            updatedTopics = topics.map((i) => (i.id === existsTopic.id ? result : i));
          }
        }
      } else {
        if (!existsTopic || values.id === existsTopic.id) {
          const result = await api.updateTopic(values);
          results = items.map((i) => (i.id === values.id ? result : i));
          updatedTopics = topics.map((i) => (i.id === values.id ? result : i));
        } else {
          toast.warn(`${values.name} already exists.`);
          return;
        }
      }
      setItems(results.filter((x) => x.isEnabled));
      setTopics(updatedTopics);
      toast.success(`${values.name} has successfully been saved.`);
      // Do we have a better way here for the clean-up after adding a new topic?
      if (values.id === 0) {
        if (values.name !== defaultTopic.name) values.name = defaultTopic.name;
        if (values.topicType !== defaultTopic.topicType) values.topicType = defaultTopic.topicType;
        if (id) navigate('/admin/topics');
      }
    } catch {
      // Ignore error as it's handled globally.
    } finally {
      setLoading(false);
    }
  };

  return (
    <styled.TopicList>
      <FormPage>
        <Col flex="2 1 0">
          <Col>
            <p className="topic-list-title">
              <b>Update Topics List (Event of the Day)</b>
            </p>
            <FormikForm
              loading={false}
              initialValues={defaultTopic}
              onSubmit={async (values, { setSubmitting }) => {
                await handleSubmit(values);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, values, setValues }) => (
                <>
                  <Row>
                    <p>
                      <b>Create a new topic</b>
                    </p>
                  </Row>
                  <Row alignItems="center">
                    <FormikText name="name" label="Topic Name" width="295px" />
                    <FormikSelect
                      label="Type"
                      name="topicType"
                      isClearable={false}
                      options={topicTypeOptions}
                      value={topicTypeOptions.find((o) => o.value === values.topicType)}
                      width={FieldSize.Medium}
                    />
                    <Button
                      type="submit"
                      variant={ButtonVariant.primary}
                      disabled={isSubmitting || !values.name || !values.topicType}
                      style={{ marginTop: '15px' }}
                    >
                      Save
                    </Button>
                  </Row>
                </>
              )}
            </FormikForm>
            <TopicFilter
              onFilterChange={(filter) => {
                setTopicFilter(filter);
                if (filter && filter.length) {
                  const value = filter.toLocaleLowerCase();
                  setItems(
                    topics.filter(
                      (i) =>
                        i.isEnabled &&
                        (i.name.toLocaleLowerCase().includes(value) ||
                          i.description.toLocaleLowerCase().includes(value) ||
                          i.topicType.toLocaleLowerCase().includes(value)),
                    ),
                  );
                } else {
                  setItems(topics.filter((x) => x.isEnabled));
                }
                if (id) {
                  navigate('/admin/topics');
                }
              }}
            />
            <FlexboxTable
              rowId="id"
              data={items}
              columns={useColumns(handleRemove, handleSubmit, loading)}
              showSort={true}
              activeRowId={id}
              onRowClick={(row) => navigate(`/admin/topics/${row.original.id}`)}
              pagingEnabled={false}
              isLoading={loading}
            />
          </Col>
        </Col>
      </FormPage>
    </styled.TopicList>
  );
};
