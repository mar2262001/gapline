'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('gapline', () => {
		var editor = vscode.window.activeTextEditor;
		if (!editor) { return; }
		var selection = editor.selection;
		var text = editor.document.getText(selection);

		vscode.window.showInputBox({ prompt: 'Lineas?' }).then(value => {
			let numberOfLines = +value;
			var textInChunks: Array<string> = [];
			text.split('\n').forEach((currentLine: string, lineIndex) => {
				textInChunks.push(currentLine);
				if ((lineIndex + 1) % numberOfLines === 0) { textInChunks.push(''); }
			});
			text = textInChunks.join('\n');
			editor.edit((editBuilder) => {
				var range = new vscode.Range(
					selection.start.line, 0,
					selection.end.line,
					editor.document.lineAt(selection.end.line).text.length
				);
				editBuilder.replace(range, text);
			});
		});
	});
	context.subscriptions.push(disposable);
}

export function deactivate() { }
