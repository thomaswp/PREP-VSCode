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
		// console.log("resolveWebviewView");
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
		let name = test.number !== undefined ? `Test ${test.number}` : test.name;
		let output = `
			<tr><td>${name}</td><td>${test.status === "passed" ? "✓" : "✗"}</td></tr>
		`;
		if (test.status !== "passed" && test.output) {
			output += `<tr><td colspan="2"><pre>${test.output}</pre></td></tr>`;
		}
		return output;
	}

	private _generateHTML(divContent: string) {
		return `<!DOCTYPE html>
		<html>
			<head>
			<title>Test Case Feedback on Your Code</title>
			<style>
				table {
					font-family: arial, sans-serif;
					border-collapse: collapse;
					width: 100%;
				}
				td, th {
					border: 1px solid;
					text-align: left;
					padding: 4px;
				}
				pre {
					white-space: pre-wrap;
					margin: 3px;
				}
			</style>
			</head>
			<body>
			<table>
				<th>Test Case</th><th>Result</th>
				${divContent}
			</table>
			<div>
			<p>
			This window displays feedback from your class autograder, similar
			to if you submitted on Gradescope.
			</p>
			</div>
			</body>
		</head>`;
		}
}
