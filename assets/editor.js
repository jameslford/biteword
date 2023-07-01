// @ts-check
// import html2canvas from "html2canvas";
// const html2canvas = require("html2canvas");
// import jsPDF from "jspdf";
// const jsPDF = require("jspdf");

(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();
  const page = document.getElementById("page");
  const toolbar = document.getElementById("toolbar");
  const printButton = document.getElementById("printButton");
  const refreshButton = document.getElementById("refreshButton");
  const errorContainer = document.createElement("div");
  document.body.appendChild(errorContainer);
  errorContainer.className = "error";
  errorContainer.style.display = "none";

  function updateContent(/** @type {string} */ text) {
    console.log("updateContent, text: ", text.slice(0, 100));
    page.innerHTML = text;
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    console.log("message received, event.data: ", event);
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        const text = message.text;
        updateContent(text);
        vscode.setState({ text });
        return;
    }
  });

  printButton.addEventListener("click", (event) => {
    html2canvas(page).then((canvas) => {
      var img = canvas.toDataURL("image/png");
      vscode.postMessage({
        type: "print",
        html: img,
      });
    });
    // print();
    // vscode.postMessage({
    //   type: "print",
    //   html: page?.outerHTML,
    // });
  });

  refreshButton.addEventListener("click", (event) => {
    vscode.postMessage({
      type: "change",
    });
  });

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
