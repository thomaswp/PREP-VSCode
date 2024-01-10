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
		let statusIcon = test.status === "passed" ? "✓" : "✗";
		let statusClass = test.status === "passed" ? "passed" : "failed";
		let output = `
			<tr>
				<td>${name}</td>
				<td class="test-status ${statusClass}">${statusIcon}</td>
			</tr>
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
				body {
					font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
					margin: 0;
					padding: 0;
					background-color: #f3f3f3; /* Light background */
					color: #333; /* Darker text */
				}
				table {
					font-family: 'Courier New', Courier, monospace;
					border-collapse: collapse;
					width: 100%;
					margin-top: 20px;
					background-color: #fff; /* White background */
				}
				th {
					background-color: #4CAF50; /* Light green */
					color: white;
					text-align: center;
				}
				td, th {
					border: 1px solid #ddd; /* Lighter border color */
					padding: 4px;
				}
				tr:nth-child(even) {
					background-color: #f2f2f2; /* Slightly darker for alternate rows */
				}
				tr:hover {
					background-color: #ddd; 
					cursor: pointer;
				}
				.passed {
					color: green;
					font-weight: bold;
				}
				.failed {
					color: red; 
					font-weight: bold;
				}
				.info-text {
					margin: 16px;
					padding: 8px;
					background-color: #eef2f5; 
					border-left: 4px solid #2196F3; 
					font-size: 0.9em; 
					line-height: 1.4; 
					color: #5a5a5a; 
				}
				pre {
					white-space: pre-wrap;
					background-color: #f7f7f7; /* Slightly grey  */
					border: 1px solid #ccc;
					padding: 2px;
					font-size: 1em;
					border-radius: 4px;
					color: #333; /* Dark text inside pre */
				}

				/* Responsive font sizes */
				body, table, th, td {
					font-size: 0.95em; /* Adjust as needed */
				}
				.scrollable-table {
					overflow-y: auto;
					height: 100%; 
				}
			</style>
			</head>
			<body>
			<div class="scrollable-table">
				<table>
					<thead>
						<tr>
							<th>Test Case</th>
							<th>Result</th>
						</tr>
					</thead>
					<tbody>
						${divContent}
					</tbody>
				</table>
			</div>
			<div>
			<p class="info-text">
			This window displays feedback from your class autograder, similar
			to if you submitted on Gradescope.
			</p>
			</div>
			</body>
		</head>`;
		}
}
