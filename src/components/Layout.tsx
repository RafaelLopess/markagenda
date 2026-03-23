import { ReactNode } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="mt-14 lg:mt-0 lg:ml-64 p-4 md:p-8">{children}</main>
    </div>
  );
};

export default Layout;
