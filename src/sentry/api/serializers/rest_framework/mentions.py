from __future__ import absolute_import

from sentry.api.fields.actor import Actor
from sentry.api.serializers.rest_framework.group_notes import seperate_resolved_actors
from sentry.models import Team


def extract_user_ids_from_mentions(organization_id, mentions):
    """
    Extracts user ids from a set of mentions. Mentions should be a list of
    `Actor` instances. Returns a dictionary with 'users' and 'team_users' keys.
    'users' is the user ids for all explicitly mentioned users, and 'team_users'
    is all user ids from explicitly mentioned teams, excluding any already
    mentioned users.
    """
    actors = Actor.resolve_many(mentions)
    actor_mentions = seperate_resolved_actors(actors)

    mentioned_team_users = list(
        Team.objects.get_users_from_teams(
            organization_id,
            actor_mentions['teams'],
        ).exclude(id__in={u.id for u in actor_mentions['users']}).values_list(
            'id',
            flat=True,
        )
    )

    return {
        'users': set([user.id for user in actor_mentions['users']]),
        'team_users': set(mentioned_team_users),
    }
