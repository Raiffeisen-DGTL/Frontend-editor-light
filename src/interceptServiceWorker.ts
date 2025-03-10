const mockArray = [
    { id: '1', title: 'Mock object 1' },
    { id: '2', title: 'Mock object 2' },
    { id: '3', title: 'Mock object 3' },
    { id: '4', title: 'Mock object 4' },
    { id: '5', title: 'Mock object 5' },
];

self.addEventListener('activate', () => {
    console.log('InterceptSW Aсtivated');
});

const defaultFetchHandler = (event: FetchEvent) => {
    event.respondWith(fetch(event.request));
};

let currentFetchHandler = defaultFetchHandler;

self.addEventListener('fetch', currentFetchHandler);

self.addEventListener('message', (messageEvent) => {
    if (messageEvent.data.type === 'updateApiHandler') {
        const apiCode = messageEvent.data.apiCode
            ? JSON.parse(messageEvent.data.apiCode)
            : [];

        if (currentFetchHandler) {
            self.removeEventListener('fetch', currentFetchHandler);
        }

        if (apiCode.length > 0) {
            currentFetchHandler = (event: FetchEvent) => {
                for (let i = 0; i < apiCode.length; i++) {
                    if (!apiCode[i].url) continue;

                    const currentUrl = new URL(event.request.url);
                    if (currentUrl.pathname === apiCode[i].url) {
                        return event.respondWith(
                            new Promise((resolve) => {
                                if (apiCode[0].delay) {
                                    setTimeout(() => {
                                        resolve(
                                            new Response(
                                                JSON.stringify({
                                                    data:
                                                        apiCode[i].data ??
                                                        mockArray,
                                                }),
                                                { status: 200 }
                                            )
                                        );
                                    }, apiCode[0].delay);
                                } else {
                                    resolve(
                                        new Response(
                                            JSON.stringify({
                                                data:
                                                    apiCode[i].data ??
                                                    mockArray,
                                            }),
                                            { status: 200 }
                                        )
                                    );
                                }
                            })
                        );
                    }
                }
                return event.respondWith(fetch(event.request));
            };
        } else {
            currentFetchHandler = defaultFetchHandler;
        }

        self.addEventListener('fetch', currentFetchHandler);
    }
});
