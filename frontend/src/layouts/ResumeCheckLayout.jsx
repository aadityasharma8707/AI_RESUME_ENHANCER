import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProductSectionNav from '../components/ProductSectionNav';
import ResumeCheckSidebar from '../components/ResumeCheckSidebar';

export default function ResumeCheckLayout() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <TopBar onSearch={setSearchQuery} />
      <ProductSectionNav />
      <div className="flex flex-1 max-w-screen-2xl w-full mx-auto">
        <ResumeCheckSidebar />
        <main className="flex-1 w-full overflow-y-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
