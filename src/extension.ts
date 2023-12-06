// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ActionHandler } from './ActionHandler';
import { EventHandler } from './EventHandler';
import { StateTracker } from './State';
import { generateHTML } from './HTMLGenerator';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cerpent" is now active!');

	const actionHandler = new ActionHandler();
    const eventHandler = new EventHandler(actionHandler);
    const stateTracker = new StateTracker();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cerpent.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from cerpent!');

		fetch('https://isnap.csc.ncsu.edu:5500/')
		.then(response => response.text())
		.then(message => vscode.window.showInformationMessage(message));
	});

	context.subscriptions.push(disposable);

	const panel = vscode.window.createWebviewPanel(
		'webviewSample', // Identifies the type of the webview. Used internally
		'Webview Sample', // Title of the panel displayed to the user
		{ preserveFocus: true, viewColumn: vscode.ViewColumn.Two },
		{
			enableScripts: false,
		}
	);
	actionHandler.registerAction("ShowDiv", (data) => {
        panel.webview.html = generateHTML(data.html);
    });

	let textChange = vscode.workspace.onDidChangeTextDocument((event) => {
        // Check if the document is a text document
        if (event.document.languageId === 'plaintext' || event.document.languageId === 'python') {
			const state = stateTracker.getState(event.document.getText());
			eventHandler.handleEvent("File.Edit", state);
		}
    });
	context.subscriptions.push(textChange);

}

// This method is called when your extension is deactivated
export function deactivate() {}
