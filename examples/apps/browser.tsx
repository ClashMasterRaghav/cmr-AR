import React, { useState, useEffect, useRef } from 'react';

interface Bookmark {
    id: string;
    title: string;
    url: string;
    icon?: string;
}

interface BrowserState {
    currentUrl: string;
    isLoading: boolean;
    canGoBack: boolean;
    canGoForward: boolean;
    bookmarks: Bookmark[];
    history: string[];
    historyIndex: number;
}

const BrowserApp: React.FC = () => {
    const [state, setState] = useState<BrowserState>({
        currentUrl: '',
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        bookmarks: [],
        history: [],
        historyIndex: -1
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showBookmarks, setShowBookmarks] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Load bookmarks from localStorage
    useEffect(() => {
        const savedBookmarks = localStorage.getItem('visionOS_browser_bookmarks');
        if (savedBookmarks) {
            setState(prev => ({ ...prev, bookmarks: JSON.parse(savedBookmarks) }));
        }
    }, []);

    // Save bookmarks to localStorage
    useEffect(() => {
        localStorage.setItem('visionOS_browser_bookmarks', JSON.stringify(state.bookmarks));
    }, [state.bookmarks]);

    const navigateToUrl = (url: string): void => {
        let processedUrl = url;
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Check if it's a search query
            if (url.includes(' ') || !url.includes('.')) {
                processedUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            } else {
                processedUrl = `https://${url}`;
            }
        }

        setState(prev => {
            const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), processedUrl];
            return {
                ...prev,
                currentUrl: processedUrl,
                history: newHistory,
                historyIndex: newHistory.length - 1,
                canGoBack: newHistory.length > 1,
                canGoForward: false,
                isLoading: true
            };
        });

        if (iframeRef.current) {
            iframeRef.current.src = processedUrl;
        }
    };

    const goBack = (): void => {
        if (state.canGoBack && state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            const url = state.history[newIndex];
            
            setState(prev => ({
                ...prev,
                currentUrl: url,
                historyIndex: newIndex,
                canGoBack: newIndex > 0,
                canGoForward: newIndex < prev.history.length - 1,
                isLoading: true
            }));

            if (iframeRef.current) {
                iframeRef.current.src = url;
            }
        }
    };

    const goForward = (): void => {
        if (state.canGoForward && state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            const url = state.history[newIndex];
            
            setState(prev => ({
                ...prev,
                currentUrl: url,
                historyIndex: newIndex,
                canGoBack: newIndex > 0,
                canGoForward: newIndex < prev.history.length - 1,
                isLoading: true
            }));

            if (iframeRef.current) {
                iframeRef.current.src = url;
            }
        }
    };

    const refresh = (): void => {
        if (iframeRef.current) {
            iframeRef.current.src = state.currentUrl;
            setState(prev => ({ ...prev, isLoading: true }));
        }
    };

    const addBookmark = (): void => {
        if (!state.currentUrl) return;

        const newBookmark: Bookmark = {
            id: Date.now().toString(),
            title: getPageTitle() || 'Untitled',
            url: state.currentUrl,
            icon: getFavicon()
        };

        setState(prev => ({
            ...prev,
            bookmarks: [...prev.bookmarks, newBookmark]
        }));
    };

    const removeBookmark = (bookmarkId: string): void => {
        setState(prev => ({
            ...prev,
            bookmarks: prev.bookmarks.filter(bookmark => bookmark.id !== bookmarkId)
        }));
    };

    const getPageTitle = (): string => {
        // This would normally get the title from the iframe, but due to CORS restrictions,
        // we'll use a simple heuristic
        try {
            const url = new URL(state.currentUrl);
            return url.hostname.replace('www.', '');
        } catch {
            return 'Unknown';
        }
    };

    const getFavicon = (): string => {
        try {
            const url = new URL(state.currentUrl);
            return `${url.protocol}//${url.hostname}/favicon.ico`;
        } catch {
            return '';
        }
    };

    const handleIframeLoad = (): void => {
        setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleIframeError = (): void => {
        setState(prev => ({ ...prev, isLoading: false }));
    };

    const quickLinks = [
        { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
        { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
        { name: 'GitHub', url: 'https://www.github.com', icon: '💻' },
        { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
        { name: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
        { name: 'Twitter', url: 'https://www.twitter.com', icon: '🐦' }
    ];

    const isBookmarked = state.bookmarks.some(bookmark => bookmark.url === state.currentUrl);

    return (
        <div className="browser-app">
            <div className="browser-toolbar">
                <div className="browser-controls">
                    <button
                        className="browser-btn"
                        onClick={goBack}
                        disabled={!state.canGoBack}
                    >
                        ←
                    </button>
                    <button
                        className="browser-btn"
                        onClick={goForward}
                        disabled={!state.canGoForward}
                    >
                        →
                    </button>
                    <button
                        className="browser-btn"
                        onClick={refresh}
                    >
                        🔄
                    </button>
                </div>

                <div className="browser-address-bar">
                    <input
                        type="text"
                        value={state.currentUrl}
                        onChange={(e) => setState(prev => ({ ...prev, currentUrl: e.target.value }))}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                navigateToUrl(e.currentTarget.value);
                            }
                        }}
                        placeholder="Enter URL or search..."
                        className="url-input"
                    />
                    <button
                        className="browser-btn go-btn"
                        onClick={() => navigateToUrl(state.currentUrl)}
                    >
                        Go
                    </button>
                </div>

                <div className="browser-actions">
                    <button
                        className={`browser-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                        onClick={addBookmark}
                        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                        {isBookmarked ? '★' : '☆'}
                    </button>
                    <button
                        className="browser-btn"
                        onClick={() => setShowBookmarks(!showBookmarks)}
                    >
                        📚
                    </button>
                </div>
            </div>

            {showBookmarks && (
                <div className="bookmarks-panel">
                    <h3>Bookmarks</h3>
                    <div className="bookmarks-list">
                        {state.bookmarks.map(bookmark => (
                            <div key={bookmark.id} className="bookmark-item">
                                <span className="bookmark-icon">{bookmark.icon || '🌐'}</span>
                                <span 
                                    className="bookmark-title"
                                    onClick={() => navigateToUrl(bookmark.url)}
                                >
                                    {bookmark.title}
                                </span>
                                <button
                                    className="remove-bookmark"
                                    onClick={() => removeBookmark(bookmark.id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="quick-links">
                {quickLinks.map(link => (
                    <button
                        key={link.url}
                        className="quick-link-btn"
                        onClick={() => navigateToUrl(link.url)}
                    >
                        <span className="quick-link-icon">{link.icon}</span>
                        <span className="quick-link-name">{link.name}</span>
                    </button>
                ))}
            </div>

            <div className="browser-content">
                {state.currentUrl ? (
                    <iframe
                        ref={iframeRef}
                        src={state.currentUrl}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        className="browser-iframe"
                        title="Web Browser"
                    />
                ) : (
                    <div className="browser-welcome">
                        <h2>🌐 Web Browser</h2>
                        <p>Enter a URL or search the web</p>
                        <div className="search-box">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        navigateToUrl(searchTerm);
                                    }
                                }}
                                placeholder="Search Google..."
                                className="search-input"
                            />
                            <button
                                className="search-btn"
                                onClick={() => navigateToUrl(searchTerm)}
                            >
                                Search
                            </button>
                        </div>
                        <p>Or use the quick links above</p>
                    </div>
                )}
                
                {state.isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowserApp; 