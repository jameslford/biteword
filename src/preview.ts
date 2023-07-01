import * as vscode from "vscode";
import { getNonce, getCurrentTheme } from "./utils";
import puppeteer from "puppeteer";
import { jsPDF } from "jspdf";

export class BiteWordPreviewProvider
  implements vscode.CustomTextEditorProvider
{
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new BiteWordPreviewProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      BiteWordPreviewProvider.viewType,
      provider,
      {
        webviewOptions: {
          enableFindWidget: true,
          retainContextWhenHidden: true,
        },
      }
    );
    return providerRegistration;
  }

  private static readonly viewType = "biteword.preview";
  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "assets"),
        vscode.Uri.joinPath(this.context.extensionUri, "node_modules"),
      ],
    };
    webviewPanel.webview.html = await this.getHtmlForWebview(
      webviewPanel.webview
    );

    function updateWebview() {
      const text = document.getText();
      console.log("updating webview in preview.ts");
      webviewPanel.webview
        .postMessage({
          type: "update",
          text: text,
        })
        .then((fulfilled) => {
          console.log("fulfilled :>> ", fulfilled);
        });
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        console.log("document changed", e);
        console.log("document :>> ", document);
        if (e.document.uri.toString() === document.uri.toString()) {
          console.log("matching document changed, updating webview");
          // TODO the editor is not receiving the message from updateWebview when called here
          updateWebview();
        }
      }
    );

    const openDocument = vscode.workspace.onDidOpenTextDocument((e) => {
      console.log("document opened", e, document);
      if (e.uri.toString() === document.uri.toString()) {
        updateWebview();
      }
    });

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      console.log("disposing webview");
      changeDocumentSubscription.dispose();
      openDocument.dispose();
    });

    // const print = async (e) => {
    //   // const html = this.getHtmlForWebview(webviewPanel.webview);
    //   const browser = await puppeteer.launch();
    //   const page = await browser.newPage();
    //   const content = this.getHtmlForPrint(webviewPanel.webview, e.html);
    //   await page.setContent(content);
    //   await page.pdf({
    //     path: "/home/jford/projects/extension-biteword/test.pdf",
    //     format: "A4",
    //     printBackground: true,
    //   });
    //   browser.close();
    // };

    const print = async (e) => {
      // vscode.commands.executeCommand("workbench.action.webview.print");
      const img = e.html;
      var doc = new jsPDF();
      doc.addImage(img, "JPEG", 0, 0);
      doc.save("/home/jford/projects/extension-biteword/dom-test.pdf");
    };

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage((e) => {
      console.log("received message", e);
      switch (e.type) {
        case "change":
          updateWebview();
        case "print":
          console.log("printing", e);
          print(e);
      }
    });
    updateWebview();
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "editor.js")
    );
    const html2c = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "node_modules",
        "html2canvas",
        "dist",
        "html2canvas.min.js"
      )
    );
    const jsPdfUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "node_modules",
        "jspdf",
        "dist",
        "jspdf.umd.js"
      )
    );
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "editor.css")
    );
    const toolkitUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "node_modules",
        "@vscode",
        "webview-ui-toolkit",
        "dist",
        "toolkit.js"
      )
    );
    // Use a nonce to whitelist which scripts can be run
    // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    const nonce = getNonce();
    const theme = getCurrentTheme();
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
          <script type="module" nonce="${nonce}" src="${toolkitUri}"></script>
          -->
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleResetUri}" rel="stylesheet" />
          <link href="${styleVSCodeUri}" rel="stylesheet" />
          <link href="${styleMainUri}" rel="stylesheet" />
          <script nonce="${nonce}" src="${html2c}"></script>
          <script nonce="${nonce}" src="${jsPdfUri}"></script>
          <title>biteWord</title>
          <style>
          ${theme.style()}
          </style>
        </head>
        <body>
          <div id="toolbar">
          <button id="printButton">Print</button>
          <button id="refreshButton">Refresh</button>
          </div>
          <div id="page"></div>
              <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>`;
  }

  private getHtmlForPrint(webview: vscode.Webview, html: string): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "editor.js")
    );
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "assets", "editor.css")
    );
    const toolkitUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "node_modules",
        "@vscode",
        "webview-ui-toolkit",
        "dist",
        "toolkit.js"
      )
    );
    // Use a nonce to whitelist which scripts can be run
    // <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    const nonce = getNonce();
    const theme = getCurrentTheme();
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <!--
          Use a content security policy to only allow loading images from https or from our extension directory,
          and only allow scripts that have a specific nonce.
          <script type="module" nonce="${nonce}" src="${toolkitUri}"></script>
          -->
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleResetUri}" rel="stylesheet" />
          <link href="${styleVSCodeUri}" rel="stylesheet" />
          <link href="${styleMainUri}" rel="stylesheet" />
          <title>biteWord</title>
          <style>
          ${theme.style()}
          </style>
        </head>
        <body>
              <script nonce="${nonce}" src="${scriptUri}"></script>
              ${html}
        </body>
      </html>`;
  }

  /**
   * Write out the json to a given document.
   */
  // private updateTextDocument(document: vscode.TextDocument, text: any) {
  //   const edit = new vscode.WorkspaceEdit();
  //   edit.replace(
  //     document.uri,
  //     new vscode.Range(0, 0, document.lineCount, 0),
  //     text
  //   );
  //   return vscode.workspace.applyEdit(edit);
  // }
}
