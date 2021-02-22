import * as vscode from 'vscode';
import * as lib from './lib';


export function activate(context: vscode.ExtensionContext) {
	// console.log('Congratulations, your extension "groovy" is now active!');

    //* definition finder
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(
        'groovy',
        new lib.DefinitionProvider()
    ));
}

export function deactivate() {}
