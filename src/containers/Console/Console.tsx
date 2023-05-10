import React from 'react';
import { LogData } from '../Playground/Playground';
import styles from './style.module.css';

interface Props {
    logs: LogData[];
}

export const Console: React.FC<Props> = ({ logs }) => {
    return <div className={styles.container}>
        {logs.filter(log => log.data.console && log.data.payload).map((log, idx) => {
            return (<div key={idx} className={styles.line} data-type={log.data.console}>
                <span className={styles.timestamp}>{log.timestamp.toLocaleTimeString()}</span>
                <span className={styles.data}>{log.data.payload}</span>
            </div>)
        })}
    </div>
}