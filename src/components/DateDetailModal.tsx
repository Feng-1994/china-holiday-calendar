import { X } from 'lucide-react';
import { getDayInfo } from '@/utils/holidayData';
import { getLunarInfo } from '@/utils/lunarCalendar';
import { getSolarHoliday } from '@/utils/solarHolidays';
import { getAlmanac } from '@/utils/almanac';
import { getFestivalInfo, type FestivalInfo } from '@/utils/festivalInfo';

interface DateDetailModalProps {
  date: string;
  onClose: () => void;
}

export default function DateDetailModal({ date, onClose }: DateDetailModalProps) {
  const [year, month, day] = date.split('-').map(Number);
  const info = getDayInfo(year, month, day);
  const lunar = getLunarInfo(year, month, day);
  const solarHoliday = getSolarHoliday(year, month, day);
  const almanac = getAlmanac(year, month, day);

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dateObj = new Date(year, month - 1, day);
  const weekDay = weekDays[dateObj.getDay()];

  const isHoliday = info.status === 'holiday_rest';
  const isWorkday = info.status === 'holiday_work';
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

  const statusText = isHoliday ? '假期' : isWorkday ? '调休上班' : isWeekend ? '周末' : '工作日';

  const festivalNames: string[] = [];
  if (info.holidayName) festivalNames.push(info.holidayName);
  if (solarHoliday) festivalNames.push(solarHoliday.name);
  if (lunar.lunarMonth === 1 && lunar.lunarDay === 1) festivalNames.push('春节');
  if (lunar.lunarMonth === 1 && lunar.lunarDay === 15) festivalNames.push('元宵节');
  if (lunar.lunarMonth === 5 && lunar.lunarDay === 5) festivalNames.push('端午节');
  if (lunar.lunarMonth === 8 && lunar.lunarDay === 15) festivalNames.push('中秋节');
  if (lunar.lunarMonth === 9 && lunar.lunarDay === 9) festivalNames.push('重阳节');
  if (lunar.lunarMonth === 12 && lunar.lunarDay === 8) festivalNames.push('腊八节');
  if (lunar.lunarMonth === 12 && lunar.lunarDay === 23) festivalNames.push('小年');
  if (lunar.lunarMonth === 12 && lunar.lunarDay === 30) festivalNames.push('除夕');

  const festivalInfos = festivalNames
    .map((name) => getFestivalInfo(name))
    .filter((f): f is FestivalInfo => f !== null);

  const primaryFestival = festivalInfos[0];

  return (
    <>
      <div
        className="absolute inset-0 z-40 backdrop-blur-sm"
        style={{ backgroundColor: 'var(--overlay)' }}
        onClick={onClose}
      />
      <div
        className="absolute left-1/2 top-1/2 z-50 w-[360px] max-h-[90%] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border p-5 shadow-2xl"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--detail-card-bg)' }}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <X className="h-4 w-4" />
        </button>

        {primaryFestival && (
          <div
            className="mb-4 -mx-5 -mt-5 p-5 rounded-t-2xl"
            style={{ background: 'linear-gradient(135deg, var(--vermilion-bg), var(--amber-bg))' }}
          >
            <div className="text-3xl mb-2">{primaryFestival.emoji}</div>
            <div className="font-lxgw text-xl font-bold" style={{ color: 'var(--vermilion)' }}>
              {primaryFestival.name}
            </div>
            {primaryFestival.greeting && (
              <div className="font-lxgw text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {primaryFestival.greeting}
              </div>
            )}
            <div className="font-lxgw text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {primaryFestival.intro}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {primaryFestival.customs.map((c, i) => (
                <span
                  key={i}
                  className="rounded-md px-2 py-0.5 font-lxgw text-[10px]"
                  style={{ background: 'var(--vermilion-bg)', color: 'var(--vermilion)', border: '1px solid var(--vermilion-border)' }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-baseline gap-3">
            <span className="font-lxgw text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {month}月{day}日
            </span>
            <span className="font-lxgw text-sm" style={{ color: 'var(--text-muted)' }}>{weekDay}</span>
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className="rounded-lg px-2 py-0.5 font-lxgw text-xs font-medium"
              style={{
                backgroundColor: isHoliday ? 'var(--vermilion-bg)' : isWorkday ? 'var(--amber-bg)' : isWeekend ? 'var(--pine-bg)' : 'var(--bg-hover)',
                color: isHoliday ? 'var(--vermilion)' : isWorkday ? 'var(--amber)' : isWeekend ? 'var(--pine)' : 'var(--text-muted)',
              }}
            >
              {statusText}
            </span>
            <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>
              农历{lunar.lunarMonth}月{lunar.lunarDayName}
            </span>
            <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>
              {lunar.zodiac}年
            </span>
          </div>

          {!primaryFestival && festivalNames.length > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {festivalNames.map((name, i) => (
                <span key={i} className="rounded-lg px-2 py-0.5 font-lxgw text-xs font-medium" style={{ background: 'var(--pine-bg)', color: 'var(--pine)' }}>
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-3 mb-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
          <div className="font-lxgw text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>黄历</div>

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
            <Row label="年柱" value={almanac.yearGanZhi} valueStyle={{ color: 'var(--text-primary)' }} />
            <Row label="月柱" value={almanac.monthGanZhi} valueStyle={{ color: 'var(--text-primary)' }} />
            <Row label="日柱" value={almanac.dayGanZhi} valueStyle={{ color: 'var(--vermilion)' }} />
            <Row label="五行" value={almanac.dayWuXing} valueStyle={{ color: 'var(--amber)' }} />
            <Row label="冲煞" value={almanac.chong} valueStyle={{ color: 'var(--vermilion)' }} />
            <Row label="煞方" value={almanac.sha} valueStyle={{ color: 'var(--text-secondary)' }} />
          </div>

          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{almanac.pengZu}</div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <div className="font-lxgw text-[10px] font-medium mb-1" style={{ color: 'var(--pine)' }}>宜</div>
              <div className="flex flex-wrap gap-1">
                {almanac.yi.map((item, i) => (
                  <span key={i} className="rounded px-1.5 py-0.5 font-lxgw text-[10px]" style={{ background: 'var(--pine-bg)', color: 'var(--pine)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="font-lxgw text-[10px] font-medium mb-1" style={{ color: 'var(--vermilion)' }}>忌</div>
              <div className="flex flex-wrap gap-1">
                {almanac.ji.map((item, i) => (
                  <span key={i} className="rounded px-1.5 py-0.5 font-lxgw text-[10px]" style={{ background: 'var(--vermilion-bg)', color: 'var(--vermilion)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {festivalInfos.length > 1 && (
          <div className="space-y-3">
            {festivalInfos.slice(1).map((f, i) => (
              <div key={i} className="rounded-xl border p-3" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{f.emoji}</span>
                  <span className="font-lxgw text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                </div>
                <div className="font-lxgw text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {f.intro}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.customs.map((c, j) => (
                    <span key={j} className="rounded px-1.5 py-0.5 font-lxgw text-[10px]" style={{ background: 'var(--pine-bg)', color: 'var(--pine)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {lunar.solarTerm && (
          <div className="mt-3 rounded-xl border p-3" style={{ borderColor: 'var(--amber-border)', background: 'var(--amber-bg)' }}>
            <div className="flex items-center gap-2">
              <span className="text-base">☀️</span>
              <span className="font-lxgw text-sm font-bold" style={{ color: 'var(--amber)' }}>{lunar.solarTerm}</span>
            </div>
            <div className="font-lxgw text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              二十四节气之一，{lunar.solarTerm}时节，天地气机变化，万物应时而动。
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, valueStyle }: { label: string; value: string; valueStyle: React.CSSProperties }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="font-lxgw text-xs font-medium" style={valueStyle}>{value}</span>
    </div>
  );
}
