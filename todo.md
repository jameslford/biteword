- add support for paragraph indentation
- map header levels to font size and calculate text height in extension
- create seperate parser class for each type of element
  - can eventually get away from using puppeteer at all
  - can take move compute intensive tasks to a rust/wasm module
- change file type from '1.blah.md` to 1.bd (only use extension on bd files)
- remove multi file compilation from save. add a button/command to compile all files
- compile bd file to bw file, which is html and viewable as webview
- force association of .bd files with markdown for vscode's purposes
- look into pre-packing with electron/chromium
- make TextElement class more recursive (looking for html elements within the text element)
- look into prompts / text completion with chatgpt or something similar
- add support for links - internal and external
- add support for bold, italics, underline, strikethrough
- add support for lists
- add support for tables
- add support for code blocks
- add support for images