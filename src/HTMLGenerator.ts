import { config } from "./config";


export function generateHTML(divContent: string) {
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