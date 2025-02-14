const mockArray = [
    { id: '1', title: 'Test 1' },
    { id: '2', title: 'Test 2' },
    { id: '3', title: 'Test 3' },
    { id: '4', title: 'Test 4' },
    { id: '5', title: 'Test 5' },
];

const mockFetch = (): Promise<Response> => {
    return new Promise((resolve) => {
        resolve(
            new Response(
                JSON.stringify({
                    data: mockArray,
                }),
                { status: 200 }
            )
        );
    });
};

const mockSlowFetch = (delay: number): Promise<Response> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                new Response(
                    JSON.stringify({
                        data: mockArray,
                    }),
                    { status: 200 }
                )
            );
        }, delay);
    });
};

self.addEventListener('activate', () => {
    console.log('InterceptSW Aсtivated');
});

self.addEventListener('fetch', (event: FetchEvent) => {
    const headers = new Headers(event.request.headers);
    const currentFetchTypeHeader = headers.get('X-Mock-Fetch-Type');

    if (currentFetchTypeHeader) {
        if (currentFetchTypeHeader === 'slow') {
            const currentDelayHeader = Number(
                headers.get('X-Mock-Fetch-Delay') ?? '2000'
            );
            event.respondWith(mockSlowFetch(currentDelayHeader));
        } else {
            event.respondWith(mockFetch());
        }
    }
});
