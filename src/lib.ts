import * as vscode from 'vscode';


export class DefinitionProvider implements vscode.DefinitionProvider {

    private async getLocation(
        name: string,
        document: vscode.TextDocument
    ): Promise<vscode.Location | null> {
        //* 1 === lf and 2 === crlf
        const eol = 1 === document.eol ? '\n' : '\r\n';
        const loc = document.getText().split(eol);
        //* you can add more breadth by adding more options
        //* i.e. /(def|public|boolean)+ ... /i
        const pattern: RegExp = new RegExp(`def\\s+${name}\\s*\\(.*\\)`);

        let row: number = -1;
        let col: number = -1;

        loc.every((line, index) => {
            if (pattern.test(line) && -1 !== (col = line.indexOf(name))) {
                row = index;
                return false;
            }
            return true;
        });

        return -1 === row ? null : new vscode.Location(document.uri, new vscode.Position(row, col));
    }

    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Location | null> {
        //* set target definition
        const definition = document.getText(document.getWordRangeAtPosition(position));

        //* set list of (groovy) files to traverse through in workspace
        const files = await vscode.workspace.findFiles('**/*.{groovy,gvy}');

        //* convert `uri[]` -> `textdocument[]`
        const documents = await Promise.all(files.map(uri => vscode.workspace.openTextDocument(uri)));

        //* find definition
        //TODO: use `race` instead of `all` to use stop search after finding definition
        //TODO: caveat is that short files will trigger race... so need some sort of way to stop
        //TODO: the short file searches from ending
        const locations = await Promise.all(documents.map(doc => this.getLocation(definition, doc)));
        const location = locations.find(location => null !== location);

        return undefined === location ? null : location;
    }

}


export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SymbolInformation[]> {
        //* 1 === lf and 2 === crlf
        const eol: string = 1 === document.eol ? '\n' : '\r\n';
        const loc: string[] = document.getText().split(eol);

        //* Note you can add more match patterns
        const functionPattern: RegExp = /def\s+\w+\s*\(.*\)/;
        const symbols: vscode.SymbolInformation[] = [];

        loc.forEach((line, lineNumber) => {
            //* check line for function symbol
            if (functionPattern.test(line)) {
                //* assumes `def name()` function format
                const name: string = line.split('(')[0].split('def')[1].trim();

                symbols.push(new vscode.SymbolInformation(
                    name,
                    vscode.SymbolKind.Function,
                    '',
                    new vscode.Location(
                        document.uri,
                        new vscode.Position(lineNumber, line.indexOf(name))
                    )
                ));
            }
        });

        return symbols;
    }
}
