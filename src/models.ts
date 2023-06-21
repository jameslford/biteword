import * as puppeteer from "puppeteer";
import { marked } from "marked";
import {
  FontFamily,
  PageLayout,
  Config,
  SplitElement,
  TagNames,
  PAGE_SIZES,
  DEFAULT_CONFIG,
} from "./enums";
import {
  getTextBreak,
  createTextElementFromTag,
  createHtmlBoilerPlate,
} from "./utils";

export class Theme {
  headerFont: FontFamily;
  bodyFont: FontFamily;
  innerHeight: number;
  innerWidth: number;
  bodyFontSize: number;
  headerFontSize: number;
  pageHeight: number;
  pageWidth: number;
  marginLR: number;
  marginTB: number;

  public constructor(
    layout: PageLayout = PAGE_SIZES.A4,
    config: Config = DEFAULT_CONFIG
  ) {
    this.headerFont = config.headerFont;
    this.bodyFont = config.bodyFont;
    this.innerWidth = layout.width - layout.marginLR * 2;
    this.innerHeight = layout.height - layout.marginTB * 2;
    this.bodyFontSize = config.bodyFontSize;
    this.headerFontSize = config.headerFontSize;
    this.pageHeight = layout.height;
    this.pageWidth = layout.width;
    this.marginLR = layout.marginLR;
    this.marginTB = layout.marginTB;
  }

  get lineHeight(): number {
    return this.bodyFontSize * 1.5;
  }

  public style(): string {
    return `
    #page {
      border: 1px solid red;
      /* width: 97%; */
      margin-top: 10px;
      margin-left: 4cm;
      /* margin-right: auto;  */
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    #toolbar {
      position: fixed;
      top: 0;
      left: 0;
      margin: 0;
      width: 4cm;
      background-color: rgb(43, 73, 99);
      display: flex;
      align-items: center;
      align-content: space-around;
      height: 100vh;
    }

    html {
      box-sizing: border-box;
      font-size: 13px;
      margin: 0;
      }

    img {
        max-width: 100%;
        height: auto;
    }
  
    *,
    *:before,
    *:after {
        box-sizing: inherit;
    }

    body,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    ol,
    ul {
    margin: 0;
    padding: 0;
    font-weight: normal;
    }

    #prePage, .innerPage {
      padding: ${this.marginTB}px ${this.marginLR}px;
      width: ${this.pageWidth}px;
      position: relative;
    }
    .innerPage {
      height: ${this.pageHeight}px;
    }
    p, span {
      font-family: ${this.bodyFont};
      font-size: ${this.bodyFontSize}px;
      line-height: ${this.lineHeight}px;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: ${this.headerFont};
    }
    `;
  }
}

export class Parser {
  markdown: string;
  rawHtml: string;
  theme: Theme;
  elements?: SplitElement[];

  public constructor(markdown: string, theme: Theme) {
    this.markdown = markdown;
    this.rawHtml = marked(markdown);
    this.theme = theme;
  }

  get webpage(): any {
    const content = `<div id="toobar"></div><div id="page"><div id="prePage">${this.rawHtml}</div></div>`;
    return createHtmlBoilerPlate(content);
  }

  async domElements(): Promise<SplitElement[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(this.webpage);
    await page.addStyleTag({ content: this.theme.style() });
    const children = await page.$eval("#prePage", (el) => {
      const children = Array.prototype.slice.call(el.children);
      return children.map((child: HTMLElement) => {
        return {
          boundingBox: {
            offsetHeight: child.offsetHeight,
            offsetTop: child.offsetTop,
            scrollHeight: child.scrollHeight,
            height: child.clientHeight,
            width: child.clientWidth,
          },
          html: child.outerHTML,
          text: child.innerText,
          tagName: child.tagName,
        };
      });
    });
    return children;
  }

  _renderPages(elements: SplitElement[]): SplitElement[][] {
    const maxPageHeight = this.theme.innerHeight;
    let remainingHeight = maxPageHeight;
    let page: SplitElement[] = [];
    let pages: SplitElement[][] = [];
    const tagToSplit = ["P", "SPAN"];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      // Element fits on page
      if (element.boundingBox.height < remainingHeight) {
        page.push(element);
        remainingHeight -= element.boundingBox.height;
        continue;
      }
      // Element does not fit on page, but can be split
      if (tagToSplit.includes(element.tagName)) {
        const breakInfo = getTextBreak(this.theme, remainingHeight, element);
        if (breakInfo === null) {
          page.push(element);
          remainingHeight -= element.boundingBox.height;
          pages.push(page);
          page = [];
          remainingHeight = maxPageHeight;
          continue;
        }
        const firstElement = breakInfo[0];
        const secondElement = breakInfo[1];
        page.push(firstElement);
        let remainingElements = elements.slice(i + 1);
        remainingElements = [secondElement, ...remainingElements];
        const remainingPage = this._renderPages(remainingElements);
        pages.push(page);
        const final = [...pages, ...remainingPage];
        return final;
      }
      // TODO: handle case for lists, blockquotes and other splittable elements
      // Element does not fit on page, cannot be split, and cannot be moved to next page
      if (page.length === 0) {
        // TODO: handle this case
        continue;
      }
      // Element does not fit on page, and cannot be split, but can be moved to next page
      pages.push(page);
      page = [element];
      remainingHeight = maxPageHeight - element.boundingBox.height;
    }
    pages.push(page);
    return pages;
  }

  async getPages(): Promise<SplitElement[][]> {
    if (this.elements !== null && this.elements !== undefined) {
      return Promise.resolve(this._renderPages(this.elements));
    }
    return this.domElements().then((elements) => {
      this.elements = elements;
      return this._renderPages(elements);
    });
  }

  public async renderPages() {
    return this.getPages().then((pages) => {
      const flattend = pages.map((page) => {
        return page.map((element) => element.html).join("");
      });
      return `<div class="innerPage">${flattend.join(
        "</div><div class='innerPage'>"
      )}</div>`;
    });
  }
}
