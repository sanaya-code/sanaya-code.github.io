class RemoteJsonLoader {
    constructor(remoteConfig) {
        this.cacheName = remoteConfig.cacheName;
    }

    async loadJson(url) {
        if (!("caches" in window)) {
            return await this.fetchJson(url);
        }

        return await this.fetchCachedJson(url);
    }

    async fetchJson(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }

    async fetchCachedJson(url) {
        const cache = await caches.open(this.cacheName);
        const cachedResponse = await cache.match(url);

        if (!cachedResponse) {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await cache.put(url, response.clone());
            return await response.json();
        }

        try {
            const networkResponse = await fetch(url);

            if (networkResponse.ok) {
                await cache.put(url, networkResponse.clone());
                return await networkResponse.json();
            }
        } catch (error) {
            console.warn("Network failed. Using cached version.", error);
        }

        return await cachedResponse.json();
    }
}