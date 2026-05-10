import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { compilerAPI } from '../../utils/api';
import { Play, RotateCcw, Copy, Download, Terminal, ChevronDown, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

const LANGUAGES = [
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'python', label: 'Python', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'c', label: 'C', monaco: 'c' },
];

const DEFAULT_TEMPLATES = {
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Your code here\n    cout << "Hello, Future Bridge!" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello, Future Bridge!");\n    }\n}`,
  python: `def main():\n    # Your code here\n    print("Hello, Future Bridge!")\n\nif __name__ == "__main__":\n    main()`,
  javascript: `// Your code here\nconsole.log("Hello, Future Bridge!");`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, Future Bridge!\\n");\n    return 0;\n}`,
};

const STATUS_COLORS = { 3: 'text-green-400', 4: 'text-red-400', 5: 'text-red-400', 6: 'text-red-400', 11: 'text-red-400' };

const CodeEditor = () => {
  const { isDark } = useTheme();
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_TEMPLATES.cpp);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('output');

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_TEMPLATES[lang]);
    setOutput(null);
  };

  const handleRun = async () => {
    if (!code.trim()) return toast.error('Please write some code first');
    setRunning(true);
    setOutput(null);
    setActiveTab('output');
    try {
      const res = await compilerAPI.execute({ code, language, input });
      setOutput(res.result);
      if (res.result?.status?.id === 3) toast.success('Code executed successfully!');
      else toast.error('Execution failed. Check output.');
    } catch (err) {
      toast.error(err.message || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = () => { navigator.clipboard.writeText(code); toast.success('Code copied!'); };
  const handleReset = () => { setCode(DEFAULT_TEMPLATES[language]); setOutput(null); toast.success('Editor reset'); };
  const handleDownload = () => {
    const exts = { cpp: 'cpp', java: 'java', python: 'py', javascript: 'js', c: 'c' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `solution.${exts[language]}`; a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const getOutputContent = () => {
    if (!output) return null;
    if (output.compile_output) return { type: 'error', text: output.compile_output, label: 'Compilation Error' };
    if (output.stderr) return { type: 'error', text: output.stderr, label: 'Runtime Error' };
    if (output.stdout !== undefined) return { type: 'success', text: output.stdout || '(empty output)', label: output.status?.description || 'Accepted' };
    return { type: 'info', text: 'No output', label: output.status?.description || 'Done' };
  };

  const outputContent = getOutputContent();
  const statusColor = output ? (STATUS_COLORS[output.status?.id] || 'text-gray-400') : '';

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] gap-3 animate-fade-in">
      {/* Toolbar */}
      <div className="card p-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-gray-900 dark:text-white text-sm hidden sm:block">Code Editor</h1>
          <div className="relative">
            <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="input py-1.5 pr-8 text-sm appearance-none cursor-pointer min-w-[130px]">
              {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="btn-outline btn-sm flex items-center gap-1.5 text-xs"><Copy size={13} /> Copy</button>
          <button onClick={handleDownload} className="btn-outline btn-sm flex items-center gap-1.5 text-xs"><Download size={13} /> Save</button>
          <button onClick={handleReset} className="btn-outline btn-sm flex items-center gap-1.5 text-xs"><RotateCcw size={13} /> Reset</button>
          <button onClick={handleRun} disabled={running} className="btn-primary btn-sm flex items-center gap-1.5 text-xs px-4">
            {running ? <Loader size={13} className="animate-spin" /> : <Play size={13} />}
            {running ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1 min-h-0">
        {/* Editor */}
        <div className="flex-1 card overflow-hidden min-h-[300px]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-500 font-mono ml-2">solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language}</span>
          </div>
          <Editor
            height="calc(100% - 37px)"
            language={LANGUAGES.find(l => l.id === language)?.monaco || language}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              smoothScrolling: true,
              scrollbar: { verticalScrollbarSize: 6 },
            }}
          />
        </div>

        {/* Right Panel */}
        <div className="lg:w-80 flex flex-col gap-3">
          {/* Input */}
          <div className="card flex-shrink-0">
            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Terminal size={14} /> Standard Input</h3>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter stdin here..."
              className="w-full bg-transparent p-3 text-sm font-mono text-gray-700 dark:text-gray-300 resize-none focus:outline-none placeholder-gray-400 h-28"
            />
          </div>

          {/* Output */}
          <div className="card flex-1 min-h-0 flex flex-col">
            <div className="flex border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              {['output', 'info'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={clsx('px-4 py-2.5 text-sm font-medium capitalize transition-colors', activeTab === tab ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
                  {tab}
                </button>
              ))}
              {output && <div className="ml-auto px-4 flex items-center"><span className={clsx('text-xs font-medium', statusColor)}>{output.status?.description}</span></div>}
            </div>
            <div className="p-3 overflow-y-auto flex-1 font-mono text-sm">
              {activeTab === 'output' && (
                running ? (
                  <div className="flex items-center gap-2 text-yellow-500"><Loader size={14} className="animate-spin" /><span>Executing...</span></div>
                ) : outputContent ? (
                  <div>
                    <div className={clsx('text-xs font-semibold mb-2', outputContent.type === 'success' ? 'text-green-500' : 'text-red-400')}>
                      {outputContent.type === 'success' ? '✅' : '❌'} {outputContent.label}
                    </div>
                    <pre className={clsx('whitespace-pre-wrap break-words', outputContent.type === 'success' ? 'text-gray-700 dark:text-gray-300' : 'text-red-400')}>
                      {outputContent.text}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center mt-8 text-gray-400">
                    <Terminal size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Click "Run Code" to see output</p>
                  </div>
                )
              )}
              {activeTab === 'info' && output && (
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Status', value: output.status?.description, color: statusColor },
                    { label: 'Time', value: output.time ? `${output.time}s` : 'N/A' },
                    { label: 'Memory', value: output.memory ? `${(output.memory / 1024).toFixed(1)} MB` : 'N/A' },
                    { label: 'Language', value: language.toUpperCase() },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className={clsx('font-medium', color || 'text-gray-700 dark:text-gray-300')}>{value}</span>
                    </div>
                  ))}
                  {output.isDemo && <p className="text-yellow-500 text-xs mt-2">Demo mode. Add JUDGE0_API_KEY for real execution.</p>}
                </div>
              )}
              {activeTab === 'info' && !output && <p className="text-gray-400 text-xs text-center mt-8">Run code to see execution info</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
