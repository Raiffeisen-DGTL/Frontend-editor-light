import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
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

const langToExt = {
    typescript: 'tsx',
    html: 'html',
    css: 'css'
}

const refRequestUrl: any = { current: null }

interface Props {
    onChangeModel(e: string): any;
    defaultCode: string;
    language?: 'typescript' | 'css' | 'html';
    requestURL(): void;
}

export const Editor: React.FC<Props> = ({ onChangeModel, defaultCode, language = 'typescript', requestURL }) => {

    const editorElRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

    const handleChangeModel = useCallback((e: monaco.editor.IModelContentChangedEvent) => {
        onChangeModel(editorRef.current?.getValue() ?? "")
    }, [])

    refRequestUrl.current = requestURL;
    useLayoutEffect(() => {
        Promise.allSettled(extralibs.map(async lib => {
            const response = await fetch(lib.url)
            const text = await response.text();
            monaco.languages.typescript.typescriptDefaults.addExtraLib(text, `file:///node_modules/@types/${lib.name}/index.d.ts`);
        })).then(_ => {
            if (editorElRef.current) {
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                    jsx: monaco.languages.typescript.JsxEmit.React,
                    jsxFactory: 'React.createElement',
                    reactNamespace: 'React',
                    htllowNonTsExtensions: true,
                    allowJs: true,
                    target: monaco.languages.typescript.ScriptTarget.Latest,
                });

                editorRef.current = monaco.editor.create(editorElRef.current, {
                    value: defaultCode ?? "",
                    language: language,
                    automaticLayout: true,
                    theme: "vs-dark",
                    minimap: {
                        enabled: false
                    }
                });

                const model = monaco.editor.createModel(defaultCode, language, monaco.Uri.parse(`${language}.${langToExt[language]}`));
                editorRef.current.setModel(model);
                editorRef.current.onDidChangeModelContent(handleChangeModel);

                editorRef.current.addAction({
                    id: "1",
                    label: "Copy task URL",
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: "cutcopypaste",
                    contextMenuOrder: 1,
                    run: () => {
                        refRequestUrl.current?.();
                    },
                });
            }
        })
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.label} ref={editorElRef} data-lang={langToExt[language]}>{langToExt[language]}</div>
            <div className={styles.editor} ref={editorElRef}></div>
        </div >
    );
}