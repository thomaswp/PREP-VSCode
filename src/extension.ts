// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ActionHandler } from './ActionHandler';
import { EventHandler } from './EventHandler';
import { StateTracker } from './State';
import { generateHTML } from './HTMLGenerator';
import { stat } from 'fs';

const extensionName = "cerpent";
const subjectIDField = "logging.subjectID";
const configSection = "CERPENT";
const problemPrefix = "# Problem:";

// TODO: Get this from some course-specific configuration
const subjectIDRegex = /^[a-zA-Z]{2,}[0-9]*$/;
const emailRegex = /^[a-zA-Z]{2,}[0-9]*@ncsu.edu$/;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cerpent" is now active!');

	const actionHandler = new ActionHandler();
    const eventHandler = new EventHandler(actionHandler);
    const stateTracker = new StateTracker();

	const config = vscode.workspace.getConfiguration(extensionName);

	function getSubjectID() {
		vscode.window.showInputBox({
			placeHolder: "Enter your UnityID",
			prompt: "Enter your subject ID",
			validateInput: (subjectID) => {
				if (subjectID === undefined || subjectID === "") {
					return "UnityID is required";
				} else if (!subjectIDRegex.test(subjectID)) {
					return "Invalid UnityID (your NCSU email without @ncsu.edu)";
				} else {
					return null;
				}
			},
			ignoreFocusOut: true,
		}).then((subjectID) => {
			if (subjectID !== undefined && subjectIDRegex.test(subjectID)) {
				stateTracker.subjectID = subjectID;
				config.update(subjectIDField, subjectID, vscode.ConfigurationTarget.Global);
			} else {
				vscode.window.showErrorMessage("UnityID is required to received feedback.");
			}
		});
	}

	stateTracker.subjectID = config.get(subjectIDField);
	console.log(stateTracker.subjectID);
	if (!stateTracker.subjectID || !subjectIDRegex.test(stateTracker.subjectID)) {
		getSubjectID();
	}

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

	// TODO: Don't show in control condition / if there's no showDiv
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
			let text = event.document.getText();
			const state = stateTracker.getState(text);
			const firstLine = text.split("\n")[0];
			if (firstLine.trim().startsWith("# Problem:")) {
				state.ProblemID = firstLine.trim().replace(problemPrefix, "").trim();
			}
			state.SubjectID = vscode.workspace.getConfiguration(extensionName).get(subjectIDField);
			console.log(state.SubjectID, event.document.fileName);
			eventHandler.handleEvent("File.Edit", state);
		}
    });
	context.subscriptions.push(textChange);

}

// This method is called when your extension is deactivated
export function deactivate() {}
