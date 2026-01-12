import { useLocation } from 'react-router-dom';

export function ComingSoonTab() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab') || 'Feature';
  
  const formatTitle = (str: string) => 
    str.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">{formatTitle(tab)}</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        This enterprise feature is coming soon. We're working hard to bring you powerful tools for managing your organization.
      </p>
      <div className="flex gap-2">
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Enterprise Feature
        </span>
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
