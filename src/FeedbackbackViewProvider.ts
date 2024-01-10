import * as vscode from 'vscode';
import { config } from './config';

export class FeedbackbackViewProvider implements vscode.WebviewViewProvider {

	// public static readonly viewType = 'calicoColors.colorsView';

	private _view?: vscode.WebviewView;
	private html: string = "";
	private cachedCSS: string;

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

	async getCSS(): Promise<string> {
		if (this.cachedCSS) {
			return this.cachedCSS;
		}
		let uri = `${config.endpoints.SimpleAIF.baseUrl}static/progress.css`;
		return fetch(uri).then((response) => {
			if (!response.ok) {
				return;
			}
			return response.text().then((text) => {
				this.cachedCSS = text;
				return text;
			});
		});
	}

	public setDivHTML(divHTML: string) {
		this._generateHTML(divHTML).then(html => {
			this.html = html;
			if (this._view) {
				this._view.webview.html = this.html;
				this._view.show(true);
			}
		});
	}

	private async _generateHTML(divContent: string) {
		return `<!DOCTYPE html>
		<html>
			<head>
			<title>AI-Generated Feedback for Your Code</title>
			<style>
				${await this.getCSS()}
			</style>
			</head>
			<body>
				<div>${divContent}</div>
			</body>
		</head>`;
		}
}
