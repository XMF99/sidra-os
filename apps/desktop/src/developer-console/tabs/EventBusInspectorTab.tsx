import React, { useState } from 'react';
import { EventBusEngine } from '../../event-bus/EventBusEngine';
import { SidraEvent } from '../../event-bus/types';

export const EventBusInspectorTab: React.FC = () => {
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [correlationSearch, setCorrelationSearch] = useState<string>('');
  const [activeSubView, setActiveSubView] = useState<'stream' | 'topics' | 'subs' | 'dlq' | 'replay' | 'publish' | 'trace'>('stream');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Publish Event Form State
  const [pubTopic, setPubTopic] = useState<string>('system.all');
  const [pubCategory, setPubCategory] = useState<string>('system');
  const [pubTitle, setPubTitle] = useState<string>('Custom Developer Console Event');

  // Replay Form State
  const [replayPattern, setReplayPattern] = useState<string>('*');
  const [replayedEvents, setReplayedEvents] = useState<SidraEvent[]>([]);

  const engine = EventBusEngine.getInstance();
  const events = engine.queryEvents();
  const topics = engine.getAllTopics();
  const subscriptions = engine.getAllSubscriptions();
  const deadLetters = engine.getDeadLetters();
  const metrics = engine.getMetrics();

  const handlePublishEvent = () => {
    try {
      const ev = engine.publish(pubTopic, pubCategory as any, { title: pubTitle }, { sourceRuntime: 'dev_console' });
      setTestOutput(`Published Event '${ev.id}' to topic '${ev.topic}'.`);
    } catch (err) {
      setTestOutput(`Publish Error: ${(err as Error).message}`);
    }
  };

  const handleReplay = () => {
    try {
      const res = engine.replay({ topicPattern: replayPattern, limit: 20 });
      setReplayedEvents(res);
      setTestOutput(`Replayed ${res.length} events matching pattern '${replayPattern}'.`);
    } catch (err) {
      setTestOutput(`Replay Error: ${(err as Error).message}`);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const topicMatch = selectedTopicFilter === 'ALL' || ev.topic === selectedTopicFilter;
    const catMatch = selectedCategoryFilter === 'ALL' || ev.category === selectedCategoryFilter;
    const corrMatch = !correlationSearch || ev.correlationId.includes(correlationSearch) || ev.traceId.includes(correlationSearch);
    return topicMatch && catMatch && corrMatch;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📡</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Event Bus & Event Streaming Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Central event backbone for event routing, persistence, wildcard subscriptions, replay, and correlation tracing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Events/sec</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.eventsPerSec}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Published</div>
            <div className="text-sm font-bold text-teal-300">{metrics.totalPublishedCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Delivered</div>
            <div className="text-sm font-bold text-amber-400">{metrics.totalDeliveredCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Dead Letters</div>
            <div className="text-sm font-bold text-rose-400">{metrics.deadLetterCount}</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('stream')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'stream'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📡 Live Event Stream ({filteredEvents.length})
          </button>
          <button
            onClick={() => setActiveSubView('publish')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'publish'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⚡ Publish Event
          </button>
          <button
            onClick={() => setActiveSubView('topics')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'topics'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📚 Topic Registry ({topics.length})
          </button>
          <button
            onClick={() => setActiveSubView('subs')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'subs'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔌 Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveSubView('dlq')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'dlq'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            💀 Dead Letter Queue ({deadLetters.length})
          </button>
          <button
            onClick={() => setActiveSubView('replay')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'replay'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔄 Event Replay Tool
          </button>
          <button
            onClick={() => setActiveSubView('trace')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'trace'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔎 Correlation Tracing
          </button>
        </div>
      </div>

      {/* Output Banner */}
      {testOutput && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono flex justify-between items-center">
          <span>{testOutput}</span>
          <button onClick={() => setTestOutput(null)} className="text-slate-400 hover:text-slate-200 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Live Stream Subview */}
      {activeSubView === 'stream' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Topic Filter:</span>
              <select
                value={selectedTopicFilter}
                onChange={(e) => setSelectedTopicFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
              >
                <option value="ALL">ALL TOPICS</option>
                {topics.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Category:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 uppercase"
              >
                {['ALL', 'domain', 'system', 'runtime', 'mission', 'workflow', 'automation', 'planning', 'decision', 'execution', 'resource', 'connector'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto font-mono text-xs">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-teal-300">[{ev.topic}]</span>
                      <span className="text-slate-100 font-semibold">{ev.id}</span>
                      <span className="text-[9px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Correlation: <strong className="text-amber-300">{ev.correlationId}</strong> | Trace: {ev.traceId}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      ev.state === 'published' || ev.state === 'delivered'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ev.state}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
                  <pre className="overflow-x-auto text-[10px] text-teal-200/90">{JSON.stringify(ev.payload, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Subview */}
      {activeSubView === 'publish' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">⚡ Event Publisher Console</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Target Topic:</label>
              <select
                value={pubTopic}
                onChange={(e) => setPubTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100"
              >
                {topics.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Event Category:</label>
              <select
                value={pubCategory}
                onChange={(e) => setPubCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100 uppercase"
              >
                {['domain', 'system', 'runtime', 'mission', 'workflow', 'automation', 'planning', 'decision', 'execution', 'resource', 'connector'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300">Event Title / Payload Message:</label>
            <input
              type="text"
              value={pubTitle}
              onChange={(e) => setPubTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100"
            />
          </div>

          <button
            onClick={handlePublishEvent}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            ⚡ Publish Event to Bus
          </button>
        </div>
      )}

      {/* Topics Subview */}
      {activeSubView === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {topics.map((top) => (
            <div key={top.name} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-teal-300 text-sm">{top.name}</h4>
                  <span className="text-[10px] text-slate-400 uppercase">{top.category}</span>
                </div>
                <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-amber-300">
                  {top.retentionPolicy}
                </span>
              </div>
              <p className="text-slate-300 text-xs">{top.description}</p>
              <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Subscribers: <strong className="text-slate-200">{top.subscriberCount}</strong></span>
                <span>Published: <strong className="text-emerald-400">{top.totalPublished}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscriptions Subview */}
      {activeSubView === 'subs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Active Topic Subscriptions</h3>
          {subscriptions.map((sub) => (
            <div key={sub.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-teal-300">{sub.subscriberName}</span>
                <p className="text-[10px] text-slate-400">Pattern: <strong className="text-amber-300">{sub.topicPattern}</strong> | Priority: {sub.priority}</p>
              </div>
              <span className="text-[10px] text-slate-500">{sub.createdAt}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dead Letter Subview */}
      {activeSubView === 'dlq' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Dead Letter Queue Logs</h3>
          {deadLetters.length === 0 ? (
            <p className="text-slate-500 italic p-4">Dead Letter Queue empty. Zero poison events detected!</p>
          ) : (
            deadLetters.map((dl) => (
              <div key={dl.id} className="p-4 bg-slate-950 rounded-xl border border-rose-900/50 space-y-1">
                <span className="font-bold text-rose-400">[{dl.id}] Event: {dl.event.id} ({dl.event.topic})</span>
                <p className="text-[10px] text-slate-400">Reason: {dl.failureReason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Replay Subview */}
      {activeSubView === 'replay' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">🔄 Interactive Event Replay Tool</h3>
          <div className="flex gap-4 items-center font-mono text-xs">
            <label className="text-slate-300">Topic Pattern:</label>
            <input
              type="text"
              value={replayPattern}
              onChange={(e) => setReplayPattern(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono w-64"
            />
            <button
              onClick={handleReplay}
              className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
            >
              🔄 Replay Event Stream
            </button>
          </div>

          {replayedEvents.length > 0 && (
            <div className="space-y-2 border-t border-slate-800 pt-4 font-mono text-xs">
              <h4 className="font-bold text-teal-300">Replayed Events ({replayedEvents.length})</h4>
              {replayedEvents.map((ev) => (
                <div key={ev.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                  <span>[{ev.topic}] {ev.id}</span>
                  <span className="text-slate-500">{ev.metadata.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Correlation Trace Subview */}
      {activeSubView === 'trace' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">🔎 Correlation & Trace Inspector</h3>
          <div className="flex gap-4 items-center">
            <label className="text-slate-300">Enter Correlation / Trace ID:</label>
            <input
              type="text"
              placeholder="e.g. corr_ or tr_"
              value={correlationSearch}
              onChange={(e) => setCorrelationSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono w-80"
            />
          </div>

          <div className="space-y-3">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-teal-300">[{ev.topic}] {ev.id}</span>
                  <p className="text-[10px] text-slate-400">Corr: {ev.correlationId} | Trace: {ev.traceId}</p>
                </div>
                <span className="text-emerald-400 font-bold">{ev.state}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
