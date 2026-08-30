/**
 * YAPENDIK SCHOOL OS — STAGE 6-A GUARDIAN WORKSPACE
 * Compassionate Family Continuum & Daily Life Shell
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 * 
 * Rules:
 * - 3-Tab Flat Architecture (Hukum F-7): 'Hari Ini' | 'Momen & Karya' | 'Perkembangan'
 * - Single Child Scope Only (FB-09 & T-2 Server-Derived Scope)
 * - Zero-Surveillance / Zero-Rankings (H-07 & FB-04)
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { briefingEngine } from '../../services/BriefingEngine';
import { GuardianBriefingData } from '../../types/briefingTypes';
import { GuardianBriefing } from '../../components/workspaces/briefing/GuardianBriefing';
import { GuardianMomentsGallery } from './GuardianMomentsGallery';
import { GuardianDevelopmentTimeline } from './GuardianDevelopmentTimeline';
import { SegmentedControl } from '../../components/ui';
import { Heart, Camera, BookOpen, User, RefreshCw } from 'lucide-react';

export type GuardianTab = 'Hari Ini' | 'Momen & Karya' | 'Perkembangan';

export const GuardianWorkspace: React.FC = () => {
  const context = useSecurityContext();
  const currentPersona = context?.currentPersona;
  const schoolId = context?.securityContext?.activeSchoolId || 'sch_tk_maranatha';

  const [activeTab, setActiveTab] = useState<GuardianTab>('Hari Ini');
  const [briefingData, setBriefingData] = useState<GuardianBriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const bData = await briefingEngine.getBriefingDataForUser(
        'GUARDIAN',
        schoolId,
        currentPersona?.personId || currentPersona?.id
      );
      setBriefingData(bData as GuardianBriefingData);
    } catch (err) {
      console.error('Failed to load guardian briefing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId, currentPersona?.personId, currentPersona?.id]);

  const childName = briefingData?.child_name || 'Millen';

  return (
    <div className="w-full min-h-[100dvh] bg-canvas text-ink pb-24 expanded:pb-8 font-sans animate-in fade-in duration-200">
      <main className="max-w-4xl mx-auto px-4 medium:px-6 py-6 space-y-6">
        {/* Top Family Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-line-hairline">
          <div className="flex items-center gap-2 text-xs text-brand-deep font-semibold">
            <Heart className="w-4 h-4 text-brand-primary" />
            <span>Portal Keluarga • TK Yapendik</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-surface-subtle hover-only:bg-line-soft text-ink-soft text-xs transition-colors touch-target-min flex items-center gap-1.5"
              aria-label="Segarkan Kabar"
              title="Segarkan Kabar"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-primary' : ''}`} />
              <span className="hidden compact:inline">Segarkan</span>
            </button>
            <div className="px-3 py-1 rounded-xl bg-surface-subtle border border-line-hairline flex items-center gap-1.5 text-xs text-ink font-medium">
              <User className="w-4 h-4 text-brand-primary" />
              <span>{currentPersona?.name || 'Ibu Julen'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Segmented Control */}
        <div>
          <SegmentedControl
            options={[
              { id: 'Hari Ini', label: 'Hari Ini', icon: Heart },
              { id: 'Momen & Karya', label: 'Momen & Karya', icon: Camera },
              { id: 'Perkembangan', label: 'Perkembangan', icon: BookOpen }
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as GuardianTab)}
            size="md"
            className="w-full"
          />
        </div>

        {/* Tab 1: Hari Ini (The Warm Briefing Surat Sore) */}
        {activeTab === 'Hari Ini' && briefingData && (
          <div className="space-y-4">
            <GuardianBriefing
              data={briefingData}
              onViewMoments={() => setActiveTab('Momen & Karya')}
              onViewDevelopment={() => setActiveTab('Perkembangan')}
            />
          </div>
        )}

        {/* Tab 2: Momen & Karya */}
        {activeTab === 'Momen & Karya' && (
          <GuardianMomentsGallery childName={childName} />
        )}

        {/* Tab 3: Perkembangan & LPPA */}
        {activeTab === 'Perkembangan' && (
          <GuardianDevelopmentTimeline childName={childName} />
        )}
      </main>
    </div>
  );
};
