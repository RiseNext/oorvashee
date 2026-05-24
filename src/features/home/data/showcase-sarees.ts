/**
 * Demo placeholder sarees for the interactive Saree Showcase section.
 *
 * The visual is rendered from `palette` — silk gradient + gold borders — so
 * the section looks finished before the client provides real photography.
 * To switch to real assets later: set `image` on each entry and the
 * placeholder components will swap automatically.
 */
export interface ShowcaseSaree {
  /** Stable id used to link a top folded saree to its bottom counterpart. */
  id: string;
  name: string;
  /** Optional real asset path. When set, the visual will use it instead of the palette. */
  image?: string;
  /** Silk colour stops used to build a believable folded-saree gradient. */
  palette: {
    base: string;
    highlight: string;
    shadow: string;
  };
}

export const SHOWCASE_SAREES: ShowcaseSaree[] = [
  {
    id: "rama-green",
    name: "Lenin Printed – SSS-29",
    image: "/images/products/sss-29.jpg",
    palette: {
      base: "#1a8a7a",
      highlight: "#2ec4b6",
      shadow: "#0d5c54",
    },
  },
  {
    id: "rama-green-2",
    name: "Lenin Printed – SSS-29",
    image: "/images/products/sss-29.jpg",
    palette: {
      base: "#1a8a7a",
      highlight: "#2ec4b6",
      shadow: "#0d5c54",
    },
  },
  {
    id: "rama-green-3",
    name: "Lenin Printed – SSS-29",
    image: "/images/products/sss-29.jpg",
    palette: {
      base: "#1a8a7a",
      highlight: "#2ec4b6",
      shadow: "#0d5c54",
    },
  },
  {
    id: "rama-green-4",
    name: "Lenin Printed – SSS-29",
    image: "/images/products/sss-29.jpg",
    palette: {
      base: "#1a8a7a",
      highlight: "#2ec4b6",
      shadow: "#0d5c54",
    },
  },
];
