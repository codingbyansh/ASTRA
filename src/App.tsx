/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DesignProvider, useDesign } from './store/designStore';
import { Navbar } from './components/Navigation/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { DesignerPage } from './pages/DesignerPage';
import { ClimatePage } from './pages/ClimatePage';
import { MaterialsPage } from './pages/MaterialsPage';
import { SimulationPage } from './pages/SimulationPage';
import { ComparePage } from './pages/ComparePage';
import { OptimizerPage } from './pages/OptimizerPage';
import { ValidationPage } from './pages/ValidationPage';
import { ReportsPage } from './pages/ReportsPage';

const MainLayout: React.FC = () => {
  const { activeView } = useDesign();

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      {/* Top Engineering Navbar */}
      <Navbar />

      {/* Main Engineering Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'overview' && <OverviewPage />}
        {activeView === 'designer' && <DesignerPage />}
        {activeView === 'climate' && <ClimatePage />}
        {activeView === 'materials' && <MaterialsPage />}
        {activeView === 'simulation' && <SimulationPage />}
        {activeView === 'compare' && <ComparePage />}
        {activeView === 'optimize' && <OptimizerPage />}
        {activeView === 'validation' && <ValidationPage />}
        {activeView === 'reports' && <ReportsPage />}
      </main>

      {/* Official Government Engineering Scientific Footer */}
      <footer className="bg-[#0b1b2d] border-t border-[#182d49] py-5 px-6 text-xs text-slate-300 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-200">
              Project ASTRA · Defence Institute of High Altitude Research (DIHAR) · DRDO, Ministry of Defence
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="text-amber-400">ANSI/ASHRAE Standard 140 BESTEST</span>
            <span className="text-emerald-400">ISO 6946 / IS 3792 Compliant</span>
            <span className="text-slate-300">Government of India</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DesignProvider>
      <MainLayout />
    </DesignProvider>
  );
}


