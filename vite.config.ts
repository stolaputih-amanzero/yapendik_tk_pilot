import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/tests/**', '**/test-results/**', '**/doc/**', '**/dist/**', '**/.git/**']
      },
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            // 1. Heavy PDF / Export Engine (Truly Isolated - ARB Guardrail 4)
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf.js')) {
              return 'vendor-export';
            }
            // 2. Core Vendor Tiers
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (
                id.includes('/react/') || 
                id.includes('/react-dom/') || 
                id.includes('\\react\\') || 
                id.includes('\\react-dom\\') || 
                id.includes('scheduler') || 
                id.includes('motion')
              ) {
                return 'vendor-react';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('@simplewebauthn')) {
                return 'vendor-auth';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-genai';
              }
            }
            // 3. Persona-Aware Workspace Chunks (ARB Guardrail 2)
            if (
              id.includes('/workspaces/foundation/') ||
              id.includes('FoundationAdmissionsTelemetryView') ||
              id.includes('SchoolReviewWorkspace') ||
              id.includes('InstitutionalHealthDashboard')
            ) {
              return 'ws-foundation';
            }
            if (
              id.includes('TeacherHomeShell') ||
              id.includes('TeacherDailyWorkWorkspace') ||
              id.includes('AttendanceWorkspace') ||
              id.includes('ObservationWorkspace') ||
              id.includes('DevelopmentWorkspace') ||
              id.includes('CommunicationWorkspace') ||
              id.includes('StudentJourneyTimeline') ||
              id.includes('/components/attendance/') ||
              id.includes('/components/teacher-daily-work/')
            ) {
              return 'ws-teacher';
            }
            if (
              id.includes('/workspaces/guardian/') ||
              id.includes('GuardianWorkspace') ||
              id.includes('ApplicationDashboard') ||
              id.includes('GuardianDevelopmentTimeline')
            ) {
              return 'ws-guardian';
            }
            if (
              id.includes('/workspaces/school/') ||
              id.includes('HeadmasterAdoptionLayout') ||
              id.includes('HeadmasterAdmissionsDesk') ||
              id.includes('AcademicLifecycleWorkspace') ||
              id.includes('CohortPromotionWorkspace') ||
              id.includes('GraduationRegistryWorkspace')
            ) {
              return 'ws-headmaster';
            }
            if (
              id.includes('DataRosterWorkspace') ||
              id.includes('ProvisioningWorkspace') ||
              id.includes('LivingContractWorkspace') ||
              id.includes('AuthorizationTestingWorkspace') ||
              id.includes('/pages/roster/')
            ) {
              return 'ws-operations';
            }
          },
        },
      },
    },
  };
});
