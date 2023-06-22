import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { TextElement, Theme } from "../../models";
// import * as myExtension from '../../extension';

const testString1 =
  "This is a sign of how rough the outlook sometimes seems for our culture of reading and writing. In fact, every generation fears the death of literacy at the hands of some new media technology. And yet I’m here to share some optimism. After long existence as a confirmed cynic who shared the general belief in our imminent cultural doom, I felt an unfamiliar sensation 15 years ago when the Internet came over the horizon: I found myself becoming excited and hopeful. When I looked at the Internet I saw a medium that involves a huge amount of reading. Sure, a lot of it is presented in a highly decorated or distracting form. But a lot of it is in large blocks of uninterrupted text, too! And there’s something even more significant: The Web isn’t just inspiring a lot of reading. it has also opened the opportunity for a stunning amount of new writing. When I was growing up in the 1960s and 70s, the chief fear on behalf of literary culture was that ;;";

const testString2 =
  "Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation Xenotransplantation";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test("Test splitText", () => {
    const theme = new Theme();
    const textElement1 = new TextElement(
      theme,
      testString1,
      "P",
      "<p>" + testString1 + "</p>"
    );
    const text1height = textElement1.height;
    const text1Ok = text1height > 196 && text1height < 200;
    assert.strictEqual(text1Ok, true);
    const textElement2 = new TextElement(
      theme,
      testString2,
      "P",
      "<p>" + testString2 + "</p>"
    );
    const text2height = textElement2.height;
    const text2Ok = text2height > 214 && text2height < 218;
    assert.strictEqual(text2Ok, true);
  });
});
