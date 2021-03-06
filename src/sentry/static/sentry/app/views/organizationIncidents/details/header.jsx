import {Link} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import styled from 'react-emotion';

import {PageHeader} from 'app/styles/organization';
import {t} from 'app/locale';
import Access from 'app/components/acl/access';
import Count from 'app/components/count';
import DropdownControl from 'app/components/dropdownControl';
import InlineSvg from 'app/components/inlineSvg';
import LoadingError from 'app/components/loadingError';
import MenuItem from 'app/components/menuItem';
import PageHeading from 'app/components/pageHeading';
import SentryTypes from 'app/sentryTypes';
import SubscribeButton from 'app/components/subscribeButton';
import space from 'app/styles/space';

import {isOpen} from '../utils';
import Status from '../status';

export default class DetailsHeader extends React.Component {
  static propTypes = {
    incident: SentryTypes.Incident,
    params: PropTypes.object.isRequired,
    hasIncidentDetailsError: PropTypes.bool.isRequired,
    onSubscriptionChange: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
  };

  renderStatus() {
    const {incident, onStatusChange} = this.props;

    const isIncidentOpen = incident && isOpen(incident);

    return (
      <Access
        access={['org:write']}
        renderNoAccessMessage={() => (incident ? <Status incident={incident} /> : null)}
      >
        <DropdownControl
          data-test-id="status-dropdown"
          label={incident && <Status incident={incident} />}
          menuWidth="160px"
          alignRight
          buttonProps={!incident ? {disabled: true} : null}
        >
          <StyledMenuItem onSelect={onStatusChange}>
            {isIncidentOpen ? t('Close this incident') : t('Reopen this incident')}
          </StyledMenuItem>
        </DropdownControl>
      </Access>
    );
  }

  render() {
    const {hasIncidentDetailsError, incident, params, onSubscriptionChange} = this.props;
    const isIncidentReady = !!incident && !hasIncidentDetailsError;
    const eventLink = incident && {
      pathname: `/organizations/${params.orgId}/events/`,

      // Note we don't have project selector on here so there should be
      // no query params to forward
      query: {
        group: incident.groups,
      },
    };
    const dateStarted = incident && moment(incident.dateStarted).format('LL');

    return (
      <Header>
        <HeaderItem>
          <PageHeading>
            <Breadcrumb>
              <IncidentsLink to={`/organizations/${params.orgId}/incidents/`}>
                {t('Incidents')}
              </IncidentsLink>
              {dateStarted && (
                <React.Fragment>
                  <Chevron src="icon-chevron-right" size={space(2)} />
                  <IncidentDate>{dateStarted}</IncidentDate>
                </React.Fragment>
              )}
            </Breadcrumb>
            <IncidentTitle loading={!isIncidentReady}>
              {isIncidentReady ? incident.title : 'Loading'}
            </IncidentTitle>
          </PageHeading>
        </HeaderItem>
        {hasIncidentDetailsError ? (
          <StyledLoadingError />
        ) : (
          <GroupedHeaderItems>
            <HeaderItem>
              <ItemTitle>{t('Status')}</ItemTitle>
              <ItemValue>{this.renderStatus()}</ItemValue>
            </HeaderItem>
            <HeaderItem>
              <ItemTitle>{t('Event count')}</ItemTitle>
              {isIncidentReady && (
                <ItemValue>
                  <Count value={incident.totalEvents} />
                  <OpenLink to={eventLink}>
                    <InlineSvg src="icon-open" />
                  </OpenLink>
                </ItemValue>
              )}
            </HeaderItem>
            <HeaderItem>
              <ItemTitle>{t('Users affected')}</ItemTitle>
              {isIncidentReady && (
                <ItemValue>
                  <Count value={incident.uniqueUsers} />
                </ItemValue>
              )}
            </HeaderItem>
            <HeaderItem>
              <ItemTitle>{t('Notifications')}</ItemTitle>
              <ItemValue>
                <SubscribeButton
                  disabled={!isIncidentReady}
                  isSubscribed={incident && !!incident.isSubscribed}
                  onClick={onSubscriptionChange}
                />
              </ItemValue>
            </HeaderItem>
          </GroupedHeaderItems>
        )}
      </Header>
    );
  }
}

const Header = styled(PageHeader)`
  background-color: ${p => p.theme.white};
  border-bottom: 1px solid ${p => p.theme.borderDark};
  margin-bottom: 0;
  padding: ${space(3)} 0;
`;

const StyledLoadingError = styled(LoadingError)`
  flex: 1;

  &.alert.alert-block {
    margin: 0 20px;
  }
`;

const GroupedHeaderItems = styled('div')`
  display: flex;
  text-align: right;
`;

const HeaderItem = styled('div')`
  padding: 0 ${space(3)};
`;

const ItemTitle = styled('h6')`
  font-size: ${p => p.theme.fontSizeSmall};
  margin-bottom: ${space(1)};
  text-transform: uppercase;
  color: ${p => p.theme.gray2};
  letter-spacing: 0.1px;
`;

const ItemValue = styled('div')`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: ${p => p.theme.headerFontSize};
  height: 40px; /* This is the height of the Status dropdown */
`;

const Breadcrumb = styled('div')`
  display: flex;
  align-items: center;
  margin-bottom: ${space(1)};
`;

const IncidentTitle = styled('div')`
  ${p => p.loading && 'opacity: 0'};
`;

const IncidentDate = styled('div')`
  font-size: 0.8em;
  color: ${p => p.theme.gray2};
`;

const IncidentsLink = styled(Link)`
  color: inherit;
`;

const Chevron = styled(InlineSvg)`
  color: ${p => p.theme.gray1};
  margin: 0 ${space(0.5)};
`;

const StyledMenuItem = styled(MenuItem)`
  font-size: ${p => p.theme.fontSizeMedium};
  text-align: left;
  padding: ${space(1)};
`;

const OpenLink = styled(Link)`
  display: flex;
  font-size: ${p => p.theme.fontSizeLarge};
  color: ${p => p.theme.gray2};
  margin-left: ${space(1)};
`;
