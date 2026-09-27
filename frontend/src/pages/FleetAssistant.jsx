import React, { useState } from 'react';
import { api } from '../services/api';
import { Bot, Send, Sparkles, RefreshCw, AlertCircle, CheckCircle, ArrowRight, Database, Fuel, Wrench, ShieldAlert } from 'lucide-react';

export default function FleetAssistant({ initialQuestion = '', onSelectQuestion }) {
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      title: 'Welcome to RevRoute AI Fleet Audit Assistant',
      text: `Hello! I am your AI Fleet Audit Assistant. Ask me natural-language questions about your fleet's fuel performance, maintenance costs, baseline comparisons, or open audit issues.\n\nI answer using actual records stored in RevRoute's database.`,
      suggestedQuestions: [
        'Analyze TRK-101 fuel performance',
        'Compare TRK-101 with fuel baseline',
        'Is TRK-101\'s maintenance cost above its baseline?',
        'Show current audit issues for TRK-101',
        'Which vehicles are exceeding their fuel baseline?',
        'Summarize recent fleet issues'
      ]
    }
  ]);

  const handleAsk = async (queryToAsk) => {
    const q = queryToAsk || question;
    if (!q || !q.strip?.() && typeof q !== 'string') return;

    const userMessage = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q);
      const assistantMessage = {
        sender: 'assistant',
        title: res.title,
        text: res.formatted_answer,
        dataFound: res.data_found,
        structuredData: res.structured_data,
        suggestedQuestions: res.suggested_questions
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          title: 'Error Querying Fleet Assistant',
          text: `An error occurred while fetching audit data: ${err.message}`,
          dataFound: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'assistant',
        title: 'Conversation Reset',
        text: 'Conversation history cleared. Ask any new question about your fleet records or baseline comparisons below.',
        suggestedQuestions: [
          'Analyze TRK-101 fuel performance',
          'Compare TRK-101 with fuel baseline',
          'Is TRK-101\'s maintenance cost above its baseline?',
          'Show current audit issues for TRK-101',
          'Which vehicles are exceeding their fuel baseline?'
        ]
      }
    ]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-2">
            <Sparkles size={14} className="text-teal-400" /> RevRoute AI Fleet Audit Assistant
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">AI Fleet Discrepancy & Baseline Assistant</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Query actual vehicle, fuel, maintenance, invoice, driver submission, and baseline audit records using natural language.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw size={14} /> Clear Chat
        </button>
      </div>

      {/* Main Assistant Interface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[600px]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
                  <Bot size={20} />
                </div>
              )}

              <div className={`max-w-3xl space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none text-sm font-medium'
                  : 'bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl rounded-tl-none text-xs text-slate-800'
              }`}>
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles size={15} className="text-blue-600" /> {msg.title || 'RevRoute AI Result'}
                    </h4>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">Database Verified</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed font-sans font-normal text-xs sm:text-sm">
                  {msg.text}
                </div>

                {/* Structured Metrics Callout Grid if available */}
                {msg.structuredData && Object.keys(msg.structuredData).length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Retrieved Metric Summary</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                      {msg.structuredData.actual_efficiency_km_l !== undefined && (
                        <div className="p-2 bg-slate-50 rounded border">
                          <span className="text-[10px] text-slate-500 block">Actual Efficiency</span>
                          <span className="font-bold text-slate-900">{msg.structuredData.actual_efficiency_km_l} km/L</span>
                        </div>
                      )}
                      {msg.structuredData.baseline_efficiency_km_l !== undefined && (
                        <div className="p-2 bg-slate-50 rounded border">
                          <span className="text-[10px] text-slate-500 block">Baseline Efficiency</span>
                          <span className="font-bold text-blue-600">{msg.structuredData.baseline_efficiency_km_l} km/L</span>
                        </div>
                      )}
                      {msg.structuredData.actual_cost !== undefined && (
                        <div className="p-2 bg-slate-50 rounded border">
                          <span className="text-[10px] text-slate-500 block">Actual Cost</span>
                          <span className="font-bold text-slate-900">₹{msg.structuredData.actual_cost.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {msg.structuredData.expected_cost !== undefined && (
                        <div className="p-2 bg-slate-50 rounded border">
                          <span className="text-[10px] text-slate-500 block">Expected Cost</span>
                          <span className="font-bold text-teal-700">₹{msg.structuredData.expected_cost.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {msg.structuredData.cost_overrun !== undefined && (
                        <div className="p-2 bg-slate-50 rounded border">
                          <span className="text-[10px] text-slate-500 block">Overrun Amount</span>
                          <span className="font-bold text-rose-600">₹{msg.structuredData.cost_overrun.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 block">Suggested Quick Questions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((sq, i) => (
                        <button
                          key={i}
                          onClick={() => handleAsk(sq)}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-blue-700 text-[11px] font-medium rounded-lg transition-colors text-left"
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-blue-600 font-semibold p-4 bg-blue-50/60 rounded-xl border border-blue-100 animate-pulse">
              <Bot size={20} className="animate-spin" />
              <span>Analyzing RevRoute database records and calculating baselines...</span>
            </div>
          )}
        </div>

        {/* Question Input Box */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your fleet... (e.g. Compare TRK-101's fuel performance with its baseline)"
              className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <span>Ask RevRoute AI</span>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
