import * as vscode from 'vscode';
import * as utils from '../lib/utility';


//
// --- utility functions ----------------------------------------
//


function createPosition(
    line: number,
    character: number
): vscode.Position {
    return new vscode.Position(line, character);
}


function createDefinition(
    uri: vscode.Uri,
    range: vscode.Position
): vscode.Definition {
    return new vscode.Location(uri, range);
}


//
// --- main implementation ----------------------------------------
//


async function getDefinition(
    document: vscode.TextDocument,
    word: string
): Promise<vscode.Definition | undefined> {
    // search for declaration containing word inside the document
    //* <type> <name>
    const pattern: RegExp = new RegExp(`(${utils.types.join('|')})\\s+${word}`);
    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
        const line: string = document.lineAt(lineNumber).text;
        if (line.match(pattern)) {
            return createDefinition(document.uri, createPosition(lineNumber, line.indexOf(word)));
        }
    }

    return undefined;
}


//
// --- export ----------------------------------------
//


export class GroovyDefinitionProvider implements vscode.DefinitionProvider {
    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Definition | undefined> {
        //* limitations: returns the first occurrence of a matching declaration (i.e. doesn't care about type)
        const word: string | undefined = utils.getWord(document, position);
        if (word === undefined) {
            return undefined;
        }

        const uris: vscode.Uri[] = await vscode.workspace.findFiles('**/*.{groovy,gvy}');
        const documents: vscode.TextDocument[] = await Promise.all(uris.map((uri: vscode.Uri) => vscode.workspace.openTextDocument(uri)));
        const locations: Array<vscode.Definition | undefined> = await Promise.all(documents.map((doc: vscode.TextDocument) => getDefinition(doc, word)));
        const location: vscode.Definition | undefined = locations.find((location: vscode.Definition | undefined) => location !== undefined);

        return location === undefined ? undefined : location;
    }
}
