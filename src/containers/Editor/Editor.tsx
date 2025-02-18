import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import styles from './style.module.css';
import * as monaco from 'monaco-editor';
import { PlayIcon } from './playIcon';

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
    },
};

const extralibs = [
    {
        name: 'react',
        url: 'https://unpkg.com/@types/react@18.2.6/index.d.ts',
    },
    {
        name: 'react-dom',
        url: 'https://unpkg.com/@types/react-dom@18.2.4/index.d.ts',
    },
    {
        name: 'styled-components',
        url: 'https://unpkg.com/@types/styled-components@5.1.10/index.d.ts',
    },
];

const langToExt = {
    typescript: 'tsx',
    html: 'html',
    css: 'css',
};

export enum ActionType {
    COPY_URL,
    TOGGLE_TSX,
    TOGGLE_CSS,
    TOGGLE_HTML,
    TOGGLE_OUTPUT,
    TOGGLE_IFRAME,
    TOGGLE_CONSOLE,
    TOGGLE_VIEW,
    TOGGLE_AUTORUN,
}

const refAction: { current?(type: ActionType): void } = { current: undefined };

interface Props {
    language?: 'typescript' | 'css' | 'html';
    defaultCode: string;
    autorun?: boolean;
    runCode?: () => void;
    onChangeModel(e: string): any;
    onAction(type: ActionType): void;
}

export const Editor: React.FC<Props> = ({
    language = 'typescript',
    defaultCode,
    autorun,
    runCode,
    onChangeModel,
    onAction,
}) => {
    const editorElRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

    const handleChangeModel = (e: monaco.editor.IModelContentChangedEvent) => {
        onChangeModel(editorRef.current?.getValue() ?? '');
    };

    refAction.current = onAction;
    useLayoutEffect(() => {
        let model: monaco.editor.ITextModel;
        Promise.allSettled(
            extralibs.map(async (lib) => {
                const response = await fetch(lib.url);
                const text = await response.text();
                monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    text,
                    `file:///node_modules/@types/${lib.name}/index.d.ts`
                );
            })
        ).then((_) => {
            if (editorElRef.current) {
                monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                    {
                        jsx: monaco.languages.typescript.JsxEmit.React,
                        jsxFactory: 'React.createElement',
                        reactNamespace: 'React',
                        htllowNonTsExtensions: true,
                        allowJs: true,
                        target: monaco.languages.typescript.ScriptTarget.Latest,
                    }
                );

                editorRef.current = monaco.editor.create(editorElRef.current, {
                    value: defaultCode ?? '',
                    language: language,
                    automaticLayout: true,
                    theme: 'vs-dark',
                    minimap: {
                        enabled: false,
                    },
                });

                model = monaco.editor.createModel(
                    defaultCode,
                    language,
                    monaco.Uri.parse(`${language}.${langToExt[language]}`)
                );
                editorRef.current.setModel(model);
                editorRef.current.onDidChangeModelContent(handleChangeModel);

                editorRef.current.addAction({
                    id: 'Copy task URL',
                    label: 'Copy task URL',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'navigation',
                    contextMenuOrder: 1,
                    run: () => {
                        refAction.current?.(ActionType.COPY_URL);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle CSS',
                    label: 'Toggle CSS',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'state',
                    contextMenuOrder: 2,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_CSS);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle HTML',
                    label: 'Toggle HTML',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'state',
                    contextMenuOrder: 3,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_HTML);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle TSX',
                    label: 'Toggle TSX',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'state',
                    contextMenuOrder: 1,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_TSX);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle Output',
                    label: 'Toggle Output',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'state',
                    contextMenuOrder: 4,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_OUTPUT);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle Iframe',
                    label: 'Toggle Iframe',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'state',
                    contextMenuOrder: 5,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_IFRAME);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle Console',
                    label: 'Toggle Console',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'state',
                    contextMenuOrder: 6,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_CONSOLE);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle View',
                    label: 'Toggle View',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'view',
                    contextMenuOrder: 1,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_VIEW);
                    },
                });

                editorRef.current.addAction({
                    id: 'Toggle Autorun',
                    label: 'Toggle Autorun',
                    precondition: undefined,
                    keybindingContext: undefined,
                    contextMenuGroupId: 'view',
                    contextMenuOrder: 7,
                    run: () => {
                        refAction.current?.(ActionType.TOGGLE_AUTORUN);
                    },
                });
            }
        });

        return () => {
            model.dispose();
        };
    }, []);

    return (
        <div className={styles.container}>
            <div
                className={styles.label}
                ref={editorElRef}
                data-lang={langToExt[language]}
            >
                {language === 'typescript' ? (
                    autorun ? (
                        <p className={styles.label__name}>
                            {langToExt[language]}
                        </p>
                    ) : (
                        <div className={styles.label__autorun_block}>
                            <p className={styles.label__name}>
                                {langToExt[language]}
                            </p>
                            <div
                                className={styles.label__icon}
                                onClick={runCode}
                            >
                                <PlayIcon />
                            </div>
                        </div>
                    )
                ) : (
                    <p className={styles.label__name}>{langToExt[language]}</p>
                )}
            </div>
            <div className={styles.editor} ref={editorElRef}></div>
        </div>
    );
};
