class RemoteJsonLoader 
{
    async fetch(url) {
		const resolvedUrl = this._resolveUrl(url);
        const response = await fetch(resolvedUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }
    
    _resolveUrl(url) 
    {
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        console.log(url)
        console.log(HomeConfig.URLS.BASE + url)
        return HomeConfig.URLS.BASE + url;
    }

}