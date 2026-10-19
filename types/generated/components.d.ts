import type { Schema, Struct } from '@strapi/strapi';

export interface ArtworkDimensions extends Struct.ComponentSchema {
  collectionName: 'components_artwork_dimensions';
  info: {
    displayName: 'dimensions';
  };
  attributes: {
    depth: Schema.Attribute.Integer;
    height: Schema.Attribute.Integer;
    unit: Schema.Attribute.Enumeration<['cm']> &
      Schema.Attribute.DefaultTo<'cm'>;
    width: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'artwork.dimensions': ArtworkDimensions;
    }
  }
}
