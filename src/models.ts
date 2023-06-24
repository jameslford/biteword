import * as puppeteer from "puppeteer";
import * as vscode from "vscode";
import { marked } from "marked";
var pixelWidth = require("string-pixel-width");
import {
  FontFamily,
  PageLayout,
  Config,
  SplitElement,
  PAGE_SIZES,
  DEFAULT_CONFIG,
  HEADER_SIZES,
} from "./enums";
import { createHtmlBoilerPlate } from "./utils";

export class Theme {
  headerFont: FontFamily;
  bodyFont: FontFamily;
  innerHeight: number;
  innerWidth: number;
  bodyFontSize: number;
  pageHeight: number;
  pageWidth: number;
  marginLR: number;
  marginTB: number;
  paragraphIndent: number;

  public constructor(
    layout: PageLayout = PAGE_SIZES.A4,
    config: Config = DEFAULT_CONFIG
  ) {
    this.headerFont = config.headerFont;
    this.bodyFont = config.bodyFont;
    this.innerWidth = layout.width - layout.marginLR * 2;
    this.innerHeight = layout.height - layout.marginTB * 2;
    this.bodyFontSize = config.bodyFontSize;
    this.pageHeight = layout.height;
    this.pageWidth = layout.width;

    this.marginLR = layout.marginLR;
    this.marginTB = layout.marginTB;
    this.paragraphIndent = config.paragraphIndent;
  }

  get lineHeight(): number {
    return this.bodyFontSize * 1.5;
  }

  public style(): string {
    return `
    #page {
      margin-left: 3cm;
      margin-right: auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
    }

    #toolbar {
      position: fixed;
      top: 0;
      left: 0;
      margin: 0;
      padding: 30px 20px;
      width: 3cm;
      background-color: rgb(43, 73, 99);
      display: flex;
      flex-direction: column;
      align-items: center;
      align-content: space-around;
      height: 100vh;
    }

    html {
      box-sizing: border-box;
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

    h1 {
      font-size: ${HEADER_SIZES.h1.fontSize}px;
      line-height: ${HEADER_SIZES.h1.lineHeight}px;
    }
    h2 {
      font-size: ${HEADER_SIZES.h2.fontSize}px;
      line-height: ${HEADER_SIZES.h2.lineHeight}px;
    }
    h3 {
      font-size: ${HEADER_SIZES.h3.fontSize}px;
      line-height: ${HEADER_SIZES.h3.lineHeight}px;
    }
    h4 {
      font-size: ${HEADER_SIZES.h4.fontSize}px;
      line-height: ${HEADER_SIZES.h4.lineHeight}px;
    }
    h5 {
      font-size: ${HEADER_SIZES.h5.fontSize}px;
      line-height: ${HEADER_SIZES.h5.lineHeight}px;
    }
    h6 {
      font-size: ${HEADER_SIZES.h6.fontSize}px;
      line-height: ${HEADER_SIZES.h6.lineHeight}px;
    }


    body,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p
    {
    margin: 0;
    padding: 0;
    font-weight: normal;
    letter-spacing: 0;
    }

    ul, ol {
      font-weight: normal;
      letter-spacing: 0;
      list-style-type: none;
    }

    .innerPage > ul, .innerPage > ol {
      padding-left: 0;
    }


    #prePage, .innerPage {
      padding: ${this.marginTB}px ${this.marginLR}px;
      width: ${this.pageWidth}px;
      min-width: ${this.pageWidth}px;
      position: relative;
    }

    .innerPage {
      height: ${this.pageHeight}px;
    }

    p {
      text-indent: ${this.paragraphIndent}px;
    }
    pre {
      margin:0;
      padding: 15px 0;
    }

    p, span {
      font-family: '${this.bodyFont}';
      font-size: ${this.bodyFontSize}px;
      line-height: ${this.lineHeight}px;
      display: block;
      margin-block-start: 0px;
      margin-block-end: 0px;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: '${this.headerFont}';
    }
    `;
  }
}

export class TextElement {
  theme: Theme;
  text: string;
  html: string;
  tagName: string;
  words: string[];
  brokenlines: string[][];

  public constructor(
    theme: Theme,
    text: string,
    tagName: string,
    html: string
  ) {
    this.theme = theme;
    this.text = text;
    this.tagName = tagName;
    this.html = html;
    this.words = text.split(" ");
    this.brokenlines = this.breakLines();
  }
  get fontSize(): number {
    switch (this.tagName) {
      case "H1":
        return HEADER_SIZES.h1.fontSize;
      case "H2":
        return HEADER_SIZES.h2.fontSize;
      case "H3":
        return HEADER_SIZES.h3.fontSize;
      case "H4":
        return HEADER_SIZES.h4.fontSize;
      case "H5":
        return HEADER_SIZES.h5.fontSize;
      case "H6":
        return HEADER_SIZES.h6.fontSize;
      default:
        return this.theme.bodyFontSize;
    }
  }

  get lineHeight(): number {
    switch (this.tagName) {
      case "H1":
        return HEADER_SIZES.h1.lineHeight;
      case "H2":
        return HEADER_SIZES.h2.lineHeight;
      case "H3":
        return HEADER_SIZES.h3.lineHeight;
      case "H4":
        return HEADER_SIZES.h4.lineHeight;
      case "H5":
        return HEADER_SIZES.h5.lineHeight;
      case "H6":
        return HEADER_SIZES.h6.lineHeight;
      default:
        return this.theme.lineHeight;
    }
  }

  breakLines(): string[][] {
    let line = [];
    let lines = [];
    const spaceWidth = pixelWidth(" ", {
      font: this.theme.bodyFont.valueOf(),
      size: this.theme.bodyFontSize,
    });
    let curLineWidth = this.theme.paragraphIndent;
    for (let i = 0; i < this.words.length; i++) {
      const word = this.words[i];
      const wordWidth =
        pixelWidth(word, {
          font: this.theme.bodyFont.valueOf(),
          size: this.fontSize,
        }) + spaceWidth;
      if (curLineWidth + wordWidth > this.theme.innerWidth) {
        lines.push(line);
        line = [];
        curLineWidth = 0;
      }
      line.push(word);
      curLineWidth += wordWidth;
    }
    if (line.length > 0) {
      lines.push(line);
    }
    return lines;
  }

  get height(): number {
    return this.brokenlines.length * this.lineHeight;
  }

  public splitText(remainingHeight: number): SplitElement[] {
    const linesRemaining = Math.floor(remainingHeight / this.theme.lineHeight);
    const brokenFirst = this.brokenlines.slice(0, linesRemaining);
    const brokenSecond = this.brokenlines.slice(linesRemaining);
    const firstText = brokenFirst.map((line) => line.join(" ")).join(" ");
    const secondText = brokenSecond.map((line) => line.join(" ")).join(" ");
    const firstElement: SplitElement = {
      height: remainingHeight,
      html: `<p>${firstText}</p>`,
      text: firstText,
      tagName: "P",
    };
    const secondElement: SplitElement = {
      height: this.height - remainingHeight,
      html: `<span>${secondText}</span>`,
      text: secondText,
      tagName: "SPAN",
    };
    return [firstElement, secondElement];
  }
}

export class Parser {
  markdown: string;
  rawHtml: string;
  theme: Theme;
  elements?: SplitElement[];
  context: vscode.ExtensionContext;

  public constructor(
    markdown: string,
    theme: Theme,
    context: vscode.ExtensionContext
  ) {
    this.markdown = markdown;
    this.rawHtml = marked(markdown);
    this.theme = theme;
    this.context = context;
  }

  get webpage(): any {
    const content = `<div id="toobar"></div><div id="page"><div id="prePage">${this.rawHtml}</div></div>`;
    return createHtmlBoilerPlate(content);
  }

  get vscodeCssFileContent(): Thenable<string> {
    const onDiskPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      "assets",
      "vscode.css"
    );
    return vscode.workspace.fs.readFile(onDiskPath).then((data) => {
      return data.toString();
    });
  }

  get toolkitUriScript(): Thenable<string> {
    const onDiskPath = vscode.Uri.joinPath(
      this.context.extensionUri,
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js"
    );
    return vscode.workspace.fs.readFile(onDiskPath).then((data) => {
      return data.toString();
    });
  }

  public getTextLength(text: string) {
    const fontFamily = this.theme.bodyFont.valueOf();
    const fontSize = this.theme.bodyFontSize;
    return pixelWidth(text, { font: fontFamily, size: fontSize });
  }

  async domElements(): Promise<SplitElement[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: this.theme.pageWidth * 2,
      height: this.theme.pageHeight,
    });
    await page.setContent(this.webpage);
    await page.addScriptTag({ content: await this.toolkitUriScript });
    await page.addStyleTag({ content: await this.vscodeCssFileContent });
    const myStyle = this.theme.style();
    await page.addStyleTag({ content: myStyle });
    const children = await page.$eval("#prePage", (el) => {
      const children = Array.prototype.slice.call(el.children);
      return children.map((child: HTMLElement) => {
        return {
          height: child.clientHeight,
          width: child.clientWidth,
          html: child.outerHTML,
          text: child.innerText,
          tagName: child.tagName,
        };
      });
    });
    await browser.close();
    return children;
  }

  _renderPages(elements: SplitElement[]): SplitElement[][] {
    const maxPageHeight = this.theme.innerHeight;
    let remainingHeight = maxPageHeight;
    let page: SplitElement[] = [];
    let pages: SplitElement[][] = [];
    const tagToSplit = ["P", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6"];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      // Element fits on page
      if (tagToSplit.includes(element.tagName)) {
        const textElement = new TextElement(
          this.theme,
          element.text,
          element.tagName,
          element.html
        );
        console.log(
          "text element",
          element.text.slice(0, 30),
          textElement.height
        );
        const elementHeight = textElement.height;
        if (elementHeight < remainingHeight) {
          page.push(element);
          remainingHeight -= elementHeight;
          continue;
        }
        const splitElements = textElement.splitText(remainingHeight);
        page.push(splitElements[0]);
        let remainingElements = elements.slice(i + 1);
        remainingElements = [splitElements[1], ...remainingElements];
        const remainingPage = this._renderPages(remainingElements);
        pages.push(page);
        const final = [...pages, ...remainingPage];
        return final;
      }
      console.log("element", element, element.height);
      if (element.height < remainingHeight) {
        page.push(element);
        remainingHeight -= element.height;
        continue;
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
      remainingHeight = maxPageHeight - element.height;
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
