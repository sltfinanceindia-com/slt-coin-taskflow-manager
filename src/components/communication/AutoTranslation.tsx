import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Settings, Globe, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationSettings {
  enabled: boolean;
  auto_detect: boolean;
  source_language: string;
  target_language: string;
  show_original: boolean;
  translate_incoming: boolean;
  translate_outgoing: boolean;
}

interface TranslatedMessage {
  original: string;
  translated: string;
  source_lang: string;
  target_lang: string;
  confidence: number;
}

interface AutoTranslationProps {
  onTranslate: (text: string, targetLang: string) => Promise<string>;
}

export default function AutoTranslation({ onTranslate }: AutoTranslationProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TranslationSettings>({
    enabled: false,
    auto_detect: true,
    source_language: 'auto',
    target_language: 'en',
    show_original: true,
    translate_incoming: true,
    translate_outgoing: false
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState<TranslatedMessage[]>([
    {
      original: 'Bonjour, comment allez-vous?',
      translated: 'Hello, how are you?',
      source_lang: 'fr',
      target_lang: 'en',
      confidence: 0.98
    },
    {
      original: 'La reunión es a las 3 PM',
      translated: 'The meeting is at 3 PM',
      source_lang: 'es',
      target_lang: 'en',
      confidence: 0.95
    }
  ]);

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  const handleToggleTranslation = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    toast({
      title: settings.enabled ? "Translation disabled" : "Translation enabled",
      description: settings.enabled 
        ? "Messages will no longer be auto-translated" 
        : "Messages will now be auto-translated"
    });
  };

  const handleQuickTranslate = async (text: string) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      // Simulate translation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTranslation = {
        original: text,
        translated: `[Translated: ${text}]`, // Mock translation
        source_lang: 'auto',
        target_lang: settings.target_language,
        confidence: 0.92
      };

      setRecentTranslations(prev => [mockTranslation, ...prev.slice(0, 9)]);
      toast({ title: "Message translated successfully" });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Unable to translate message at this time",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Languages className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Auto Translation</h2>
      </div>

      {/* Translation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Translation Settings
            </span>
            <Button
              variant={settings.enabled ? "default" : "outline"}
              onClick={handleToggleTranslation}
            >
              {settings.enabled ? "Enabled" : "Disabled"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Language</label>
              <select
                className="w-full p-2 border rounded-md"
                value={settings.source_language}
                onChange={(e) => setSettings(prev => ({ ...prev, source_language: e.target.value }))}
                disabled={!settings.enabled}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Language</label>
              <select
                className="w-full p-2 border rounded-md"
                value={settings.target_language}
                onChange={(e) => setSettings(prev => ({ ...prev, target_language: e.target.value }))}
                disabled={!settings.enabled}
              >
                {languages.filter(lang => lang.code !== 'auto').map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="translate_incoming"
                checked={settings.translate_incoming}
                onChange={(e) => setSettings(prev => ({ ...prev, translate_incoming: e.target.checked }))}
                disabled={!settings.enabled}
                className="w-4 h-4"
              />
              <label htmlFor="translate_incoming" className="text-sm">
                Auto-translate incoming messages
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="translate_outgoing"
                checked={settings.translate_outgoing}
                onChange={(e) => setSettings(prev => ({ ...prev, translate_outgoing: e.target.checked }))}
                disabled={!settings.enabled}
                className="w-4 h-4"
              />
              <label htmlFor="translate_outgoing" className="text-sm">
                Auto-translate outgoing messages
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_original"
                checked={settings.show_original}
                onChange={(e) => setSettings(prev => ({ ...prev, show_original: e.target.checked }))}
                disabled={!settings.enabled}
                className="w-4 h-4"
              />
              <label htmlFor="show_original" className="text-sm">
                Show original text with translation
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_detect"
                checked={settings.auto_detect}
                onChange={(e) => setSettings(prev => ({ ...prev, auto_detect: e.target.checked }))}
                disabled={!settings.enabled}
                className="w-4 h-4"
              />
              <label htmlFor="auto_detect" className="text-sm">
                Auto-detect source language
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Translate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Quick Translate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter text to translate..."
              className="flex-1 p-2 border rounded-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuickTranslate((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button 
              onClick={() => {
                const input = document.querySelector('input[placeholder="Enter text to translate..."]') as HTMLInputElement;
                if (input) {
                  handleQuickTranslate(input.value);
                  input.value = '';
                }
              }}
              disabled={isTranslating}
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Press Enter or click Translate to quickly translate text
          </div>
        </CardContent>
      </Card>

      {/* Recent Translations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Translations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTranslations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent translations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTranslations.map((translation, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {getLanguageName(translation.source_lang)} → {getLanguageName(translation.target_lang)}
                    </span>
                    <span className={`font-medium ${getConfidenceColor(translation.confidence)}`}>
                      {Math.round(translation.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Original:</span> {translation.original}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Translation:</span> {translation.translated}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Listen
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {languages.filter(lang => lang.code !== 'auto').map(lang => (
              <div key={lang.code} className="p-2 text-sm bg-muted rounded text-center">
                {lang.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}