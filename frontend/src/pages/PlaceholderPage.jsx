import { Wrench } from 'lucide-react';

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
      <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
        <Wrench size={32} />
      </div>
      <h2 className="text-2xl font-bold text-text-main mb-2">{title}</h2>
      <p className="text-text-muted max-w-md">
        {description || "This module is currently under development. Check back later for updates."}
      </p>
    </div>
  );
}
