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

export interface LayoutCarousel extends Struct.ComponentSchema {
  collectionName: 'components_layout_carousel';
  info: {
    description: 'A sideways-scrolling strip of artworks within the page width, several visible at once, in the order listed.';
    displayName: 'Carousel';
  };
  attributes: {
    artworks: Schema.Attribute.Relation<'oneToMany', 'api::artwork.artwork'>;
  };
}

export interface LayoutFourAcross extends Struct.ComponentSchema {
  collectionName: 'components_layout_four_across';
  info: {
    description: 'Four artworks in a row, equal size.';
    displayName: 'Four across';
  };
  attributes: {
    first: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    fourth: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    second: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    third: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
  };
}

export interface LayoutFullWidth extends Struct.ComponentSchema {
  collectionName: 'components_layout_full_width';
  info: {
    description: 'One artwork across the full content width.';
    displayName: 'Full width';
  };
  attributes: {
    artwork: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
  };
}

export interface LayoutHeading extends Struct.ComponentSchema {
  collectionName: 'components_layout_heading';
  info: {
    description: 'Optional section title and text above the rows that follow.';
    displayName: 'Heading';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutHero extends Struct.ComponentSchema {
  collectionName: 'components_layout_hero';
  info: {
    description: 'Full-bleed image at the top of the page. Only used when it is the first block.';
    displayName: 'Hero';
  };
  attributes: {
    artwork: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface LayoutImmersive extends Struct.ComponentSchema {
  collectionName: 'components_layout_immersive';
  info: {
    description: 'Full-screen carousel of artworks, in the order listed.';
    displayName: 'Immersive';
  };
  attributes: {
    artworks: Schema.Attribute.Relation<'oneToMany', 'api::artwork.artwork'>;
  };
}

export interface LayoutThreeAcross extends Struct.ComponentSchema {
  collectionName: 'components_layout_three_across';
  info: {
    description: 'Three artworks in a row, equal size.';
    displayName: 'Three across';
  };
  attributes: {
    left: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    middle: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    right: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
  };
}

export interface LayoutThreeMiddleLarge extends Struct.ComponentSchema {
  collectionName: 'components_layout_three_middle_large';
  info: {
    description: 'Three artworks in a row, the middle one larger.';
    displayName: 'Three, middle large';
  };
  attributes: {
    left: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    middle: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    right: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
  };
}

export interface LayoutTwoAcross extends Struct.ComponentSchema {
  collectionName: 'components_layout_two_across';
  info: {
    description: 'Two artworks side by side, equal size.';
    displayName: 'Two across';
  };
  attributes: {
    left: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
    right: Schema.Attribute.Relation<'oneToOne', 'api::artwork.artwork'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'artwork.dimensions': ArtworkDimensions;
      'layout.carousel': LayoutCarousel;
      'layout.four-across': LayoutFourAcross;
      'layout.full-width': LayoutFullWidth;
      'layout.heading': LayoutHeading;
      'layout.hero': LayoutHero;
      'layout.immersive': LayoutImmersive;
      'layout.three-across': LayoutThreeAcross;
      'layout.three-middle-large': LayoutThreeMiddleLarge;
      'layout.two-across': LayoutTwoAcross;
    }
  }
}
