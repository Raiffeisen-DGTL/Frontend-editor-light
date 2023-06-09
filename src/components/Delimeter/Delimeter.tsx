import React, { useCallback, useRef } from 'react';
import styles from './style.module.css';

const headerHeight = 0;
const handleSize = 12;

let isDrag = false;
let target: HTMLDivElement;

interface Props extends React.PropsWithChildren {
    vertical?: boolean;
}

export const Delimeter: React.FC<Props> = ({ vertical, children }) => {

    const delimeterRef = useRef<HTMLDivElement>(null);

    const handleDrag = useCallback((e: MouseEvent) => {
        if (e.clientX === 0 && e.clientY === 0 || !isDrag) return;
        const delimeter = delimeterRef.current;
        if (delimeter && target) {
            const parentElement = target.parentElement;
            if (parentElement) {
                const delimeterRect = delimeter?.getBoundingClientRect();
                const nextSibling = parentElement.nextSibling as HTMLDivElement;
                const previousSibling = parentElement.previousSibling as HTMLDivElement;
                const nextRect = nextSibling?.getBoundingClientRect();
                const prevRect = previousSibling?.getBoundingClientRect();

                const newRight = delimeterRect?.width - e.clientX;
                const newLeft = e.clientX - delimeterRect?.left;

                const newBottom = delimeterRect?.height - e.clientY + headerHeight;
                const newTop = e.clientY - delimeterRect?.top;

                if (!vertical && (newLeft > (nextRect?.right ?? 0) - handleSize || newLeft < (prevRect?.right ?? 0) + handleSize)) return;
                if (vertical && (newTop > (nextRect?.bottom ?? 0) - handleSize || newTop < (prevRect?.bottom ?? 0) + handleSize)) return;

                if (!vertical) {
                    parentElement.style.right = `${newRight * 100 / delimeterRect.width}%`;
                    nextSibling.style.left = `${newLeft * 100 / delimeterRect.width}%`;
                }
                else if (target.parentElement) {
                    parentElement.style.bottom = `${newBottom * 100 / delimeterRect.height}%`;
                    nextSibling.style.top = `${newTop * 100 / delimeterRect.height}%`;
                }
            }
        }
    }, [vertical])

    const handleDragEnd = useCallback((e: MouseEvent) => {
        isDrag = false;
        document.body.style.userSelect = "";
        document.dispatchEvent(new CustomEvent('dragdelimeterend'));
        document.body.removeEventListener('mousemove', handleDrag);
        document.body.removeEventListener('mouseup', handleDragEnd);
    }, [vertical])

    const handleDragStart: React.MouseEventHandler<HTMLDivElement> = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        document.body.style.userSelect = "none";
        isDrag = true;
        target = e.currentTarget;
        document.dispatchEvent(new CustomEvent('dragdelimeterstart'));
        document.body.addEventListener('mousemove', handleDrag);
        document.body.addEventListener('mouseup', handleDragEnd);
    }, [vertical])

    const childrenLength = React.Children.map(children, c => c)?.filter(Boolean).filter(c => !(c as React.ReactElement).props['data-hide']).length ?? 0;
    const skip = React.Children.map(children, c => c)?.filter(Boolean).filter(c => (c as React.ReactElement).props['data-hide']).length ?? 0;
    const constructStyle = (n: number, hide: boolean) => {

        n = n - skip;

        if (!vertical) {
            if (hide) {
                return { width: '0px' }

            }
            return {
                left: `${100 / childrenLength * n}%`,
                right: `${100 / childrenLength * (childrenLength - n - 1)}%`
            }
        }
        if (hide) {
            return { height: '0px' }

        }
        return {
            top: `${100 / childrenLength * n}%`,
            bottom: `${100 / childrenLength * (childrenLength - n - 1)}%`
        }
    }

    return <div className={styles.container} data-vertical={vertical} ref={delimeterRef}>
        {React.Children.map(children, c => c)?.filter(Boolean).map((child, idx) => {
            return <div key={idx + skip} className={styles.child} style={constructStyle(idx, (child as React.ReactElement).props['data-hide'])}>
                <div className={styles.wrapper}>{child}</div>
                <div className={styles.handle} onMouseDown={handleDragStart}></div>
            </div>
        })}
    </div >
} 