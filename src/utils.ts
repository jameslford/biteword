import * as vscode from "vscode";
import * as fs from "fs";
var pixelWidth = require("string-pixel-width");
import { Parser, Theme } from "./models";
import { DEFAULT_CONFIG, PAGE_SIZES, SplitElement, TagNames } from "./enums";

export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function getCurrentTheme() {
  // TODO: implement this to pull from vscode settings
  // const config = vscode.workspace.getConfiguration("biteword");
  // const theme = config.get("theme");
  return new Theme(PAGE_SIZES.A4, DEFAULT_CONFIG);
}

export function getUri(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

export function getTextBreak(
  theme: Theme,
  remainingHeight: number,
  element: SplitElement
): SplitElement[] | null {
  const lineWidth = theme.innerWidth;
  const lineHeight = theme.lineHeight;
  const fontFamily = theme.bodyFont.valueOf();
  const fontSize = theme.bodyFontSize;
  const text = element.text;

  const words = text.split(" ");
  let line = "";
  let lines = [];
  const spaceWidth = pixelWidth(" ", { font: fontFamily, size: fontSize });
  let curLineWidth = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // TODO: support bold and italic
    const bold = false;
    const italic = false;
    const wordWidth =
      pixelWidth(word, {
        font: fontFamily,
        size: fontSize,
        bold: bold,
        italic: italic,
      }) + spaceWidth;
    if (curLineWidth + wordWidth > lineWidth) {
      const currentHeight = lines.length * lineHeight + lineHeight;
      if (currentHeight > remainingHeight) {
        const firstWords = words.slice(0, i - 1);
        const secondWords = words.slice(i - 1);
        const secondHeight = element.boundingBox.height - currentHeight;
        return [
          {
            text: firstWords.join(" "),
            html: createTextElementFromTag(
              element.tagName,
              firstWords.join(" ")
            ),
            tagName: element.tagName,
            boundingBox: { height: currentHeight },
          },
          {
            text: secondWords.join(" "),
            html: createTextElementFromTag(
              TagNames.span,
              secondWords.join(" ")
            ),
            tagName: TagNames.span,
            boundingBox: { height: secondHeight },
          },
        ];
      }
      lines.push(line);
      curLineWidth = 0;
      line = "";
    }
    line += " " + word;
    curLineWidth += wordWidth;
  }
  return null;
}

export function createTextElementFromTag(tag: string, text: string) {
  return `<${tag.toLowerCase()}>${text}</${tag.toLowerCase()}>`;
}

export function createHtmlFileFromMarkdown(uri: vscode.Uri) {
  const mdText = fs.readFileSync(uri.path, "utf-8");
  const theme = getCurrentTheme();
  const parser = new Parser(mdText, theme);
  const fragments = uri.path.split("/");
  const dirPath = fragments.slice(0, fragments.length - 1).join("/");
  const fname = fragments[fragments.length - 1].replace(".md", ".html");
  const outPath = dirPath + "/" + fname;
  parser.renderPages().then((html) => {
    fs.writeFile(outPath, html, (err) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  });
}

function readFile(uri: vscode.Uri) {
  return fs.readFileSync(uri.path, "utf-8");
}

export function compileDir(uri: vscode.Uri) {
  const fragments = uri.path.split("/");
  const dirPath = fragments.slice(0, fragments.length - 1).join("/");
  const rpat = new vscode.RelativePattern(dirPath, "[0-9999].*.html");
  vscode.workspace.findFiles(rpat).then((fils) => {
    if (fils.length < 2) {
      return;
    }
    const files = fils.sort((a, b) => {
      const af = a.fsPath.split("/");
      const bf = b.fsPath.split("/");
      const afn = af[af.length - 1][0];
      const bfn = bf[bf.length - 1][0];
      return +afn - +bfn;
    });
    const contents = files.map(readFile);
    const final = contents.join("<br>");
    if (vscode.workspace.workspaceFolders !== undefined) {
      const wf = dirPath + "/final.bw";
      fs.writeFileSync(wf, final);
    }
  });
}

export function createHtmlBoilerPlate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>biteWord</title>
        </head>
        <body>
            <div id="toolbar">
            </div>
            ${content}
        </body>
    </html>`;
}
