import * as vscode from 'vscode';
import { GroovyDocumentSymbolProvider } from './components/document-symbol-provider';
import { GroovyDefinitionProvider } from './components/definition-provider';
import { GroovyHoverProvider } from './components/hover-provider';


export function activate(context: vscode.ExtensionContext) {
    //! console.log('Congratulations, your extension "groovy-plugin" is now active!');
    const selector = { scheme: 'file', language: 'groovy' };
    context.subscriptions.push(...[
        vscode.languages.registerDocumentSymbolProvider(selector, new GroovyDocumentSymbolProvider()),
        vscode.languages.registerDefinitionProvider(selector, new GroovyDefinitionProvider()),
        vscode.languages.registerHoverProvider(selector, new GroovyHoverProvider())
    ]);
}

export function deactivate() {}
