class RemoteJsonLoader 
{
    async fetch(url) {
		const resolvedUrl = this._resolveUrl(url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }
    
    _resolveUrl(url) 
    {
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return HomeConfig.URLS.BASE + url;
    }

}