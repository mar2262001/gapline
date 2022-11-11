'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    let disposable = vscode.commands.registerCommand('gapline', () => {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        var selection = editor.selection;
        var text = editor.document.getText(selection);
        vscode.window.showInputBox({ prompt: 'Lineas?' }).then(value => {
            let numberOfLines = +value;
            var textInChunks = [];
            text.split('\n').forEach((currentLine, lineIndex) => {
                textInChunks.push(currentLine);
                if ((lineIndex + 1) % numberOfLines === 0) {
                    textInChunks.push('');
                }
            });
            text = textInChunks.join('\n');
            editor.edit((editBuilder) => {
                var range = new vscode.Range(selection.start.line, 0, selection.end.line, editor.document.lineAt(selection.end.line).text.length);
                editBuilder.replace(range, text);
            });
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map