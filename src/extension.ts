import * as vscode from 'vscode';
import * as lib from './lib';


export function activate(context: vscode.ExtensionContext) {
	// console.log('Congratulations, your extension "groovy" is now active!');

    //* definition finder
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(
        'groovy',
        new lib.DefinitionProvider()
    ));

    //* document symbols
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        'groovy',
        new lib.DocumentSymbolProvider()
    ));
}

export function deactivate() {}
