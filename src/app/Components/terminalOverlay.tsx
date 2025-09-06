'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TerminalOverlay() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [lines, setLines] = useState([
    '> Initializing UFC Coreverse...',
    '> Connection established',
    '> Loading global OSC data...',
    '> System ready. Try the command "cd about":',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = input.trim();

    if (!command) return;

    // Display the entered command
    setLines((prev) => [...prev, `> ${command}`]);

    // Handle commands
    if (command.startsWith('cd ')) {
      const page = command.split(' ')[1];

      switch (page) {
        case 'projects':
          router.push('/projects');
          setLines((prev) => [...prev, `Navigating to /projects...`]);
          break;
        case 'about':
          router.push('/about');
          setLines((prev) => [...prev, `Navigating to /about...`]);
          break;
        case 'contact':
          router.push('/contact');
          setLines((prev) => [...prev, `Navigating to /contact...`]);
          break;
        case 'events':
          router.push('/events');
          setLines((prev) => [...prev, `Navigating to /events...`]);
          break;
        case 'login':
          router.push('/login');
          setLines((prev) => [...prev, `Navigating to /login...`]);
          break;
        case '..':
        case '/':
        case 'home':
          router.push('/');
          setLines((prev) => [...prev, `Navigating to /`]);
          break;
        default:
          setLines((prev) => [
            ...prev,
            `bash: cd: ${page}: No such directory`,
          ]);
          break;
      }
    } else if (command === 'clear') {
      // Clear terminal
      setLines([]);
    } else if (command === 'help') {
      setLines((prev) => [
        ...prev,
        'Available commands:',
        '  cd projects   → Go to Projects page',
        '  cd about      → Go to About page',
        '  cd contact    → Go to Contact page',
        '  cd / or ..    → Go back Home',
        '  clear         → Clear terminal',
        '  help          → Show this help message',
      ]);
    } else {
      setLines((prev) => [
        ...prev,
        `bash: ${command}: command not found`,
      ]);
    }

    setInput('');
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-6xl px-8">
      <div
        className="rounded-xl p-6 font-mono backdrop-blur-xl border-2"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderColor: '#0B874F',
          boxShadow:
            '0 0 50px rgba(11, 135, 79, 0.3), inset 0 0 30px rgba(11, 135, 79, 0.05)',
        }}
      >
        {/* Terminal header */}
        <div
          className="flex items-center gap-2 mb-4 pb-3 border-b-2"
          style={{ borderColor: '#0B874F' }}
        >
          <div className="flex gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: '#E94B3C' }}
            ></div>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: '#F5A623' }}
            ></div>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: '#0B874F' }}
            ></div>
          </div>
          <span
            className="ml-4 text-base font-bold"
            style={{ color: '#4A90E2' }}
          >
            /ufc/community/activity_feed
          </span>
        </div>

        {/* Terminal content */}
        <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
          {lines.map((line, index) => (
            <div
              key={index}
              className="text-base"
              style={{ color: '#0B874F' }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span
            className="text-base mr-3 font-bold"
            style={{ color: '#F5A623' }}
          >
            {'>'}
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base font-mono border-b-2 pb-1 transition-colors duration-300"
            style={{
              color: '#FFFFFF',
              borderColor: '#333333',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4A90E2';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#333333';
            }}
            placeholder="Enter command..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
