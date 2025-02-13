const mockFetch = (mockType: string): Promise<Response> => {
    const mockArray = [
        { id: '1', title: 'Test 1' },
        { id: '2', title: 'Test 2' },
        { id: '3', title: 'Test 3' },
        { id: '4', title: 'Test 4' },
        { id: '5', title: 'Test 5' },
        { id: '6', title: mockType },
    ];

    return new Promise((resolve) => {
        if (mockType === 'slow') {
            setTimeout(() => {
                resolve(
                    new Response(
                        JSON.stringify({
                            data: mockArray,
                        }),
                        { status: 200 }
                    )
                );
            }, 5000);
        } else {
            resolve(
                new Response(
                    JSON.stringify({
                        data: mockArray,
                    }),
                    { status: 200 }
                )
            );
        }
    });
};

self.addEventListener('activate', () => {
    console.log('InterceptSW Aсtivated');
});

self.addEventListener('fetch', (event: FetchEvent) => {
    const headers = new Headers(event.request.headers);
    if (headers.has('X-Mock-Fetch-Type')) {
        const currentHeader = headers.get('X-Mock-Fetch-Type');
        if (currentHeader) event.respondWith(mockFetch(currentHeader));
    }
});
