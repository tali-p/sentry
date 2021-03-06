import {t} from 'app/locale';
import TagStore from 'app/stores/tagStore';
import TagActions from 'app/actions/tagActions';
import AlertActions from 'app/actions/alertActions';

const MAX_TAGS = 500;

const BUILTIN_TAGS = [
  'event.type',
  'platform',
  'message',
  'title',
  'location',
  'timestamp',
  'release',
  'user.id',
  'user.username',
  'user.email',
  'user.ip',
  'sdk.name',
  'sdk.version',
  'contexts.key',
  'contexts.value',
  'http.method',
  'http.url',
  'os.build',
  'os.kernel_version',
  'device.brand',
  'device.locale',
  'device.uuid',
  'device.model_id',
  'device.arch',
  'device.orientation',
  'geo.country_code',
  'geo.region',
  'geo.city',
  'error.type',
  'error.value',
  'error.mechanism',
  'error.handled',
  'stack.abs_path',
  'stack.filename',
  'stack.package',
  'stack.module',
  'stack.function',
  'stack.stack_level',
].map(tag => ({
  key: tag,
}));

function tagFetchSuccess(tags) {
  const trimmedTags = tags.slice(0, MAX_TAGS);

  if (tags.length > MAX_TAGS) {
    AlertActions.addAlert({
      message: t('You have too many unique tags and some have been truncated'),
      type: 'warn',
    });
  }
  TagActions.loadTagsSuccess(trimmedTags);
}

/**
 * Fetch tag values for a single project. Used for sentry9 views.
 */
export function fetchProjectTagValues(api, orgId, projectId, tagKey, search = null) {
  const url = `/projects/${orgId}/${projectId}/tags/${tagKey}/values/`;

  const query = {};
  if (search) {
    query.query = search;
  }

  return api.requestPromise(url, {
    method: 'GET',
    query,
  });
}

/**
 * Fetch tags for an organization or a subset or projects.
 */
export function fetchOrganizationTags(api, orgId, projectIds = null) {
  TagStore.reset();
  TagActions.loadTags();

  const url = `/organizations/${orgId}/tags/`;
  const query = projectIds ? {project: projectIds} : null;

  const promise = api
    .requestPromise(url, {
      method: 'GET',
      query,
    })
    .then(tags => {
      return [...BUILTIN_TAGS, ...tags];
    });
  promise.then(tagFetchSuccess, TagActions.loadTagsError);

  return promise;
}

/**
 * Fetch tag values for an organization.
 * The `projectIds` argument can be used to subset projects.
 */
export function fetchTagValues(api, orgId, tagKey, search = null, projectIds = null) {
  const url = `/organizations/${orgId}/tags/${tagKey}/values/`;

  const query = {};
  if (search) {
    query.query = search;
  }
  if (projectIds) {
    query.project = projectIds;
  }

  return api.requestPromise(url, {
    method: 'GET',
    query,
  });
}
