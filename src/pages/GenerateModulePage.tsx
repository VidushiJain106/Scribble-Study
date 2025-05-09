import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Dashboard/Sidebar';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Menu } from 'lucide-react';
import OpenAI from 'openai';
import ModuleViewer from '@/components/ModuleViewer';

// Utility to extract first-level heading to use as category
const extractCategory = (md: string) => {
  const match = md.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Uncategorized';
};

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
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [savedModules, setSavedModules] = useState<{ [category: string]: string[] }>({});
  const [loading, setLoading] = useState(false);

  // Load saved modules from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedModules');
    if (saved) {
      try {
        setSavedModules(JSON.parse(saved));
      } catch {
        // Invalid JSON – ignore
      }
    }
  }, []);

  // Persist saved modules whenever they change
  useEffect(() => {
    localStorage.setItem('savedModules', JSON.stringify(savedModules));
  }, [savedModules]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    setSelectedModule('');
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('Missing OpenAI API key (VITE_OPENAI_API_KEY).');
      }

      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that creates structured learning modules.' },
          {
            role: 'user',
            content: `Generate a learning/study module based on the following topic:\n${prompt}\n\nReturn the module in **Markdown** using exactly this structure (important for automated parsing):\n\n# <Overall Course Title>\n\n## Module Title: <Descriptive Module Title>\n\n### Section 1: <Section Name> (<Date Range>)\n#### Key Points:\n- Point 1\n- Point 2\n#### Summary:\nBrief summary paragraph.\n\n---\n\n### Section 2: <Section Name> (<Date Range>)\n#### Key Points:\n- Point 1\n- Point 2\n#### Summary:\nBrief summary paragraph.\n\n---\n\n(Continue for as many sections as needed.)\n\nMake sure to follow **exactly** the same Markdown heading levels and delimiter (---) so that the content can be parsed programmatically.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = completion.choices?.[0]?.message?.content?.trim() || 'No content generated.';
      setResponse(content);
    } catch (err: any) {
      console.error(err);
      setResponse(err?.message || 'Error generating module.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!response) return;
    const category = extractCategory(response);
    const updated = { ...savedModules };
    if (!updated[category]) updated[category] = [];
    updated[category].push(response);
    setSavedModules(updated);
  };

  const handleDeleteModule = (category: string, index: number) => {
    const updated = { ...savedModules };
    updated[category] = [...updated[category]];
    updated[category].splice(index, 1);
    if (updated[category].length === 0) delete updated[category];
    setSavedModules(updated);
    if (selectedModule && selectedModule === savedModules[category]?.[index]) {
      setSelectedModule('');
    }
  };

  const handleEditModule = (category: string, index: number) => {
    const mod = savedModules[category][index];
    setPrompt(mod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayContent = selectedModule || response;

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
            <div className="flex gap-4 flex-wrap">
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
                <Button variant="outline" onClick={handleSave}>
                  Save Module
                </Button>
              )}
            </div>

            {displayContent && <ModuleViewer content={displayContent} />}

            {/* Browse Saved Modules Section */}
            {Object.keys(savedModules).length > 0 && (
              <section className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold">Browse Saved Modules by Category</h2>

                {Object.entries(savedModules).map(([category, modules]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold">{category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modules.map((mod, idx) => (
                        <div key={idx} className="p-4 border rounded-md bg-muted/10 flex flex-col gap-3">
                          <div className="font-medium">Module {idx + 1}</div>
                          <div className="flex flex-wrap gap-2 mt-auto">
                            <Button size="sm" onClick={() => setSelectedModule(mod)}>
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditModule(category, idx)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteModule(category, idx)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}