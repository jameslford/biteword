// TODO create transform for actual html tag
export enum TagNames {
  h1 = "H1",
  h2 = "H2",
  h3 = "H3",
  h4 = "H4",
  h5 = "H5",
  h6 = "H6",
  p = "P",
  span = "SPAN",
  div = "DIV",
  ul = "UL",
  ol = "OL",
  li = "LI",
  table = "TABLE",
  tr = "TR",
  td = "TD",
  th = "TH",
  thead = "THEAD",
  tbody = "TBODY",
  tfoot = "TFOOT",
  blockquote = "BLOCKQUOTE",
  pre = "PRE",
  code = "CODE",
  img = "IMG",
  a = "A",
  br = "BR",
  hr = "HR",
  em = "EM",
  strong = "STRONG",
  i = "I",
  b = "B",
  u = "U",
  s = "S",
  strike = "STRIKE",
  sup = "SUP",
  sub = "SUB",
  mark = "MARK",
  small = "SMALL",
  big = "BIG",
  center = "CENTER",
  font = "FONT",
}

// TODO: add more fonts & transforms to the name
export enum FontFamily {
  andaleMono = "Andale Mono",
  arial = "Arial",
  avenir = "Avenir",
  avenirNext = "Avenir Next",
  comicSansMs = "Comic Sans MS",
  courierNew = "Courier New",
  georgia = "Georgia",
  helvetica = "Helvetica",
  impact = "Impact",
  inter = "Inter",
  timesNewRoman = "Times New Roman",
  trebuchetMs = "Trebuchet MS",
  verdana = "Verdana",
  webdings = "Webdings",
  openSans = "Open Sans",
  tahoma = "Tahoma",
}

// TODO: separate font sizes for header and body
export enum FontSizes {
  small = 10,
  medium = 12,
  large = 14,
  xlarge = 16,
  xxlarge = 18,
}

// export enum FontSizes {
//   small = "small",
//   medium = "medium",
//   large = "large",
//   xlarge = "xlarge",
//   xxlarge = "xxlarge",
// }

export enum HeaderSizes {
  h1 = "h1",
  h2 = "h2",
  h3 = "h3",
  h4 = "h4",
  h5 = "h5",
  h6 = "h6",
}

export interface PageLayout {
  width: number;
  height: number;
  marginLR: number;
  marginTB: number;
}

export interface FontAttributes {
  fontSize: number;
  lineHeight: number;
}

export interface SplitElement {
  html: string;
  text: string;
  tagName: string;
  height: number;
  width?: number;
}

export interface Config {
  bodyFont: FontFamily;
  headerFont: FontFamily;
  bodyFontSize: number;
  paragraphIndent: number;
}

// TODO: add more page sizes
enum PagesSizeNames {
  A4 = "A4",
  A5 = "A5",
  A6 = "A6",
  B5 = "B5",
}

type PageMapping = { [key in PagesSizeNames]: PageLayout };
type HeaderMapping = { [key in HeaderSizes]: FontAttributes };
type TextMapping = { [key in FontSizes]: FontAttributes };

// export const TEXT_SIZES: TextMapping = {
//   small: { fontSize: 10, lineHeight: 12 },
//   medium: { fontSize: 13, lineHeight: 17 },
//   large: { fontSize: 14, lineHeight: 16 },
//   xlarge: { fontSize: 16, lineHeight: 18 },
//   xxlarge: { fontSize: 18, lineHeight: 20 },
// };

export const HEADER_SIZES: HeaderMapping = {
  h1: { fontSize: 32, lineHeight: 38 },
  h2: { fontSize: 30, lineHeight: 35 },
  h3: { fontSize: 28, lineHeight: 33 },
  h4: { fontSize: 26, lineHeight: 31.5 },
  h5: { fontSize: 24, lineHeight: 28 },
  h6: { fontSize: 22, lineHeight: 27 },
};

export const PAGE_SIZES: PageMapping = {
  A4: { width: 595, height: 842, marginLR: 50, marginTB: 50 },
  A5: { width: 420, height: 595, marginLR: 50, marginTB: 50 },
  A6: { width: 297, height: 420, marginLR: 50, marginTB: 50 },
  B5: { width: 499, height: 709, marginLR: 50, marginTB: 50 },
};

export const DEFAULT_CONFIG: Config = {
  bodyFont: FontFamily.arial,
  headerFont: FontFamily.arial,
  bodyFontSize: FontSizes.medium,
  paragraphIndent: 30,
};
