import * as vscode from "vscode";

export const updateUserSettings = () => {
  const config = vscode.workspace.getConfiguration();
  let fileAssociations = config.get<Object>("files.associations");
  fileAssociations = fileAssociations || {};
  console.log(fileAssociations);
  const bdAssoc = { "*.bd": "markdown" };
  fileAssociations = { ...fileAssociations, ...bdAssoc };
  config.update(
    "files.associations",
    fileAssociations,
    vscode.ConfigurationTarget.Global
  );
};
