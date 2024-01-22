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

export class UnityIDWarning {
	private showing: boolean = false;

	setShowingAndGetHTML(showing: boolean) : string {
		if (this.showing === showing) {
			return null;
		}
		this.showing = showing;
		return this.getMessage(showing);
	}

	registerWebview(webview: vscode.Webview) {
		webview.onDidReceiveMessage((data) => {
			if (data.command === "setSubjectID") {
				vscode.commands.executeCommand("cerpent.setSubjectID");
			}
		});
	}

	private getMessage(showing: boolean) {
		if (showing)  {
			return `
			<html>
			<body>
			<script>
			const vscode = acquireVsCodeApi();
			function setSubjectID() {
				vscode.postMessage({
					command: 'setSubjectID',
				});
			}
			</script>
			A UnityID is required to received feedback.
			<button onclick="setSubjectID()">Enter your UnityID</button>
			</body>
			</html>
			`;
		} else {
			return "UnityID accepted!";
		}
	}

}

export class AutograderViewProvider implements vscode.WebviewViewProvider {

	// public static readonly viewType = 'calicoColors.colorsView';

	private _view?: vscode.WebviewView;
	public get view() { return this._view; }
	private html: string = "";
	private unityIDWarning = new UnityIDWarning();

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
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this.html;
		this.unityIDWarning.registerWebview(webviewView.webview);

		webviewView.show(true);
	}

	public setUnityIDWarning(isWarning: boolean) {
		let html = this.unityIDWarning.setShowingAndGetHTML(isWarning);
		console.log(isWarning, html);
		if (html !== null) {
			this.setHTML(html);
		}
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
		this.setHTML(this._generateHTML(testHTML));
	}

	private setHTML(html: string) {
		this.html = html;
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
		const themeKind = vscode.window.activeColorTheme.kind;
		const isLightTheme = themeKind === vscode.ColorThemeKind.Light || themeKind === vscode.ColorThemeKind.HighContrastLight;
		const mainFontColor = isLightTheme ? "#333" : "#d4d4d4";
		const thBackgroundColor = isLightTheme ? "#4CAF50" : "#007acc";
		const tableBorderColor = isLightTheme ? "#ddd" : "#3c3c3c";
		const tableBackgroundColor = isLightTheme ? "#fff" : "#2d2d2d";
		const passedColor = isLightTheme ? "green" : "#89d185";
		const failedColor = isLightTheme ? "red" : "#f48771";
		const infoTextBackgroundColor = isLightTheme ? "#eef2f5" : "#2d2d2d";
		const infoTextColor = isLightTheme ? "#5a5a5a" : "#d4d4d4";
		const reasonLeftBorderColor = isLightTheme ? "#f4c136" : "#f4c836";
		const reasonColor = mainFontColor;
		const style = 
			`
			body {
				font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
				margin: 0;
				padding: 0;
				color: ${mainFontColor};
			}
			table {
				border-collapse: collapse;
				width: 100%;
				margin-top: 5px;
			}
			th {
				background-color: ${thBackgroundColor};
				color: white;
				text-align: center;
			}
			td, th {
				border: 1px solid ${tableBorderColor}; 
				padding: 4px;
			}
			tr:nth-child(odd) {
				background-color: ${tableBackgroundColor};
			}
			tr:hover {
				background-color: ${tableBorderColor}; 
				cursor: pointer;
			}
			.passed {
				color: ${passedColor};
				font-weight: bold;
			}
			.failed {
				color: ${failedColor}; 
				font-weight: bold;
			}
			.info-text {
				margin: 16px;
				padding: 8px;
				background-color: ${infoTextBackgroundColor}; 
				border-left: 4px solid #2196F3; 
				font-size: 0.9em; 
				line-height: 1.4; 
				color: ${infoTextColor}; 
			}
			pre {
				white-space: pre-wrap;
				font-size: 0.9em;				
				font-family: 'Consolas', 'Monaco', 'Courier New', monospace; 
				border-left: 3px solid ${reasonLeftBorderColor}; 
				padding: 0px 4px; 
				margin: 0px 0; 
				border-radius: 2px; 
				color: ${reasonColor}; 
			}

			/* Responsive font sizes */
			body, table, th, td {
				font-size: 0.95em; /* Adjust as needed */
			}
			.scrollable-table {
				overflow-y: auto;
				height: 100%; 
			}
			`;
		return `<!DOCTYPE html>
		<html>
			<head>
			<title>Test Case Feedback on Your Code</title>
			<style>
				${style}
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
