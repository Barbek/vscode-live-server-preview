'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

export default class LiveServerContentProvider implements vscode.TextDocumentContentProvider {

    private _onDidChange: vscode.EventEmitter<vscode.Uri>;

    constructor() {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        const content = fs.readFileSync(uri.path);
        const styleAndScript = `<script src=\\"https:\\/\\/code.jquery.com\\/jquery-3.3.1.min.js\\" integrity=\\"sha256-FgpCb\\/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=\\" crossorigin=\\"anonymous\\"><\\/script>
            <link rel=\\"stylesheet\\" href=\\"https:\\/\\/maxcdn.bootstrapcdn.com\\/bootstrap\\/3.3.7\\/css\\/bootstrap.min.css\\" integrity=\\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz\\/K68vbdEjh4u\\" crossorigin=\\"anonymous\\">
            <script src=\\"https:\\/\\/maxcdn.bootstrapcdn.com\\/bootstrap\\/3.3.7\\/js\\/bootstrap.min.js\\" integrity=\\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\\" crossorigin=\\"anonymous\\"><\\/script>`;
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
                    iframedoc.head.innerHTML += \`${ styleAndScript }\`;
                </script>
            </html>
        `;
    }
}
