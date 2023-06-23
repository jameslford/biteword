import * as vscode from "vscode";
import * as fs from "fs";
import { Parser, Theme } from "./models";
import { DEFAULT_CONFIG, PAGE_SIZES } from "./enums";

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

export function safeWriteFile(path: string, data: string) {
  try {
    fs.writeFileSync(path, data);
  } catch (err) {
    console.error(err);
  }
}

export async function createHtmlFileFromMarkdown(
  uri: vscode.Uri,
  context: vscode.ExtensionContext
) {
  const mdText = fs.readFileSync(uri.path, "utf-8");
  const theme = getCurrentTheme();
  const parser = new Parser(mdText, theme, context);
  const fragments = uri.path.split("/");
  const dirPath = fragments.slice(0, fragments.length - 1).join("/");
  const fname = fragments[fragments.length - 1].replace(".md", ".bw");
  const outPath = dirPath + "/" + fname;
  return parser.renderPages().then((html) => {
    safeWriteFile(outPath, html);
    return true;
  });
}

function readFile(uri: vscode.Uri) {
  return fs.readFileSync(uri.path, "utf-8");
}

export async function compileDir(uri: vscode.Uri) {
  const fragments = uri.path.split("/");
  const dirPath = fragments.slice(0, fragments.length - 1).join("/");
  const rpat = new vscode.RelativePattern(dirPath, "[0-9999].*.bw");
  return vscode.workspace.findFiles(rpat).then((fils) => {
    if (fils.length === 0) {
      console.log("no files found");
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
      vscode.workspace.fs.writeFile(uri.with({ path: wf }), Buffer.from(final));
    }
    return final;
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
