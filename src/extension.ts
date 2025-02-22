import * as vscode from "vscode";
import { createHtmlFileFromMarkdown, compileDir } from "./utils";
import { BiteWordPreviewProvider } from "./preview";

export function activate(context: vscode.ExtensionContext) {
  const provider = BiteWordPreviewProvider.register(context);
  context.subscriptions.push();
  vscode.workspace.onDidSaveTextDocument((e) => {
    const regex = /^[0-999].*.md$/gm;
    const fragments = e.fileName.split("/");
    const fname = fragments[fragments.length - 1];
    if (fname.match(regex)) {
      createHtmlFileFromMarkdown(e.uri, context).then(() => {
        compileDir(e.uri);
      });
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
