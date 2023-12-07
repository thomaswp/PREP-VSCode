import * as vscode from 'vscode';

export type TestResult = {
	name: string,
	score: number,
	max_score: number,
	status: "passed" | "failed" | "error",
	number: string,
	output?: string,
	tags?: string[],
	visibility?: "after_published" | "visible" | "hidden",
};

export type TestRunResults = {
	tests: TestResult[],
	execution_time: number,
    score: number,
};


export class AutograderViewProvider implements vscode.WebviewViewProvider {

	// public static readonly viewType = 'calicoColors.colorsView';

	private _view?: vscode.WebviewView;
	private html: string = "";

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		console.log("resolveWebviewView");
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: false,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this.html;

		webviewView.show(true);
	}

	public setTestCaseResults(results: TestRunResults) {
		let tests = results.tests.sort((a, b) => {
			return parseInt(a.number) - parseInt(b.number);
		}).filter ((test) => {
			return test.visibility !== "hidden" && test.visibility !== "after_published";
		});
		let testHTML = tests.map((test) => {
			return this._generateTestHTML(test);
		}).join("");
		this.html = this._generateHTML(testHTML);
		if (this._view) {
			this._view.webview.html = this.html;
			this._view.show(true);
		}
	}

	private _generateTestHTML(test: TestResult) {
		return `
			<tr><td>${test.name}</td><td>${test.status === "passed" ? "✓" : "✗"}</td></tr>
		`;
	}

	private _generateHTML(divContent: string) {
		return `<!DOCTYPE html>
		<html>
			<head>
			<title>Test Case Feedback on Your Code</title>
			</head>
			<table>
				<th>Test Case</th><th>Result</th>
				${divContent}
			</table>
		</head>`;
		}
}
