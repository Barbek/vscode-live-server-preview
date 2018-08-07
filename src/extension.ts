'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let panel;
let configuration;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let disposablePreview = vscode.commands.registerTextEditorCommand('extension.livePreview.open', livePreview);
    context.subscriptions.push(disposablePreview);

    vscode.workspace.onDidSaveTextDocument((document) => {
        panel.webview.html = createWebviewContent(document.getText());
    });

    configuration = vscode.workspace.getConfiguration("livepreview");
}

function livePreview(textEditor: vscode.TextEditor) {

    if (!isEditingHTML(textEditor.document)) {
        vscode.window.showErrorMessage('Live Preview can preview only HTML files');
        return;
    }

    panel = vscode.window.createWebviewPanel('livePreview', "Preview", vscode.ViewColumn.Two, { enableScripts: true });
    const documentContent = textEditor.document.getText();
    panel.webview.html = createWebviewContent(documentContent);
}

function isEditingHTML(document: vscode.TextDocument) {
    return document.languageId.toLowerCase() == 'html';
}

// this method is called when your extension is deactivated
export function deactivate() {}

function createWebviewContent(content) {
    let styleAndScriptTags = "";
    configuration.scriptCdns.forEach(cdn => {
        styleAndScriptTags += buildScriptTag(cdn);
    });
    configuration.styleCdns.forEach(cdn => {
        styleAndScriptTags += buildStyleTag(cdn);
    });
    return `
        <html>
            <header>
                <style>
                    body, html, div {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        background-color: #fff;
                    }
                </style>
            </header>
            <body>
                <div>
                    <iframe id="contentFrame" width="100%" height="100%" seamless frameborder=0>
                    </iframe>
                </div>
            </body>
            <script>
                var iframe = document.getElementById('contentFrame'),
                iframedoc = iframe.contentDocument || iframe.contentWindow.document;
                iframedoc.body.innerHTML = \`${ content }\`;
                iframedoc.head.innerHTML += \`${ styleAndScriptTags }\`;
            </script>
        </html>
    `;
}

function buildScriptTag(cdnUrl) {
    return `<script src=\\"${cdnUrl}\\" crossorigin=\\"anonymous\\"><\\/script>`
}

function buildStyleTag(cdnUrl) {
    return `<link rel=\\"stylesheet\\" href=\\"${cdnUrl}\\" crossorigin=\\"anonymous\\">`
}
