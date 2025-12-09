import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const provider = new JeevesViewProvider(context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider("jeevesView", provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("jeeves.askAboutSelection", async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection.trim()) return;

            const prompt = `Please review this code:\n\n${selection}`;
            const reply = await askJeeves(prompt);

            provider.postMessage({
                type: "response",
                text: reply
            });

            vscode.window.showInformationMessage("Jeeves replied in the sidebar.");
        })
    );
}

class JeevesViewProvider implements vscode.WebviewViewProvider {
    private view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
            ]
        };

        const fs = require('fs');
        const html = fs.readFileSync(
            path.join(this.context.extensionPath, 'media', 'index.html'),
            'utf8'
        );

        const scriptUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'webview.js')
        );

        const styleUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'webview.css')
        );

        const finalHtml = html
            .replace(/{{scriptUri}}/g, scriptUri.toString())
            .replace(/{{styleUri}}/g, styleUri.toString());

        webviewView.webview.html = finalHtml;

        webviewView.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === "ask") {
                const reply = await askJeeves(msg.text);
                webviewView.webview.postMessage({ type: "response", text: reply });
            }
        });
    }

    postMessage(msg: any) {
        this.view?.webview.postMessage(msg);
    }
}

async function askJeeves(prompt: string): Promise<string> {
    try {
        const config = vscode.workspace.getConfiguration("jeeves");
        const serverUrl = config.get<string>("serverUrl", "http://localhost:8140/ask");
        const temperature = config.get<number>("temperature", 0.7);

        const response = await fetch(serverUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, temperature })
        });

        if (!response.ok) {
            return `Server error (${response.status})`;
        }

        const data = (await response.json()) as { reply?: string };
        return data.reply ?? JSON.stringify(data);
    } catch (err: any) {
        return `Request failed: ${String(err)}`;
    }
}
