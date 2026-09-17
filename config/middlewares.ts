import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  // Images are served via CloudFront, e.g. https://dxxxx.cloudfront.net
  const cdnHost = env('CDN_URL', '').replace(/^https?:\/\//, '');

  // Pre-migration media (uploaded before the maria-ol-uploads-production
  // cutover) still resolves through the old CloudFront distribution/bucket,
  // which isn't going anywhere until that's migrated - see
  // terraform/README.md. Without allowing it here too, the admin Media
  // Library's CSP blocks previews for every file uploaded before the
  // cutover, even though the files themselves are still reachable. Remove
  // this once the old media is fully migrated/decommissioned.
  const legacyCdnHost = 'd1q5p6hqzb0oxy.cloudfront.net';

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', cdnHost, legacyCdnHost],
            'media-src': ["'self'", 'data:', 'blob:', cdnHost, legacyCdnHost],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
