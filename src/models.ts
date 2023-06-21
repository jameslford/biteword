import * as puppeteer from "puppeteer";
import * as vscode from "vscode";
import { marked } from "marked";
import * as fs from "fs";
import {
  FontFamily,
  PageLayout,
  Config,
  SplitElement,
  PAGE_SIZES,
  DEFAULT_CONFIG,
} from "./enums";
import { getTextBreak, createHtmlBoilerPlate } from "./utils";

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
    this.headerFontSize = config.headerFontSize;
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
      border: 1px solid red;
      width: 97%;
      margin-top: 10px;
      margin-left: 4cm;
      margin-right: auto;
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
    letter-spacing: normal;
    }

    #prePage, .innerPage {
      padding: ${this.marginTB}px ${this.marginLR}px;
      width: ${this.pageWidth}px;
      min-width: ${this.pageWidth}px;
      position: relative;
      outline: 1px solid blue;
    }

    .innerPage {
      height: ${this.pageHeight}px;
    }

    p {
      text-indent: ${this.paragraphIndent}em;
    }

    p, span {
      font-family: '${this.bodyFont}';
      font-size: ${this.bodyFontSize}px;
      line-height: ${this.lineHeight}px;
      display: block;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: '${this.headerFont}';
    }
    `;
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

  get spacingBar(): string {
    return `<div style="width: 595px; height: 6px; background-color: teal; position: absolute; top: 15px; left: 0px"></div>`;
  }

  get webpage(): any {
    const content = `<div id="toobar"></div><div id="page"><div id="prePage">${this.spacingBar} ${this.rawHtml}</div></div>`;
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

  async domElements(): Promise<SplitElement[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: this.theme.pageWidth * 2,
      height: this.theme.pageHeight,
    });
    await page.setContent(this.webpage);
    // await page.addScriptTag({ content: await this.toolkitUriScript });
    const vscodecss = await this.vscodeCssFileContent;
    await page.addStyleTag({ content: vscodecss });
    const myStyle = this.theme.style();
    console.log("myStyle :>> ", myStyle);
    await page.addStyleTag({ content: myStyle });
    // const demoPageCss =
    //   "body {min-width: 1200px} p {font-size: 12px; font-family: Arial} #prePage {background: lightblue; width: 595px; height: 842px;}";
    const demoPageCss =
      'p {font-family: Times, "Times New Roman", serif; line-height: 18px; letter-spacing: .9; font-size: 11.5px;}';
    await page.addStyleTag({ content: demoPageCss });
    // page.screenshot({ path: "./example.png" });
    try {
      // Capture screenshot and save it in the current folder:
      await page.screenshot({
        path: `/home/jford/projects/extension-biteword/scrapingbee_homepage.jpg`,
        fullPage: true,
      });
    } catch (err) {
      console.log(`Error: ${err.message}`);
    } finally {
      // await browser.close();
      console.log(`Screenshot has been captured successfully`);
    }
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
    await browser.close();
    return children;
  }

  _renderPages(elements: SplitElement[]): SplitElement[][] {
    const maxPageHeight = this.theme.innerHeight;
    console.log("maxPageHeight :>> ", maxPageHeight);
    let remainingHeight = maxPageHeight;
    // console.log("remainingHeight :>> ", remainingHeight);
    let page: SplitElement[] = [];
    let pages: SplitElement[][] = [];
    const tagToSplit = ["P", "SPAN"];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      // Element fits on page
      console.log("element :>> ", element.boundingBox.height, element.text);
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
      return `<div class="innerPage">${this.spacingBar} ${flattend.join(
        "</div><div class='innerPage'>"
      )}</div>`;
    });
  }
}
