import * as vscode from 'vscode';
import * as utils from '../lib/utility';


//
// --- utility functions ----------------------------------------
//


function createMarkdownString(

): vscode.MarkdownString {
    return new vscode.MarkdownString();
}


function createHoverObject(
    contents: vscode.MarkdownString
): vscode.Hover {
    return new vscode.Hover(contents);
}


function searchForFunction(
    document: vscode.TextDocument,
    word: string
): vscode.Hover | undefined {
    //* <type> <name> (<args>)
    const pattern: RegExp = new RegExp(`^(${utils.types.join('|')})\\s+${word}\\s*\\(.*\\)`);
    for (let i = 0; i < document.lineCount; i++) {
        const curr: string = document.lineAt(i).text;
        if (curr.match(pattern)) {
            const mdString: vscode.MarkdownString = createMarkdownString();
            // remove opening curly braces (if possible)
            mdString.appendCodeblock(curr.split('{')[0], 'groovy');
            return createHoverObject(mdString);
        }
    }
    return undefined;
}


function searchForField(
    document: vscode.TextDocument,
    word: string
): vscode.Hover | undefined {
    //* @groovy.transfrom.Field <type> <name>
    const pattern: RegExp = new RegExp(`^@groovy.transform.Field\\s+(${utils.types.join('|')})\\s+${word}`);
    for (let i = 0; i < document.lineCount; i++) {
        const curr: string = document.lineAt(i).text;
        if (curr.match(pattern)) {
            const mdString: vscode.MarkdownString = createMarkdownString();
            // remove semicolon (if possible)
            mdString.appendCodeblock(curr.split(';')[0], 'groovy');
            return createHoverObject(mdString);
        }
    }
    return undefined;
}


//
// --- main implementation ----------------------------------------
//


async function getHoverObject(
    document: vscode.TextDocument,
    line: string,
    word: string
): Promise<vscode.Hover | undefined> {
    // patterns for matching functions: '<name> (<args>)' and '.&<name>'
    const functionCallPattern: RegExp = new RegExp(`${word}\\s*\\(.*\\)`);
    const functionPassPattern: RegExp = new RegExp(`\\.&${word}`);
    if (line.match(functionCallPattern) || line.match(functionPassPattern)) {
        return searchForFunction(document, word);
    }

    // pattern for matching fields (assume all UPPERCASE)
    const fieldPattern: RegExp = new RegExp(`[A-Z_][A-Z0-9_]*`);
    if (word.match(fieldPattern)) {
        return searchForField(document, word);
    }

    //TODO add support for (local) variables

    return undefined;
}


//
// --- export ----------------------------------------
//


export class GroovyHoverProvider implements vscode.HoverProvider {
    public async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined>{
        //TODO add support for Groovy string interpolation

        const word: string | undefined = utils.getWord(document, position);
        // check whitespace since word could be entire document...
        if (word === undefined || word.includes(' ')) {
            return undefined;
        }

        const uris: vscode.Uri[] = await vscode.workspace.findFiles('**/*.{groovy,gvy}');
        const documents: vscode.TextDocument[] = await Promise.all(uris.map((uri: vscode.Uri) => vscode.workspace.openTextDocument(uri)));
        const hovers: Array<vscode.Hover | undefined> = await Promise.all(documents.map((doc: vscode.TextDocument) => getHoverObject(doc, document.lineAt(position.line).text, word)));
        const hover: vscode.Hover | undefined = hovers.find((hover: vscode.Hover |undefined) => hover !== undefined);

        return hover === undefined ? undefined : hover;
    }
}
