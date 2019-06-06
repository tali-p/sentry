import {Box} from 'grid-emotion';
import {withRouter} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';

import BookmarkStar from 'app/components/bookmarkStar';
import {Client} from 'app/api';
import {loadStatsForProject} from 'app/actionCreators/projects';
import IdBadge from 'app/components/idBadge';
import Link from 'app/components/links/link';
import ProjectsStatsStore from 'app/stores/projectsStatsStore';
import SentryTypes from 'app/sentryTypes';
import space from 'app/styles/space';
import withOrganization from 'app/utils/withOrganization';

import Chart from './chart';
import Deploys from './deploys';
import NoEvents from './noEvents';

class ProjectCard extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
    project: SentryTypes.Project.isRequired,
    params: PropTypes.object,
    hasProjectAccess: PropTypes.bool,
  };

  componentDidMount() {
    const {project, params} = this.props;

    this.api = new Client();

    // fetch project stats
    loadStatsForProject(this.api, project.id, {
      orgId: params.orgId,
    });
  }

  render() {
    const {organization, project, hasProjectAccess, params} = this.props;
    const {id, firstEvent, stats, slug} = project;

    return (
      <ProjectCardWrapper data-test-id={slug} width={['100%', '50%', '33%', '25%']}>
        {stats ? (
          <StyledProjectCard>
            <StyledProjectCardHeader>
              <StyledIdBadge
                project={project}
                avatarSize={18}
                displayName={
                  hasProjectAccess ? (
                    <Link to={`/organizations/${params.orgId}/issues/?project=${id}`}>
                      <strong>{slug}</strong>
                    </Link>
                  ) : (
                    <span>{slug}</span>
                  )
                }
              />
              <BookmarkStar organization={organization} project={project} />
            </StyledProjectCardHeader>
            <ChartContainer>
              <Chart stats={stats} noEvents={!firstEvent} />
              {!firstEvent && <NoEvents />}
            </ChartContainer>
            <Deploys project={project} organization={organization} />
          </StyledProjectCard>
        ) : (
          <LoadingCard />
        )}
      </ProjectCardWrapper>
    );
  }
}

const ProjectCardContainer = createReactClass({
  propTypes: {
    project: SentryTypes.Project,
  },
  mixins: [Reflux.listenTo(ProjectsStatsStore, 'onProjectStoreUpdate')],
  getInitialState() {
    const {project} = this.props;
    const initialState = ProjectsStatsStore.getInitialState() || {};
    return {
      projectDetails: initialState[project.slug] || null,
    };
  },
  onProjectStoreUpdate(itemsBySlug) {
    const {project} = this.props;

    // Don't update state if we already have stats
    if (!itemsBySlug[project.slug]) {
      return;
    }
    if (itemsBySlug[project.slug] === this.state.projectDetails) {
      return;
    }

    this.setState({
      projectDetails: itemsBySlug[project.slug],
    });
  },
  render() {
    const {project, ...props} = this.props;
    const {projectDetails} = this.state;
    return (
      <ProjectCard
        {...props}
        project={{
          ...project,
          ...(projectDetails || {}),
        }}
      />
    );
  },
});

const ChartContainer = styled('div')`
  position: relative;
  background: ${p => p.theme.offWhite};
  padding-top: ${space(1)};
`;

const StyledProjectCardHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px ${space(2)};
`;

const ProjectCardWrapper = styled(Box)`
  padding: 10px;
`;

const StyledProjectCard = styled('div')`
  background-color: white;
  border: 1px solid ${p => p.theme.borderDark};
  border-radius: ${p => p.theme.borderRadius};
  box-shadow: ${p => p.theme.dropShadowLight};
`;

const LoadingCard = styled('div')`
  border: 1px solid transparent;
  background-color: ${p => p.theme.offWhite};
  height: 210px;
`;

const StyledIdBadge = styled(IdBadge)`
  overflow: hidden;
  white-space: nowrap;
`;

export {ProjectCard};
export default withRouter(withOrganization(ProjectCardContainer));
