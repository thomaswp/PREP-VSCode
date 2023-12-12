// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ActionHandler } from './ActionHandler';
import { EventHandler } from './EventHandler';
import { State, StateTracker } from './State';
import { stat } from 'fs';
import { FeedbackbackViewProvider } from './FeedbackbackViewProvider';
import { AutograderViewProvider, TestResult } from './AutograderViewProvider';
import path from 'path';

const extensionName = "cerpent";
const subjectIDField = "logging.subjectID";
const configSection = "CERPENT";
const problemPrefix = "# Problem:";

const MIN_EDIT_TIME = 100;

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

	const feedbackProvider = new FeedbackbackViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("feedback", feedbackProvider));

	actionHandler.registerAction("ShowDiv", (data) => {
        feedbackProvider.setDivHTML(data.html);
    });

	const autograderProvider = new AutograderViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("autograder", autograderProvider));

	actionHandler.registerAction("ShowTestCaseFeedback", (data) => {
		console.log(data);
		autograderProvider.setTestCaseResults(data);
		let tests = data.tests as TestResult[];
		let num = tests.map((test) => {
			return test.score ? test.score : 0;
		}).reduce((a, b) => {
			return a + b;
		});
		let denom = tests.map((test) => {
			return test.max_score ? test.max_score : 0;
		}).reduce((a, b) => {
			return a + b;
		});
		let score = denom === 0 ? 0 : num / denom;

		lastState.score = score;
		console.log("Submitting with score", score, lastState);
		eventHandler.handleEvent("Submit", lastState);
	});

	let lastState = null;

	function getState(document: vscode.TextDocument): State {
		let text = document.getText();
		const state = stateTracker.getState(text);
		const firstLine = text.split("\n")[0];
		if (firstLine.trim().startsWith("# Problem:")) {
			state.ProblemID = firstLine.trim().replace(problemPrefix, "").trim();
		}
		state.SubjectID = vscode.workspace.getConfiguration(extensionName)?.get(subjectIDField);
		let filename = document.fileName;
		let workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		let relativePath;
		if (workspaceFolder) {
			relativePath = filename.substring(workspaceFolder.uri.fsPath.length + 1);
		} else {
			// Get the filename only with no folder path
			relativePath = filename.substring(filename.lastIndexOf(path.sep) + 1);
		}
		state.CodeStateSelection = relativePath;
		return state;
	}

	function shouldRaiseEventForDocument(document: vscode.TextDocument): boolean {
		return document.languageId === 'plaintext' || document.languageId === 'python';
	}

	let lastEditTime = 0;
	let textChange = vscode.workspace.onDidChangeTextDocument((event) => {
		let editTime = new Date().getTime();
		if (editTime - lastEditTime < MIN_EDIT_TIME) {
			return;
		}
        // Check if the document is a text document
		if (!shouldRaiseEventForDocument(event.document)) {
			return;
		}

		lastEditTime = editTime;
		let state = getState(event.document);
		lastState = state;
		console.log(state.SubjectID, state.ProblemID, state.CodeStateSelection);
		eventHandler.handleEvent("File.Edit", state);
    });
	context.subscriptions.push(textChange);

	let debugWatcher = vscode.debug.onDidStartDebugSession(event => {
		if (lastState === null) {
			return;
		}
		const configuration = event.configuration;
		// TODO: Don't restrict language
		if (configuration.type === 'python') {
			eventHandler.handleEvent("RequestScore", lastState);
		}
	});

	context.subscriptions.push(debugWatcher);

	let saveWatcher = vscode.workspace.onDidSaveTextDocument(document => {
		if (!shouldRaiseEventForDocument(document)) {
			return;
		}

		let state = getState(document);
		lastState = state;
		console.log(state.SubjectID, state.ProblemID, state.CodeStateSelection);
		eventHandler.handleEvent("RequestScore", state);
	});

	context.subscriptions.push(saveWatcher);

}

// This method is called when your extension is deactivated
export function deactivate() {}
