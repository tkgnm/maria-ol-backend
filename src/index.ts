import type { Core } from '@strapi/strapi';

const GROUP_UID = 'api::artwork-group.artwork-group';

/** Pull documentIds out of a Strapi relation input (id, object, array, or connect/set/disconnect). */
function relationIds(input: any, current: string[]): string[] {
  if (input === undefined) return current;
  if (input === null) return [];
  const toIds = (v: any): string[] =>
    (Array.isArray(v) ? v : [v]).map((x) => (typeof x === 'string' ? x : x?.documentId)).filter(Boolean);
  if (typeof input === 'string' || Array.isArray(input) || input.documentId) return toIds(input);
  if (input.set) return toIds(input.set);
  const removed = new Set(toIds(input.disconnect ?? []));
  return [...current.filter((id) => !removed.has(id)), ...toIds(input.connect ?? [])];
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // A group's boosted artwork must be one of the group's own artworks.
    strapi.documents.use(async (context, next) => {
      const { uid, action, params } = context as any;
      if (uid !== GROUP_UID || (action !== 'create' && action !== 'update')) return next();

      const data = params?.data ?? {};
      if (data.boostedArtwork === undefined && data.artworks === undefined) return next();

      const existing = params.documentId
        ? await strapi.db.query(GROUP_UID).findOne({
            where: { documentId: params.documentId },
            populate: ['artworks', 'boostedArtwork'],
          })
        : null;
      const currentArtworks: string[] = (existing?.artworks ?? []).map((a: any) => a.documentId);
      const currentBoosted: string[] = existing?.boostedArtwork ? [existing.boostedArtwork.documentId] : [];

      const [boosted] = relationIds(data.boostedArtwork, currentBoosted);
      const artworks = relationIds(data.artworks, currentArtworks);
      if (boosted && !artworks.includes(boosted)) {
        const { errors } = await import('@strapi/utils');
        throw new errors.ValidationError(
          'The boosted artwork must be one of the artworks in this group. Add it to the group first, or pick a different artwork.'
        );
      }
      return next();
    });
  },

  bootstrap() {},
};
