import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import {Panel, PanelBody, PanelItem} from 'app/components/panels';
import {t} from 'app/locale';
import AsyncComponent from 'app/components/asyncComponent';
import CommitLink from 'app/components/commitLink';
import CompactIssue from 'app/components/compactIssue';
import EventOrGroupExtraDetails from 'app/components/eventOrGroupExtraDetails';
import EventOrGroupHeader from 'app/components/eventOrGroupHeader';
import IdBadge from 'app/components/idBadge';
import SentryTypes from 'app/sentryTypes';
import SideHeader from 'app/views/organizationIncidents/details/sideHeader';
import TimeSince from 'app/components/timeSince';
import overflowEllipsis from 'app/styles/overflowEllipsis';
import space from 'app/styles/space';
import withApi from 'app/utils/withApi';
import withOrganization from 'app/utils/withOrganization';

function Message({type, suspect}) {
  const {message, id, repository} = suspect;
  if (type === 'commit') {
    return (
      <CommitRow>
        <MessageOverflow>
          <span>{message.split(/\n/)[0]}</span>
        </MessageOverflow>
        <CommitLink commitId={id} repository={repository} />
      </CommitRow>
    );
  }

  return null;
}

Message.propTypes = {
  type: PropTypes.oneOf(['commit']),
  suspect: SentryTypes.IncidentSuspectData,
};

const RelatedIssues = styled(
  class RelatedIssues extends React.Component {
    static propTypes = {
      loading: PropTypes.bool,
    };

    render() {
      const {className, api, incident, organization} = this.props;

      return (
        <div className={className}>
          <IssuesFetcher api={api} issueIds={incident && incident.groups}>
            {({issues, loading, error}) => {
              return (
                <React.Fragment>
                  <SideHeader loading={loading}>
                    {t('Related Issues')} ({loading || !issues ? '-' : issues.length})
                  </SideHeader>
                  {loading ? (
                    <Placeholder />
                  ) : (
                    issues &&
                    issues.length > 0 && (
                      <Panel>
                        <PanelBody>
                          {issues.map(issue => (
                            <SuspectItem p={1} key={issue.id}>
                              <EventOrGroupHeader size="small" hideLevel data={issue} />
                              <EventOrGroupExtraDetails {...issue} />
                            </SuspectItem>
                          ))}
                        </PanelBody>
                      </Panel>
                    )
                  )}
                </React.Fragment>
              );
            }}
          </IssuesFetcher>
        </div>
      );
    }
  }
)`
  margin-top: ${space(1)};
`;

const Placeholder = styled('div')`
  background-color: ${p => p.theme.placeholderBackground};
  padding: ${space(4)};
`;

export default withOrganization(
  withApi(
    class RelatedIssuesContainer extends React.Component {
      render() {
        return <RelatedIssues {...this.props} />;
      }
    }
  )
);

class IssuesFetcher extends React.PureComponent {
  state = {
    loading: true,
    issues: null,
    error: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    console.log('did update');
    if (prevProps.issueIds !== this.props.issueIds) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    const {api, issueIds} = this.props;
    this.setState({loading: true});

    console.log('fetch data', issueIds);
    if (!issueIds) {
      return;
    }

    try {
      const issues = await Promise.all(
        issueIds.map(issueId => findIssueById(api, issueId))
      );
      this.setState({
        loading: false,
        issues,
      });
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      this.setState({loading: false, error});
    }
  };

  render() {
    return this.props.children(this.state);
  }
}

function findIssueById(api, issueId) {
  return api.requestPromise(`/issues/${issueId}/`);
}

const Type = styled('div')`
  text-transform: uppercase;
  color: ${p => p.theme.gray4};
  font-size: ${p => p.theme.fontSizeMedium};
  font-weight: bold;
`;

const FlexCenter = styled('div')`
  display: flex;
  align-items: center;
`;
const CommitRow = styled(FlexCenter)`
  margin: ${space(0.5)} 0;
`;
const AuthorRow = styled(FlexCenter)`
  color: ${p => p.theme.gray2};
  justify-content: space-between;
  font-size: ${p => p.theme.fontSizeSmall};
`;

const MessageOverflow = styled('div')`
  flex: 1;
  ${overflowEllipsis}
`;

const SuspectItem = styled(PanelItem)`
  flex-direction: column;
`;

const LightTimeSince = styled(TimeSince)`
  font-size: ${p => p.theme.fontSizeSmall};
`;
