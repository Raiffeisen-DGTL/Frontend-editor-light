import React, { useEffect, useState } from 'react';
import { Delimeter } from '../../components/Delimeter/Delimeter';
import { Editor, Playground, Console } from '..';
import styles from './style.module.css';
import { LogData } from '../Playground/Playground';

export const App: React.FC = () => {

    const [logs, setLogs] = useState<LogData[]>([]);
    const [code, setCode] = useState<string>(atob(location.hash.replace('#', '')));

    const logHandler = (data: LogData) => {
        if (data.data.console === 'clear') {
            setLogs([]);
        }
        setLogs(prev => [...prev, data]);
    }

    const handleChangeModel = (code: string) => {
        setCode(code);
    }

    useEffect(() => {
        location.hash = "";
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <Delimeter>
                    <Editor defaultCode={code} onChangeModel={handleChangeModel} />
                    <Delimeter vertical>
                        <Playground code={code} onLog={logHandler} />
                        <Console logs={logs} />
                    </Delimeter>
                </Delimeter>
            </div>
        </div>
    );
}