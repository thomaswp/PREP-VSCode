import * as vscode from 'vscode';
import { config } from './config';

export class FeedbackbackViewProvider implements vscode.WebviewViewProvider {

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

	public setDivHTML(divHTML: string) {
		this.html = this._generateHTML(divHTML);
		if (this._view) {
			this._view.webview.html = this.html;
			this._view.show(true);
		}
	}

	private _generateHTML(divContent: string) {
		return `<!DOCTYPE html>
		<html>
			<head>
			<title>AI-Generated Feedback for Your Code</title>
			<link href="${config.endpoints.SimpleAIF.baseUrl}static/progress.css"  rel="stylesheet">
			</head>
			<body>
				<div>${divContent}</div>
			</body>
		</head>`;
		}
}
