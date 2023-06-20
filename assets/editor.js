(function () {
  const vscode = acquireVsCodeApi();
  const page = document.getElementById("page");
  const toolbar = document.getElementById("toolbar");
  const errorContainer = document.createElement("div");
  document.body.appendChild(errorContainer);
  errorContainer.className = "error";
  errorContainer.style.display = "none";

  function updateContent(/** @type {string} */ text) {
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

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
