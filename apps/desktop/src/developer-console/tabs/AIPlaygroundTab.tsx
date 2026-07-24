import React, { useState } from 'react';
import { ModelGateway } from '../../model-gateway/ModelGateway';

export const AIPlaygroundTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'system', content: 'You are an AI assistant running inside Sidra OS Developer Console.' },
  ]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [responseOutput, setResponseOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connStatus, setConnStatus] = useState<string | null>(null);

  const testConnection = async () => {
    setConnStatus('Testing OpenRouter connection...');
    try {
      const gateway = ModelGateway.getInstance();
      const res = await gateway.complete({
        agentId: 'A-DEV-PLAYGROUND',
        messages: [{ role: 'user', content: 'Hello from Sidra Developer Console' }],
      });
      setConnStatus(`Success! Connected to OpenRouter (${res.modelId}). Latency: ${res.latencyMs}ms`);
    } catch (err) {
      setConnStatus(`Error: ${(err as Error).message}`);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const newMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);
    setResponseOutput('');

    try {
      const gateway = ModelGateway.getInstance();
      let streamed = '';

      const res = await gateway.complete({
        agentId: 'A-DEV-PLAYGROUND',
        temperature,
        messages: newMessages as any,
        onStreamChunk: isStreaming
          ? (chunk) => {
              streamed += chunk;
              setResponseOutput(streamed);
            }
          : undefined,
      });

      if (!isStreaming) {
        setResponseOutput(res.content);
      }
      setMessages([...newMessages, { role: 'assistant', content: res.content || streamed }]);
    } catch (err) {
      setResponseOutput(`[Error]: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-teal-400">AI Playground</h2>
          <p className="text-sm text-slate-400">Test OpenRouter streaming, tool calls, and model parameters in real time</p>
        </div>
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-semibold rounded-lg shadow transition"
        >
          Test OpenRouter Connection
        </button>
      </div>

      {connStatus && (
        <div className={`p-3 rounded-lg border text-sm ${connStatus.startsWith('Success') ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-rose-950/40 border-rose-500 text-rose-300'}`}>
          {connStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h3 className="font-semibold text-slate-200">Model Controls</h3>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Temperature ({temperature})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-teal-400"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="stream"
              checked={isStreaming}
              onChange={(e) => setIsStreaming(e.target.checked)}
              className="accent-teal-400"
            />
            <label htmlFor="stream" className="text-sm text-slate-300">Enable Token Streaming</label>
          </div>
        </div>

        {/* Conversation & Output */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[300px] max-h-[450px] overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`p-3 rounded-lg max-w-[85%] text-sm ${m.role === 'user' ? 'bg-teal-900/40 border border-teal-700/50 ml-auto text-teal-100' : m.role === 'system' ? 'bg-slate-800/60 text-slate-400 italic text-xs' : 'bg-slate-900 border border-slate-800 text-slate-200'}`}>
                <span className="text-xs font-bold block mb-1 opacity-70 uppercase">{m.role}</span>
                {m.content}
              </div>
            ))}
            {loading && responseOutput && (
              <div className="p-3 rounded-lg max-w-[85%] bg-slate-900 border border-slate-800 text-slate-200 text-sm">
                <span className="text-xs font-bold block mb-1 text-teal-400">Streaming Response...</span>
                {responseOutput}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Model Gateway..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition disabled:opacity-50 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
