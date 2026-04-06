import React, { useState } from 'react';
import './QuoteBox.css';

function QuoteBox({ quote, fetchQuote }) {
  const [showCopy, setShowCopy] = useState(false);

  const handleMouseUp = () => {
    setShowCopy(Boolean(window.getSelection().toString().trim()));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.quote}" — ${quote.author}`);
    setShowCopy(false);
  };

  return (
    <div className="quote-box" onMouseUp={handleMouseUp}>
      <p className="quote-text">"{quote.quote}"</p>
      <p className="quote-author">— {quote.author}</p>
      <div className="buttons">
        <button className="btn" onClick={fetchQuote}>New Quote</button>
        {showCopy && <button className="btn btn-secondary" onClick={handleCopy}>Copy</button>}
      </div>
    </div>
  );
}

export default QuoteBox;
