import { useState } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Menu } from 'lucide-react';

const FloatingSidebarTrigger = () => {
  const { open } = useSidebar();
  if (open) return null;
  return (
    <SidebarTrigger className="md:hidden">
      <Menu className="h-5 w-5" />
    </SidebarTrigger>
  );
};

export default function GenerateModulePage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('Missing OpenAI API key (VITE_OPENAI_API_KEY).');
      }
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that creates structured learning modules.' },
            { role: 'user', content: `Generate a learning/study module based on this prompt:\n${prompt}\n\nReturn sections, key points and a short summary.` },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || 'No content generated.';
      setResponse(content.trim());
    } catch (err: any) {
      console.error(err);
      setResponse(err.message || 'Error generating module.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-2">
            <FloatingSidebarTrigger />
            <h1 className="text-2xl font-bold">Generate Module</h1>
          </div>

          <div className="space-y-4 max-w-3xl">
            <Textarea
              placeholder="Describe the module you want..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
            <Button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                'Generate Module'
              )}
            </Button>

            {response && (
              <div className="whitespace-pre-wrap border rounded-md p-4 bg-muted/20">
                {response}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 