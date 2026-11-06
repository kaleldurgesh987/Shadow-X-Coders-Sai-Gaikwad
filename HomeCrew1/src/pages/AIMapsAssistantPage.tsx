import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Send, 
  ExternalLink, 
  Store, 
  Wrench, 
  CheckCircle2, 
  Loader2,
  Navigation
} from 'lucide-react';

interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: Array<{
        reviewText?: string;
      }>;
    };
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

export const AIMapsAssistantPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const samplePrompts = [
    'Find reliable plumbing and sanitaryware hardware shops near Dadar West, Mumbai',
    'Where can I buy genuine electrical switches and MCBs near Bandra?',
    'What are the typical fair labour charges for AC gas refill in Mumbai?',
    'Find hardware stores and power tool rental shops near Andheri West',
  ];

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setResponseMarkdown(null);
    setGroundingChunks([]);

    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: queryText,
          latitude: 19.0760,
          longitude: 72.8777,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve grounded response from server');
      }

      const data = await res.json();
      setResponseMarkdown(data.text);
      setGroundingChunks(data.groundingChunks || []);
    } catch (err: any) {
      console.error('Error fetching Maps Grounding:', err);
      setErrorMsg(err.message || 'Error communicating with Maps AI Assistant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#0B5D43] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F9B000]" />
            <span>Google Maps Grounding &bull; Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900">
            HomeCrew Maps Grounded Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
            Get verified local store recommendations, hardware suppliers, and fair rate benchmarks grounded with real Google Maps data across Mumbai.
          </p>
        </div>

        {/* Input Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery(prompt);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about nearby hardware stores, spare parts, or fair trade rates in Mumbai..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none focus:bg-white focus:border-[#0B5D43] font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 sm:px-7 py-3 bg-[#0B5D43] hover:bg-[#084532] disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#F9B000]" />
                  <span className="hidden sm:inline">Grounding...</span>
                </>
              ) : (
                <>
                  <span>Ask Assistant</span>
                  <Send className="w-3.5 h-3.5 text-[#F9B000]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Popular Local Inquiries:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(q);
                    handleQuery(q);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-[#0B5D43] border border-gray-200 text-xs text-gray-600 transition-colors text-left"
                >
                  &bull; {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Results Area */}
        {responseMarkdown && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Grounded Text Response */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B5D43]">
                <CheckCircle2 className="w-4 h-4 text-[#F9B000]" />
                <span>Verified with Google Maps Grounding</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {responseMarkdown}
              </div>
            </div>

            {/* Grounded Places Cards as required by Maps Grounding spec */}
            {groundingChunks.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0B5D43]" />
                  <span>Referenced Google Maps Locations</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groundingChunks
                    .filter((c) => c.maps?.uri || c.web?.uri)
                    .map((chunk, idx) => {
                      const uri = chunk.maps?.uri || chunk.web?.uri || '#';
                      const title = chunk.maps?.title || chunk.web?.title || 'Google Maps Location';
                      const snippets = chunk.maps?.placeAnswerSources?.reviewSnippets || [];

                      return (
                        <a
                          key={idx}
                          href={uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#0B5D43] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-heading font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#0B5D43] transition-colors">
                                {title}
                              </h4>
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0B5D43] shrink-0" />
                            </div>

                            {snippets.length > 0 && (
                              <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 italic">
                                &ldquo;{snippets[0].reviewText}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                            <span>Open in Google Maps</span>
                            <span>&rarr;</span>
                          </div>
                        </a>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
