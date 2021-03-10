import * as vscode from 'vscode';


//
// --- export constants ----------------------------------------
//


export const keywords: string[] = [
    'abstract'  , 'as'           , 'assert'    ,
    'boolean'   , 'break'        , 'byte'      ,
    'case'      , 'catch'        , 'char'      ,
    'class'     , 'const'        , 'continue'  ,
    'def'       , 'default'      , 'do'        ,
    'double'    , 'else'         , 'enum'      ,
    'extends'   , 'false'        , 'final'     ,
    'finally'   , 'float'        , 'for'       ,
    'goto'      , 'if'           , 'implements',
    'import'    , 'in'           , 'instanceof',
    'int'       , 'interface'    , 'long'      ,
    'native'    , 'new'          , 'null'      ,
    'package'   , 'private'      , 'protected' ,
    'public'    , 'return'       , 'short'     ,
    'static'    , 'strictfp'     , 'super'     ,
    'switch'    , 'synchronized' , 'this'      ,
    'threadsafe', 'throw'        , 'throws'    ,
    'transient' , 'true'         , 'try'       ,
    'void'      , 'volatile'     , 'while'     ,
    'Math'      , 'Integer'      , 'Float'     ,
    'Double'    , 'Long'         , 'BigDecimal',
    'Date'      , 'Geocode'      , 'Object'    ,
    'Closure'   , 'String'       , 'Set'       ,
    'Array'     , 'InvokerHelper', 'Exception' ,
    'Rowbinding'
];


export const types: string[] = [
    'boolean', 'byte'  , 'char'   ,
    'def'    , 'double', 'float'  ,
    'int'    , 'long'  , 'short'  ,
    'void'   , 'Object', 'Closure',
    'String' , 'List'  , 'Map'
];


//
// --- export functions ----------------------------------------
//


export function insideComment(
    line: string,
): boolean {
    // checks if passed line is an inline comment
    // note that this function does not support multiline commments
    return line.trimStart().startsWith('//');
}


export function insideString(
    line: string,
    offset: number
): boolean {
    line = line.slice(0, offset + 1).trim();

    let stringIdentifier: string = '';
    let inString: boolean = false;

    for (let i = 0; i < line.length; i++) {
        const curr: string = line[i];

        // check if current character matches a string identifier
        if (stringIdentifier === '' && ['"', "'"].includes(curr)) {
            stringIdentifier = curr;
        }
        // check if string identifier is set and it is being escaped
        else if (stringIdentifier !== '' && curr === '\\' && line[i + 1] === stringIdentifier) {
            i++;
        }

        if (curr === stringIdentifier) {
            inString = !inString;
        }
    }

    return inString || line[line.length - 1] === stringIdentifier;
}


export function isKeyword(
    word: string
): boolean {
    return keywords.includes(word);
}


export function isValidName(
    word: string
): boolean {
    return word.trim().match(/^[a-zA-Z_]\w*$/) !== null;
}


export function getWord(
    document: vscode.TextDocument,
    position: vscode.Position
): string | undefined {
    const line: string = document.lineAt(position.line).text;
    if (insideComment(line) || insideString(line, position.character)) {
        return undefined;
    }

    const wordRange: vscode.Range | undefined = document.getWordRangeAtPosition(position);
    if (wordRange === undefined) {
        return undefined;
    }

    const word: string = document.getText(wordRange);
    if (isKeyword(word) || !isValidName(word)) {
        return undefined;
    }

    return word;
}
