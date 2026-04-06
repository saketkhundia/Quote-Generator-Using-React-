import React, { useState, useEffect, useCallback } from 'react';
import './QuoteBox.css';

const CATEGORIES = ['All', 'Inspiration', 'Love', 'Life', 'Wisdom', 'Humor'];

const KEYWORD_MAP = {
  love: ['love', 'heart', 'passion', 'romance', 'beloved', 'affection'],
  nature: ['nature', 'tree', 'forest', 'mountain', 'ocean', 'sea', 'river', 'sky', 'flower', 'earth'],
  success: ['success', 'achieve', 'goal', 'win', 'victory', 'accomplish', 'greatness'],
  wisdom: ['wisdom', 'wise', 'knowledge', 'learn', 'understand', 'truth', 'mind', 'think'],
  courage: ['courage', 'brave', 'fear', 'strong', 'strength', 'power', 'bold'],
  hope: ['hope', 'dream', 'believe', 'faith', 'trust', 'future', 'tomorrow', 'possible'],
  life: ['life', 'living', 'exist', 'journey', 'path', 'road', 'world', 'experience'],
  happiness: ['happy', 'happiness', 'joy', 'smile', 'laugh', 'cheerful', 'pleasure'],
  peace: ['peace', 'calm', 'quiet', 'silence', 'serene', 'tranquil', 'gentle'],
  motivation: ['motivation', 'inspire', 'determination', 'persist', 'never give up', 'action', 'change'],
};

const getQuoteKeyword = (text, category) => {
  if (category !== 'All') return category.toLowerCase();
  const lower = text.toLowerCase();
  for (const [keyword, triggers] of Object.entries(KEYWORD_MAP)) {
    if (triggers.some((t) => lower.includes(t))) return keyword;
  }
  return 'inspiration';
};

const QuoteBox = () => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [translated, setTranslated] = useState('');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [quoteNumber, setQuoteNumber] = useState(0);
  const [bgImage, setBgImage] = useState('');
  const [bgLoaded, setBgLoaded] = useState(false);

  const fetchBgImage = useCallback(async (quoteText, category) => {
    const key = process.env.REACT_APP_UNSPLASH_KEY;
    if (!key) return;
    const keyword = getQuoteKeyword(quoteText, category);
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${encodeURIComponent(key)}`
      );
      if (!res.ok) throw new Error(`Unsplash: ${res.status}`);
      const data = await res.json();
      const url = data.urls?.regular;
      if (url) {
        setBgLoaded(false);
        const img = new Image();
        img.onload = () => {
          setBgImage(url);
          setBgLoaded(true);
        };
        img.src = url;
      }
    } catch (err) {
      console.warn('Unsplash failed:', err.message);
    }
  }, []);

  const fetchQuote = useCallback(async () => {
    setIsLoadingQuote(true);
    setTranslated('');
    setFadeIn(false);
    setLiked(false);
    setCopied(false);
    setShared(false);
    setLikeCount(Math.floor(Math.random() * 500) + 10);

    const apis = [
      {
        name: 'ZenQuotes',
        url: 'https://zenquotes.io/api/random',
        parse: (data) => ({ text: data[0].q, author: data[0].a, id: Math.floor(Math.random() * 9999) }),
      },
      {
        name: 'DummyJSON',
        url: 'https://dummyjson.com/quotes/random',
        parse: (data) => ({ text: data.quote, author: data.author, id: data.id }),
      },
      {
        name: 'FavQs',
        url: 'https://favqs.com/api/qotd',
        parse: (data) => ({ text: data.quote.body, author: data.quote.author, id: data.quote.id }),
      },
    ];

    for (const api of apis) {
      try {
        const res = await fetch(api.url);
        if (!res.ok) throw new Error(`${api.name}: ${res.status}`);
        const data = await res.json();
        const parsed = api.parse(data);
        if (!parsed.text) throw new Error(`${api.name}: empty quote`);
        setQuote(parsed.text);
        setAuthor(parsed.author || 'Unknown');
        setQuoteNumber(parsed.id || 0);
        fetchBgImage(parsed.text, activeCategory);
        console.log(`Quote fetched from ${api.name}`);
        setIsLoadingQuote(false);
        setTimeout(() => setFadeIn(true), 50);
        return;
      } catch (err) {
        console.warn(`${api.name} failed:`, err.message);
      }
    }

    // All APIs failed — use fallback
    console.error('All quote APIs failed, using fallback');
    setQuote('The only limit to our realization of tomorrow is our doubts of today.');
    setAuthor('Franklin D. Roosevelt');
    setIsLoadingQuote(false);
    setTimeout(() => setFadeIn(true), 50);
  }, [fetchBgImage, activeCategory]);

  const translateToHindi = async () => {
    if (!quote || isTranslating) return;
    setIsTranslating(true);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(quote)}&langpair=en|hi`
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setTranslated(data.responseData.translatedText);
    } catch (err) {
      console.error('Translation error:', err);
      setTranslated('\u0905\u0928\u0941\u0935\u093E\u0926 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0935\u093F\u092B\u0932\u0964');
    }
    setIsTranslating(false);
  };

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quote}" \u2014 ${author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = `"${quote}" \u2014 ${author}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const text = `"${quote}" \u2014 ${author}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Quote', text });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    fetchQuote();
  };

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Keyboard shortcut: Space = new quote
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        fetchQuote();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fetchQuote]);

  return (
    <>
      {/* Unsplash background image */}
      {bgImage && (
        <div className={`bg-unsplash ${bgLoaded ? 'bg-visible' : ''}`}>
          <div
            className="bg-unsplash-img"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="bg-unsplash-overlay" />
        </div>
      )}
    <div className="quote-card">
      {/* Animated border glow */}
      <div className="card-glow"></div>
      <div className="quote-accent-bar"></div>

      <div className="quote-body">
        {/* Category pills */}
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quote number badge */}
        {quoteNumber > 0 && (
          <div className="quote-badge">#{quoteNumber}</div>
        )}

        {/* Big decorative quote mark */}
        <div className="quote-icon">{'\u201C'}</div>

        {isLoadingQuote ? (
          <div className="loading-container">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p className="loading-text">Fetching wisdom...</p>
          </div>
        ) : (
          <div className={`quote-content ${fadeIn ? 'fade-in' : ''}`}>
            <p className="quote-text">{quote}</p>
            <div className="author-line">
              <div className="author-avatar">
                {author ? author.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="author-info">
                <p className="quote-author">{author}</p>
                <p className="quote-meta">Quote #{quoteNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action icons row */}
        <div className="action-icons">
          <button
            className={`icon-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            title="Like"
          >
            <span className="icon-heart">{liked ? '\u2764\uFE0F' : '\uD83E\uDE76'}</span>
            <span className="icon-count">{likeCount}</span>
          </button>

          <button
            className={`icon-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy"
          >
            <span>{copied ? '\u2705' : '\uD83D\uDCCB'}</span>
            <span className="icon-label">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            className="icon-btn"
            onClick={handleShare}
            title="Share"
          >
            <span>{shared ? '\u2705' : '\uD83D\uDD17'}</span>
            <span className="icon-label">{shared ? 'Shared!' : 'Share'}</span>
          </button>
        </div>

        {/* Translation */}
        {translated && (
          <div className="translated-container">
            <p className="translated-label">{'\uD83C\uDDEE\uD83C\uDDF3'} Hindi Translation</p>
            <p className="translated-text">{translated}</p>
          </div>
        )}

        {/* Main action buttons */}
        <div className="buttons">
          <button className="btn btn-primary" onClick={fetchQuote} disabled={isLoadingQuote}>
            <span className="btn-icon">{'\u2728'}</span>
            {isLoadingQuote ? 'Loading\u2026' : 'New Quote'}
          </button>

          <button className="btn btn-secondary" onClick={translateToHindi} disabled={isTranslating || isLoadingQuote}>
            <span className="btn-icon">{'\uD83C\uDDEE\uD83C\uDDF3'}</span>
            {isTranslating ? 'Translating\u2026' : 'Hindi'}
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="keyboard-hint">Press <kbd>Space</kbd> for a new quote</p>
      </div>
    </div>
    </>
  );
};

export default QuoteBox;
