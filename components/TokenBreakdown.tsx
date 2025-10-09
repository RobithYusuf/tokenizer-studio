import React, { useMemo, useState } from 'react';
import { get_encoding } from 'tiktoken';

interface TokenBreakdownProps {
  text: string;
}

const TokenBreakdown: React.FC<TokenBreakdownProps> = ({ text }) => {
  const [showWhitespace, setShowWhitespace] = useState<boolean>(true);
  const tokenBreakdown = useMemo(() => {
    if (!text) return [];

    try {
      const encoding = get_encoding('cl100k_base');
      const tokens = encoding.encode(text);

      // Generate varied colorful colors with transparency
      const colorVariants = [
        'bg-blue-600/80 text-white',
        'bg-orange-600/80 text-white',
        'bg-emerald-600/80 text-white',
        'bg-red-600/80 text-white',
        'bg-cyan-600/80 text-white',
        'bg-amber-600/80 text-white',
        'bg-teal-600/80 text-white',
        'bg-slate-600/80 text-white',
        'bg-indigo-600/80 text-white',
        'bg-lime-600/80 text-white',
        'bg-rose-600/80 text-white',
        'bg-sky-600/80 text-white',
      ];

      let previousColorIndex = -1;

      const breakdown = Array.from(tokens).map((token, index) => {
        const decodedBytes = encoding.decode([token]);
        const decoded = new TextDecoder().decode(decodedBytes);
        const length = decoded.length;

        // Determine token type first
        let warningLabel = '';
        let colorClass = '';

        if (decoded.trim() === '') {
          colorClass = 'bg-blue-50 text-blue-600 border border-blue-200';
          warningLabel = 'whitespace';
        } else {
          // Use token value to determine base color, but adjust if same as previous
          let colorIndex = Number(token) % colorVariants.length;

          // If same color as previous non-whitespace token, shift by 1
          if (previousColorIndex !== -1 && previousColorIndex === colorIndex) {
            colorIndex = (colorIndex + 1) % colorVariants.length;
          }

          colorClass = colorVariants[colorIndex];
          previousColorIndex = colorIndex; // Update previous color index

          if (length === 1 && decoded.match(/[^a-zA-Z0-9]/)) {
            warningLabel = 'punctuation';
          } else if (length > 5) {
            warningLabel = 'efficient';
          } else if (length <= 2) {
            warningLabel = 'short';
          }
        }

        return {
          index,
          token: Number(token),
          text: String(decoded),
          colorClass,
          warningLabel,
          length,
        };
      });

      encoding.free();
      return breakdown;
    } catch (error) {
      console.error('Error breaking down tokens:', error);
      return [];
    }
  }, [text]);

  const stats = useMemo(() => {
    if (tokenBreakdown.length === 0) return null;

    const totalTokens = tokenBreakdown.length;
    const totalChars = text.length;
    const avgCharsPerToken = totalTokens === 0 ? '0.00' : (totalChars / totalTokens).toFixed(2);

    const efficient = tokenBreakdown.filter(t => t.warningLabel === 'efficient').length;
    const short = tokenBreakdown.filter(t => t.warningLabel === 'short').length;
    const whitespace = tokenBreakdown.filter(t => t.warningLabel === 'whitespace').length;

    return {
      totalTokens,
      totalChars,
      avgCharsPerToken,
      efficient,
      short,
      whitespace,
    };
  }, [tokenBreakdown, text]);

  if (!text) {
    return (
      <div className="py-8 text-center text-sm text-blue-600">
        Enter text to see token details.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs lg:grid-cols-4 lg:text-sm">
          <div className="rounded-lg border-2 border-blue-200 bg-white/80 backdrop-blur-sm px-2 py-2 sm:px-3 shadow-md">
            <div className="text-blue-700 text-xs">Total tokens</div>
            <div className="text-base sm:text-lg font-semibold text-blue-900">{stats.totalTokens}</div>
          </div>
          <div className="rounded-lg border-2 border-blue-200 bg-white/80 backdrop-blur-sm px-2 py-2 sm:px-3 shadow-md">
            <div className="text-blue-700 text-xs">Total characters</div>
            <div className="text-base sm:text-lg font-semibold text-blue-900">{stats.totalChars}</div>
          </div>
          <div className="rounded-lg border-2 border-blue-200 bg-white/80 backdrop-blur-sm px-2 py-2 sm:px-3 shadow-md">
            <div className="text-blue-700 text-xs">Avg chars/token</div>
            <div className="text-base sm:text-lg font-semibold text-blue-900">{stats.avgCharsPerToken}</div>
          </div>
          <div className="rounded-lg border-2 border-blue-200 bg-white/80 backdrop-blur-sm px-2 py-2 sm:px-3 shadow-md">
            <div className="text-blue-700 text-xs">Efficient %</div>
            <div className="text-base sm:text-lg font-semibold text-blue-900">
              {((stats.efficient / stats.totalTokens) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-blue-800">
        <div className="flex items-center gap-2">
          <div className="flex h-3 flex-shrink-0">
            <span className="w-1.5 sm:w-2 bg-blue-600/80" />
            <span className="w-1.5 sm:w-2 bg-orange-600/80" />
            <span className="w-1.5 sm:w-2 bg-emerald-600/80" />
            <span className="w-1.5 sm:w-2 bg-red-600/80" />
            <span className="w-1.5 sm:w-2 bg-cyan-600/80" />
            <span className="w-1.5 sm:w-2 bg-amber-600/80" />
            <span className="w-1.5 sm:w-2 bg-teal-600/80" />
            <span className="w-1.5 sm:w-2 bg-slate-600/80" />
            <span className="w-1.5 sm:w-2 bg-indigo-600/80" />
            <span className="w-1.5 sm:w-2 bg-lime-600/80" />
            <span className="w-1.5 sm:w-2 bg-rose-600/80" />
            <span className="w-1.5 sm:w-2 bg-sky-600/80" />
          </div>
          <span className="text-xs sm:text-sm">Varied colors</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showWhitespace}
            onChange={(e) => setShowWhitespace(e.target.checked)}
            className="h-4 w-4 rounded border-0 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-600"
          />
          <span className="h-3 w-3 rounded bg-blue-50 border border-blue-200 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Show whitespace</span>
        </label>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border-2 border-blue-200 bg-white/80 backdrop-blur-sm p-3 sm:p-4 shadow-inner">
        <div className="flex flex-wrap gap-y-1 leading-relaxed text-sm sm:text-base">
          {tokenBreakdown.map((item, idx) => {
            // Skip whitespace tokens if showWhitespace is false
            if (!showWhitespace && item.warningLabel === 'whitespace') {
              return null;
            }

            const displayText =
              item.text === ' ' ? '␣' :
              item.text === '\n' ? '⏎' :
              item.text === '\t' ? '→' :
              item.text;

            // Check if this token is part of a word (not whitespace/punctuation)
            const isPartOfWord = item.warningLabel !== 'whitespace' && item.text.trim() !== '';
            const nextToken = tokenBreakdown[idx + 1];
            const isNextPartOfWord = nextToken && nextToken.warningLabel !== 'whitespace' && nextToken.text.trim() !== '';

            return (
              <span
                key={item.index}
                className={`${item.colorClass} inline-flex items-center px-1 py-0.5 transition-all duration-150 hover:scale-105 hover:z-10 hover:shadow-lg cursor-default ${
                  isPartOfWord && isNextPartOfWord ? '-mr-0.5' : ''
                }`}
                title={`Token #${item.index + 1}\nToken ID: ${item.token}\nText: "${item.text}"\nLength: ${item.length} chars\nType: ${item.warningLabel || 'normal'}`}
              >
                {displayText}
              </span>
            );
          })}
        </div>
      </div>

      {stats && stats.short > stats.totalTokens * 0.3 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-amber-800 shadow-md">
          <p className="font-semibold">Many short tokens detected</p>
          <p className="mt-1 text-xs">
            {stats.short} of {stats.totalTokens} tokens ({((stats.short / stats.totalTokens) * 100).toFixed(0)}%) are short. Consider simplifying the wording.
          </p>
        </div>
      )}
    </div>
  );
};

export default TokenBreakdown;
