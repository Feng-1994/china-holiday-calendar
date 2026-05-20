import CalendarNav from '@/components/CalendarNav';
import CalendarGrid from '@/components/CalendarGrid';
import LeftInfoPanel from '@/components/LeftInfoPanel';
import RightInfoPanel from '@/components/RightInfoPanel';

const isElectron = typeof window !== 'undefined' && window.__ELECTRON__;

export default function Home() {
  return (
    <div
      className={
        isElectron
          ? 'relative flex h-[720px] w-[1200px] overflow-hidden'
          : 'relative flex min-h-screen items-center justify-center overflow-hidden p-4'
      }
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {!isElectron && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--blur-blob1)' }} />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--blur-blob2)' }} />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" style={{ backgroundColor: 'var(--blur-blob3)' }} />
        </div>
      )}

      <div
        className={
          isElectron
            ? 'relative z-10 flex h-full w-full gap-0'
            : 'relative z-10 flex w-full max-w-[1400px] gap-4'
        }
      >
        <div
          className={
            isElectron
              ? 'w-[240px] flex-shrink-0 overflow-y-auto border-r'
              : 'hidden w-[280px] flex-shrink-0 overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl lg:block'
          }
          style={{
            backgroundColor: 'var(--bg-card-alpha)',
            borderColor: 'var(--border-color)',
          }}
        >
          <LeftInfoPanel />
        </div>

        <div
          className={
            isElectron
              ? 'flex-1 overflow-y-auto rounded-none border-0 shadow-none'
              : 'flex-1 overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl'
          }
          style={{
            backgroundColor: 'var(--bg-card-alpha)',
            borderColor: isElectron ? 'transparent' : 'var(--border-color)',
          }}
        >
          <CalendarNav />
          <CalendarGrid />
        </div>

        <div
          className={
            isElectron
              ? 'w-[240px] flex-shrink-0 overflow-y-auto border-l'
              : 'hidden w-[280px] flex-shrink-0 overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl lg:block'
          }
          style={{
            backgroundColor: 'var(--bg-card-alpha)',
            borderColor: 'var(--border-color)',
          }}
        >
          <RightInfoPanel />
        </div>
      </div>
    </div>
  );
}
