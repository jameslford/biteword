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

export enum HeaderSizes {
  h1 = 32,
  h2 = 30,
  h3 = 28,
  h4 = 26,
  h5 = 24,
  h6 = 22,
}

export interface PageLayout {
  width: number;
  height: number;
  marginLR: number;
  marginTB: number;
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
  headerFontSize: number;
  paragraphIndent: number;
}

export const DEFAULT_CONFIG: Config = {
  bodyFont: FontFamily.arial,
  headerFont: FontFamily.arial,
  bodyFontSize: FontSizes.medium,
  headerFontSize: FontSizes.medium,
  paragraphIndent: 0,
};

// TODO: add more page sizes
enum PagesSizeNames {
  A4 = "A4",
  A5 = "A5",
  A6 = "A6",
  B5 = "B5",
}

type PageMapping = { [key in PagesSizeNames]: PageLayout };

export const PAGE_SIZES: PageMapping = {
  A4: { width: 595, height: 842, marginLR: 50, marginTB: 50 },
  A5: { width: 420, height: 595, marginLR: 50, marginTB: 50 },
  A6: { width: 297, height: 420, marginLR: 50, marginTB: 50 },
  B5: { width: 499, height: 709, marginLR: 50, marginTB: 50 },
};
