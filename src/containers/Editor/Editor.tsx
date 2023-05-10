import React, { useCallback, useEffect, useRef } from 'react';
import styles from './style.module.css';
import * as monaco from 'monaco-editor';

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: any, label: string) {
        if (label === 'json') {
            return './json.worker.index.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.index.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.index.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.index.js';
        }
        return './editor.worker.index.js';
    }
};

const extralibs = [{
    name: 'react',
    url: 'https://unpkg.com/@types/react@18.2.6/index.d.ts'
}, {
    name: 'react-dom',
    url: 'https://unpkg.com/@types/react-dom@18.2.4/index.d.ts'
},
{
    name: 'styled-components',
    url: 'https://unpkg.com/@types/styled-components@5.1.10/index.d.ts'
}]

interface Props {
    onChangeModel(e: string): any;
    defaultCode: string;
}

export const Editor: React.FC<Props> = ({ onChangeModel, defaultCode }) => {

    const editorElRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

    const handleChangeModel = useCallback((e: monaco.editor.IModelContentChangedEvent) => {
        onChangeModel(editorRef.current?.getValue() ?? "")
    }, [])

    useEffect(() => {
        Promise.allSettled(extralibs.map(async lib => {
            const response = await fetch(lib.url)
            const text = await response.text();
            monaco.editor.createModel(text, 'typescript', monaco.Uri.parse(`file:///node_modules/@types/${lib.name}/index.d.ts`));
            monaco.languages.typescript.typescriptDefaults.addExtraLib(text, `file:///node_modules/@types/${lib.name}/index.d.ts`);
        })).then(_ => {
            if (editorElRef.current) {
                editorRef.current = monaco.editor.create(editorElRef.current, {
                    value: defaultCode ?? "",
                    language: "typescript",
                    automaticLayout: true,
                    theme: "vs-dark",
                    minimap: {
                        enabled: false
                    }
                });
                editorRef.current?.onDidChangeModelContent(handleChangeModel);

                editorRef.current.addAction({
                    id: "1",
                    label: "Copy task URL",
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: "cutcopypaste",
                    contextMenuOrder: 1,
                    run: function (ed) {
                        navigator.clipboard.writeText(`${location.href}/#${btoa(editorRef.current?.getValue() ?? '')}`)
                    },
                });
            }
        })
    }, [])

    return <div className={styles.container} ref={editorElRef}></div>
}