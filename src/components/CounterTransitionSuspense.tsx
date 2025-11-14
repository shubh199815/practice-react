import { useState, useTransition, Suspense } from 'react';

function delayedRender(delay: number = 700) {
    const cache: Map<number, { read: () => number | undefined }> = new Map();

    return function getResource(key: number) {
        if (cache.has(key)) {
            return cache.get(key)!;
        }

        let status: string = 'pending';
        let result: number;

        const promise: Promise<number> = new Promise<number>((resolve) => {
            setTimeout(() => {
                status = 'success';
                result = key;
                resolve(key);
            }, delay);
        });

        const resource: { read: () => number | undefined } = {
            read(){
                if (status === 'pending') {
                    throw promise;
                } else if (status === 'error') {
                    throw new Error('Error loading resource');
                } else if (status === 'success') {
                    return result!;
                }
            }
        };
        cache.set(key, resource);
        return resource;
    }
}

const getCountResource = delayedRender();

function CountDisplay({ count }: { count: number }) {
    const resource = getCountResource(count);
    const displayedCount = resource.read();
    return <span>{displayedCount}</span>;
}


export default function CounterTransitionSuspense() {
    const [count, setCount] = useState(0);
    const [isPending, startTransition] = useTransition();

    const increment = () => {
        setCount((c) => c + 1);
    };

    const incrementwithTransition = () => {
        startTransition(() => {
            setCount((c) => c + 1);
        });
    };

    const decrement = () => {
        setCount((c) => c - 1);
    };

    const decrementwithTransition = () => {
        startTransition(() => {
            setCount((c) => c - 1);
        });
    };

    console.log('Rendering CounterTransitionSuspense, isPending:', isPending);

    return (
        <>
            <h2>Counter with Transition and Suspense</h2>
            <Suspense fallback={<span>Loading...</span>}>
                { !isPending && <CountDisplay count={count} /> }
            </Suspense>

            <div>
                {isPending && <span>Updating...</span>}
            </div>
            <button onClick={decrementwithTransition} disabled={isPending}>- Transition</button>
            <button onClick={incrementwithTransition} disabled={isPending}>+ Transition</button>
            {' '}
            <button onClick={decrement} disabled={isPending}>- Normal</button>
            <button onClick={increment} disabled={isPending}>+ Normal</button>
            <span>{count}</span>
        </>
    );
}