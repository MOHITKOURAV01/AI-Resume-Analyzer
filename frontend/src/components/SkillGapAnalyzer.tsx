import { useState, useMemo, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  lastUsed: string;
  endorsements: number;
  category: string;
}

interface MarketSkill {
  name: string;
  demandScore: number;      // 0-100
  avgSalary: number;        // in $K
  growthRate: number;       // % YoY
  jobOpenings: number;
  category: string;
  topCompanies: string[];
  learningResources: LearningResource[];
}

interface LearningResource {
  title: string;
  provider: string;
  type: 'course' | 'certification' | 'book' | 'project' | 'bootcamp';
  duration: string;
  rating: number;
  price: string;
  url: string;
}

interface SkillGap {
  skill: string;
  currentLevel: string;
  requiredLevel: string;
  demandScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedLearningTime: string;
  salaryImpact: number;
}

interface CareerPath {
  id: string;
  title: string;
  matchScore: number;
  requiredSkills: string[];
  missingSkills: string[];
  avgSalary: string;
  growthOutlook: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

interface IndustryTrend {
  skill: string;
  trend: 'rising' | 'stable' | 'declining';
  changePercent: number;
  timeframe: string;
}

/* ─── Mock Data ─────────────────────────────────────────────────────── */
const USER_SKILLS: Skill[] = [
  { name: 'JavaScript', level: 'advanced', yearsOfExperience: 5, lastUsed: '2026-08', endorsements: 24, category: 'Frontend' },
  { name: 'React', level: 'advanced', yearsOfExperience: 4, lastUsed: '2026-08', endorsements: 18, category: 'Frontend' },
  { name: 'TypeScript', level: 'intermediate', yearsOfExperience: 3, lastUsed: '2026-08', endorsements: 12, category: 'Frontend' },
  { name: 'Python', level: 'intermediate', yearsOfExperience: 2, lastUsed: '2026-06', endorsements: 8, category: 'Backend' },
  { name: 'Node.js', level: 'intermediate', yearsOfExperience: 3, lastUsed: '2026-07', endorsements: 10, category: 'Backend' },
  { name: 'SQL', level: 'beginner', yearsOfExperience: 1, lastUsed: '2026-03', endorsements: 4, category: 'Database' },
  { name: 'Git', level: 'advanced', yearsOfExperience: 5, lastUsed: '2026-08', endorsements: 15, category: 'DevOps' },
  { name: 'CSS', level: 'advanced', yearsOfExperience: 5, lastUsed: '2026-08', endorsements: 14, category: 'Frontend' },
  { name: 'HTML', level: 'expert', yearsOfExperience: 6, lastUsed: '2026-08', endorsements: 20, category: 'Frontend' },
  { name: 'REST APIs', level: 'advanced', yearsOfExperience: 4, lastUsed: '2026-08', endorsements: 16, category: 'Backend' },
  { name: 'Docker', level: 'beginner', yearsOfExperience: 1, lastUsed: '2026-02', endorsements: 3, category: 'DevOps' },
  { name: 'AWS', level: 'beginner', yearsOfExperience: 0.5, lastUsed: '2026-01', endorsements: 2, category: 'Cloud' },
];

const MARKET_SKILLS: MarketSkill[] = [
  {
    name: 'React', demandScore: 95, avgSalary: 120, growthRate: 12, jobOpenings: 48500,
    category: 'Frontend', topCompanies: ['Meta', 'Netflix', 'Airbnb', 'Stripe'],
    learningResources: [
      { title: 'Advanced React Patterns', provider: 'Frontend Masters', type: 'course', duration: '12h', rating: 4.9, price: '$39/mo', url: '#' },
      { title: 'React Performance', provider: 'Udemy', type: 'course', duration: '8h', rating: 4.7, price: '$19.99', url: '#' },
    ],
  },
  {
    name: 'TypeScript', demandScore: 92, avgSalary: 118, growthRate: 18, jobOpenings: 42000,
    category: 'Frontend', topCompanies: ['Microsoft', 'Google', 'Slack', 'Shopify'],
    learningResources: [
      { title: 'TypeScript Deep Dive', provider: 'Book', type: 'book', duration: '20h', rating: 4.8, price: 'Free', url: '#' },
      { title: 'TypeScript Mastery', provider: 'Pluralsight', type: 'course', duration: '15h', rating: 4.6, price: '$29/mo', url: '#' },
    ],
  },
  {
    name: 'Python', demandScore: 90, avgSalary: 125, growthRate: 15, jobOpenings: 52000,
    category: 'Backend', topCompanies: ['Google', 'Netflix', 'Spotify', 'Dropbox'],
    learningResources: [
      { title: 'Python for Data Science', provider: 'Coursera', type: 'course', duration: '25h', rating: 4.8, price: '$49/mo', url: '#' },
      { title: 'AWS Certified Developer', provider: 'AWS', type: 'certification', duration: '40h', rating: 4.9, price: '$300', url: '#' },
    ],
  },
  {
    name: 'AWS', demandScore: 88, avgSalary: 130, growthRate: 20, jobOpenings: 38000,
    category: 'Cloud', topCompanies: ['Amazon', 'IBM', 'Deloitte', 'Accenture'],
    learningResources: [
      { title: 'AWS Solutions Architect', provider: 'AWS', type: 'certification', duration: '60h', rating: 4.9, price: '$300', url: '#' },
      { title: 'Cloud Practitioner', provider: 'A Cloud Guru', type: 'course', duration: '20h', rating: 4.7, price: '$35/mo', url: '#' },
    ],
  },
  {
    name: 'Docker', demandScore: 82, avgSalary: 115, growthRate: 14, jobOpenings: 28000,
    category: 'DevOps', topCompanies: ['Docker Inc', 'Google', 'Red Hat', 'Microsoft'],
    learningResources: [
      { title: 'Docker for Developers', provider: 'Docker', type: 'course', duration: '10h', rating: 4.8, price: 'Free', url: '#' },
      { title: 'Docker Deep Dive', provider: 'Udemy', type: 'book', duration: '15h', rating: 4.7, price: '$14.99', url: '#' },
    ],
  },
  {
    name: 'Kubernetes', demandScore: 85, avgSalary: 135, growthRate: 22, jobOpenings: 24000,
    category: 'DevOps', topCompanies: ['Google', 'Red Hat', 'Microsoft', 'IBM'],
    learningResources: [
      { title: 'CKA Certification', provider: 'Linux Foundation', type: 'certification', duration: '50h', rating: 4.9, price: '$395', url: '#' },
      { title: 'Kubernetes in Action', provider: 'Manning', type: 'book', duration: '30h', rating: 4.8, price: '$45', url: '#' },
    ],
  },
  {
    name: 'GraphQL', demandScore: 72, avgSalary: 122, growthRate: 16, jobOpenings: 15000,
    category: 'Backend', topCompanies: ['Meta', 'GitHub', 'Shopify', 'Twitter'],
    learningResources: [
      { title: 'GraphQL Complete Guide', provider: 'Udemy', type: 'course', duration: '14h', rating: 4.7, price: '$19.99', url: '#' },
      { title: 'Learning GraphQL', provider: "O'Reilly", type: 'book', duration: '18h', rating: 4.6, price: '$35', url: '#' },
    ],
  },
  {
    name: 'SQL', demandScore: 80, avgSalary: 105, growthRate: 5, jobOpenings: 35000,
    category: 'Database', topCompanies: ['Oracle', 'Microsoft', 'PostgreSQL', 'Snowflake'],
    learningResources: [
      { title: 'SQL Masterclass', provider: 'DataCamp', type: 'course', duration: '12h', rating: 4.8, price: '$25/mo', url: '#' },
      { title: 'Advanced SQL', provider: 'LeetCode', type: 'bootcamp', duration: '8h', rating: 4.7, price: '$35/mo', url: '#' },
    ],
  },
  {
    name: 'Next.js', demandScore: 78, avgSalary: 128, growthRate: 25, jobOpenings: 20000,
    category: 'Frontend', topCompanies: ['Vercel', 'TikTok', 'Hulu', 'Twitch'],
    learningResources: [
      { title: 'Next.js 15 Course', provider: 'Vercel', type: 'course', duration: '10h', rating: 4.9, price: 'Free', url: '#' },
      { title: 'Next.js in Production', provider: 'Frontend Masters', type: 'course', duration: '6h', rating: 4.8, price: '$39/mo', url: '#' },
    ],
  },
  {
    name: 'PostgreSQL', demandScore: 76, avgSalary: 110, growthRate: 8, jobOpenings: 22000,
    category: 'Database', topCompanies: ['Supabase', 'PostgreSQL', 'AWS', 'Google'],
    learningResources: [
      { title: 'PostgreSQL Complete', provider: 'Udemy', type: 'course', duration: '16h', rating: 4.7, price: '$19.99', url: '#' },
      { title: 'PostgreSQL Administration', provider: 'Pluralsight', type: 'course', duration: '12h', rating: 4.6, price: '$29/mo', url: '#' },
    ],
  },
];

const INDUSTRY_TRENDS: IndustryTrend[] = [
  { skill: 'AI/ML Integration', trend: 'rising', changePercent: 45, timeframe: '2024-2026' },
  { skill: 'TypeScript', trend: 'rising', changePercent: 22, timeframe: '2024-2026' },
  { skill: 'Rust', trend: 'rising', changePercent: 38, timeframe: '2024-2026' },
  { skill: 'Next.js', trend: 'rising', changePercent: 30, timeframe: '2024-2026' },
  { skill: 'jQuery', trend: 'declining', changePercent: -25, timeframe: '2024-2026' },
  { skill: 'Angular.js (v1)', trend: 'declining', changePercent: -40, timeframe: '2024-2026' },
  { skill: 'PHP', trend: 'stable', changePercent: 2, timeframe: '2024-2026' },
  { skill: 'React', trend: 'stable', changePercent: 8, timeframe: '2024-2026' },
  { skill: 'Kubernetes', trend: 'rising', changePercent: 28, timeframe: '2024-2026' },
  { skill: 'Edge Computing', trend: 'rising', changePercent: 55, timeframe: '2024-2026' },
];

/* ─── Helper Functions ──────────────────────────────────────────────── */
const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert'];

function levelIndex(l: string): number {
  return LEVEL_ORDER.indexOf(l);
}

function priorityColor(p: string): string {
  switch (p) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
}

function trendIcon(t: string): string {
  switch (t) {
    case 'rising': return '📈';
    case 'declining': return '📉';
    case 'stable': return '➡️';
    default: return '❓';
  }
}

function trendColor(t: string): string {
  switch (t) {
    case 'rising': return '#22c55e';
    case 'declining': return '#ef4444';
    case 'stable': return '#eab308';
    default: return '#6b7280';
  }
}

function difficultyColor(d: string): string {
  switch (d) {
    case 'easy': return '#22c55e';
    case 'moderate': return '#eab308';
    case 'challenging': return '#ef4444';
    default: return '#6b7280';
  }
}

/* ─── Sub-Components ────────────────────────────────────────────────── */
function KPICard({ label, value, subtitle, color }: {
  label: string; value: string | number; subtitle: string; color: string;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 16px',
      border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', flex: '1 1 0',
      minWidth: 140,
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{subtitle}</div>
    </div>
  );
}

function SkillCard({ skill, market, onClick }: {
  skill: Skill; market?: MarketSkill; onClick?: () => void;
}) {
  const levelWidth = ((levelIndex(skill.level) + 1) / 4) * 100;
  const levelColors: Record<string, string> = {
    beginner: '#94a3b8', intermediate: '#3b82f6', advanced: '#8b5cf6', expert: '#f59e0b',
  };
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14,
      border: '1px solid rgba(255,255,255,0.08)', cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,0.4)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>{skill.name}</span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
          background: `${levelColors[skill.level]}20`, color: levelColors[skill.level],
          textTransform: 'capitalize',
        }}>{skill.level}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${levelWidth}%`, background: levelColors[skill.level], borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
        <span>{skill.yearsOfExperience}y exp</span>
        <span>{skill.endorsements} endorsements</span>
        {market && <span style={{ color: '#22c55e' }}>🔥 {market.demandScore}% demand</span>}
      </div>
    </div>
  );
}

function GapItem({ gap, onResourceClick }: { gap: SkillGap; onResourceClick?: () => void }) {
  const prioBorder = priorityColor(gap.priority);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14,
      borderLeft: `4px solid ${prioBorder}`, marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>{gap.skill}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
          background: `${prioBorder}20`, color: prioBorder, textTransform: 'uppercase',
        }}>{gap.priority}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
        <span>Current: <b style={{ color: '#64748b' }}>{gap.currentLevel}</b></span>
        <span>→</span>
        <span>Target: <b style={{ color: '#e2e8f0' }}>{gap.requiredLevel}</b></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
        <span>⏱ {gap.estimatedLearningTime}</span>
        <span>💰 +${gap.salaryImpact}K salary impact</span>
        <span>📊 {gap.demandScore}% market demand</span>
      </div>
    </div>
  );
}

function CareerPathCard({ path }: { path: CareerPath }) {
  const matchColor = path.matchScore >= 80 ? '#22c55e' : path.matchScore >= 60 ? '#eab308' : '#ef4444';
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#e2e8f0' }}>{path.title}</span>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', border: `3px solid ${matchColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
          fontSize: 14, color: matchColor,
        }}>{path.matchScore}%</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 20 }}>💰 {path.avgSalary}</span>
        <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 20 }}>📈 {path.growthOutlook}</span>
        <span style={{ fontSize: 11, color: difficultyColor(path.difficulty), background: `${difficultyColor(path.difficulty)}15`, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>🎯 {path.difficulty}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>✅ Have ({path.requiredSkills.length - path.missingSkills.length})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {path.requiredSkills.filter(s => !path.missingSkills.includes(s)).map(s => (
            <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: '#22c55e20', color: '#22c55e' }}>{s}</span>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>❌ Missing ({path.missingSkills.length})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {path.missingSkills.map(s => (
            <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: '#ef444420', color: '#ef4444' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: LearningResource }) {
  const typeColors: Record<string, string> = {
    course: '#3b82f6', certification: '#8b5cf6', book: '#f59e0b', project: '#22c55e', bootcamp: '#ef4444',
  };
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12,
      border: '1px solid rgba(255,255,255,0.08)', minWidth: 220,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
          background: `${typeColors[resource.type]}20`, color: typeColors[resource.type],
          textTransform: 'capitalize',
        }}>{resource.type}</span>
        <span style={{ fontSize: 11, color: '#f59e0b' }}>⭐ {resource.rating}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>{resource.title}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{resource.provider} · {resource.duration}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#8b5cf6' }}>{resource.price}</span>
        <span style={{
          fontSize: 11, padding: '4px 12px', borderRadius: 8, background: '#8b5cf6', color: '#fff',
          cursor: 'pointer', fontWeight: 600,
        }}>View →</span>
      </div>
    </div>
  );
}

function TrendRow({ trend }: { trend: IndustryTrend }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{trendIcon(trend.trend)}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{trend.skill}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{trend.timeframe}</span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: trendColor(trend.trend),
        }}>{trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%</span>
      </div>
    </div>
  );
}

/* ─── Donut Chart ───────────────────────────────────────────────────── */
function SkillDonut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  let cumAngle = -90;
  const cx = 60, cy = 60, r = 45;
  const paths = segments.map(seg => {
    const startAngle = (cumAngle * Math.PI) / 180;
    const segAngle = (seg.value / total) * 360;
    cumAngle += segAngle;
    const endAngle = (cumAngle * Math.PI) / 180;
    const largeArc = segAngle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: seg.color, label: seg.label, value: seg.value };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity={0.85} />)}
        <circle cx={cx} cy={cy} r={28} fill="#0f172a" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize={16} fontWeight={800}>{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize={8}>skills</text>
      </svg>
      <div>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{seg.label}: <b style={{ color: '#e2e8f0' }}>{seg.value}</b></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Demand Bar ────────────────────────────────────────────────────── */
function DemandBar({ label, value, maxValue, color }: {
  label: string; value: number; maxValue: number; color: string;
}) {
  const pct = (value / maxValue) * 100;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{label}</span>
        <span style={{ color: '#94a3b8' }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
type Tab = 'overview' | 'gaps' | 'careers' | 'resources' | 'trends';

export default function SkillGapAnalyzer() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'demand' | 'salary' | 'growth'>('demand');

  const userSkillMap = useMemo(() => {
    const map = new Map<string, Skill>();
    USER_SKILLS.forEach(s => map.set(s.name, s));
    return map;
  }, []);

  /* ─── Computed Data ───────────────────────────────────────────────── */
  const categories = useMemo(() => {
    const cats = new Set<string>();
    USER_SKILLS.forEach(s => cats.add(s.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredSkills = useMemo(() => {
    let skills = [...USER_SKILLS];
    if (selectedCategory !== 'all') skills = skills.filter(s => s.category === selectedCategory);
    if (searchQuery) skills = skills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return skills;
  }, [selectedCategory, searchQuery]);

  const skillGaps = useMemo((): SkillGap[] => {
    return MARKET_SKILLS
      .filter(ms => {
        const userSkill = userSkillMap.get(ms.name);
        if (!userSkill) return true;
        return levelIndex(userSkill.level) < 3;
      })
      .map(ms => {
        const userSkill = userSkillMap.get(ms.name);
        const currentLevel = userSkill?.level || 'none';
        const requiredLevel = ms.demandScore > 85 ? 'advanced' : ms.demandScore > 70 ? 'intermediate' : 'beginner';
        const gap = levelIndex(requiredLevel) - levelIndex(currentLevel);
        const priority: SkillGap['priority'] = gap >= 3 ? 'critical' : gap === 2 ? 'high' : gap === 1 ? 'medium' : 'low';
        return {
          skill: ms.name,
          currentLevel,
          requiredLevel,
          demandScore: ms.demandScore,
          priority,
          estimatedLearningTime: gap === 0 ? 'None' : gap === 1 ? '2-4 weeks' : gap === 2 ? '1-3 months' : '3-6 months',
          salaryImpact: gap * 8,
        };
      })
      .sort((a, b) => {
        const prio: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return prio[a.priority] - prio[b.priority];
      });
  }, [userSkillMap]);

  const careerPaths = useMemo((): CareerPath[] => {
    const paths: CareerPath[] = [
      {
        id: 'sr-frontend', title: 'Senior Frontend Engineer',
        requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'CSS', 'REST APIs', 'Testing'],
        avgSalary: '$130-160K', growthOutlook: '+18% YoY', difficulty: 'moderate',
      },
      {
        id: 'fullstack', title: 'Full-Stack Developer',
        requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Docker', 'AWS'],
        avgSalary: '$120-150K', growthOutlook: '+15% YoY', difficulty: 'challenging',
      },
      {
        id: 'devops', title: 'DevOps Engineer',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Python', 'SQL', 'CI/CD', 'Monitoring'],
        avgSalary: '$135-170K', growthOutlook: '+22% YoY', difficulty: 'challenging',
      },
      {
        id: 'tech-lead', title: 'Tech Lead / Architect',
        requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'System Design'],
        avgSalary: '$160-200K', growthOutlook: '+12% YoY', difficulty: 'challenging',
      },
    ];
    return paths.map(p => {
      const missing = p.requiredSkills.filter(s => {
        const userSkill = userSkillMap.get(s);
        return !userSkill || levelIndex(userSkill.level) < 2;
      });
      const matchScore = Math.round(((p.requiredSkills.length - missing.length) / p.requiredSkills.length) * 100);
      return { ...p, matchScore, missingSkills: missing };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [userSkillMap]);

  const allLearningResources = useMemo(() => {
    const resources: (LearningResource & { forSkill: string })[] = [];
    MARKET_SKILLS.forEach(ms => {
      ms.learningResources.forEach(lr => {
        resources.push({ ...lr, forSkill: ms.name });
      });
    });
    return resources;
  }, []);

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    USER_SKILLS.forEach(s => { cats[s.category] = (cats[s.category] || 0) + 1; });
    const colors = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
    return Object.entries(cats).map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
  }, []);

  /* ─── Tab Definitions ─────────────────────────────────────────────── */
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'gaps', label: 'Skill Gaps', icon: '🎯' },
    { id: 'careers', label: 'Career Paths', icon: '🚀' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'trends', label: 'Market Trends', icon: '📈' },
  ];

  /* ─── Stats ───────────────────────────────────────────────────────── */
  const avgDemandScore = useMemo(() => {
    const userSkillsInMarket = USER_SKILLS.filter(s => MARKET_SKILLS.some(m => m.name === s.name));
    if (userSkillsInMarket.length === 0) return 0;
    const total = userSkillsInMarket.reduce((sum, s) => {
      const m = MARKET_SKILLS.find(ms => ms.name === s.name)!;
      return sum + m.demandScore;
    }, 0);
    return Math.round(total / userSkillsInMarket.length);
  }, []);

  const criticalGaps = skillGaps.filter(g => g.priority === 'critical').length;
  const totalSalaryImpact = skillGaps.reduce((sum, g) => sum + g.salaryImpact, 0);

  /* ─── Render ──────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', color: '#e2e8f0', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Skill Gap Analyzer
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>Analyze your skills against market demand and discover growth opportunities</p>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <KPICard label="Your Skills" value={USER_SKILLS.length} subtitle={`${categories.length - 1} categories`} color="#8b5cf6" />
          <KPICard label="Market Match" value={`${avgDemandScore}%`} subtitle="avg demand score" color={avgDemandScore >= 80 ? '#22c55e' : '#eab308'} />
          <KPICard label="Critical Gaps" value={criticalGaps} subtitle="need immediate focus" color={criticalGaps > 2 ? '#ef4444' : '#22c55e'} />
          <KPICard label="Salary Potential" value={`+$${totalSalaryImpact}K`} subtitle="by closing gaps" color="#3b82f6" />
          <KPICard label="Best Fit Path" value={`${careerPaths[0]?.matchScore || 0}%`} subtitle={careerPaths[0]?.title || ''} color="#8b5cf6" />
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: '1 1 0', minWidth: 100, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: activeTab === tab.id ? '#c4b5fd' : '#94a3b8',
              fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Skill Donut */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0', color: '#e2e8f0' }}>📊 Skill Distribution</h3>
                <SkillDonut segments={categoryBreakdown} />
              </div>
              {/* Level Breakdown */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0', color: '#e2e8f0' }}>🎯 Skill Levels</h3>
                {LEVEL_ORDER.map(level => {
                  const count = USER_SKILLS.filter(s => s.level === level).length;
                  const colors: Record<string, string> = { beginner: '#94a3b8', intermediate: '#3b82f6', advanced: '#8b5cf6', expert: '#f59e0b' };
                  return (
                    <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', width: 85, textTransform: 'capitalize' }}>{level}</span>
                      <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 5 }}>
                        <div style={{ height: '100%', width: `${(count / USER_SKILLS.length) * 100}%`, background: colors[level], borderRadius: 5 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: colors[level], width: 24, textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Demand Skills */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0', color: '#e2e8f0' }}>🔥 Market Demand — Your Skills vs Market</h3>
              {MARKET_SKILLS.filter(ms => userSkillMap.has(ms.name)).sort((a, b) => b.demandScore - a.demandScore).map(ms => (
                <DemandBar key={ms.name} label={ms.name} value={ms.demandScore} maxValue={100} color="#8b5cf6" />
              ))}
            </div>

            {/* Quick Skills Grid */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0', color: '#e2e8f0' }}>🛠️ Your Skills</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {filteredSkills.map(skill => {
                  const market = MARKET_SKILLS.find(m => m.name === skill.name);
                  return <SkillCard key={skill.name} skill={skill} market={market} />;
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── Gaps Tab ───────────────────────────────────────────── */}
        {activeTab === 'gaps' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#e2e8f0' }}>🎯 Skill Gap Analysis ({skillGaps.length} gaps)</h3>
                <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                  {(['critical', 'high', 'medium', 'low'] as const).map(p => {
                    const count = skillGaps.filter(g => g.priority === p).length;
                    return (
                      <span key={p} style={{
                        padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                        background: `${priorityColor(p)}15`, color: priorityColor(p),
                      }}>{count} {p}</span>
                    );
                  })}
                </div>
              </div>
              {skillGaps.map(gap => <GapItem key={gap.skill} gap={gap} />)}
            </div>
            {/* Priority Matrix */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0', color: '#e2e8f0' }}>⚡ Recommended Learning Path</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {skillGaps.filter(g => g.priority === 'critical' || g.priority === 'high').map((gap, i) => (
                  <div key={gap.skill} style={{
                    background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12,
                    border: `1px solid ${priorityColor(gap.priority)}40`, flex: '1 1 200px', minWidth: 200,
                  }}>
                    <div style={{ fontSize: 11, color: priorityColor(gap.priority), fontWeight: 700, marginBottom: 4 }}>Step {i + 1}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 4 }}>{gap.skill}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>⏱ {gap.estimatedLearningTime} · 💰 +${gap.salaryImpact}K</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Careers Tab ────────────────────────────────────────── */}
        {activeTab === 'careers' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 16 }}>
              {careerPaths.map(path => <CareerPathCard key={path.id} path={path} />)}
            </div>
          </div>
        )}

        {/* ─── Resources Tab ──────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 Search resources..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: '1 1 250px', padding: '10px 14px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                  color: '#e2e8f0', fontSize: 13, outline: 'none',
                }}
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'demand' | 'salary' | 'growth')}
                style={{
                  padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 13,
                }}
              >
                <option value="demand">Sort by Demand</option>
                <option value="salary">Sort by Salary</option>
                <option value="growth">Sort by Growth</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {allLearningResources
                .filter(r => !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.forSkill.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => {
                  const mA = MARKET_SKILLS.find(m => m.name === a.forSkill);
                  const mB = MARKET_SKILLS.find(m => m.name === b.forSkill);
                  if (sortBy === 'demand') return (mB?.demandScore || 0) - (mA?.demandScore || 0);
                  if (sortBy === 'salary') return (mB?.avgSalary || 0) - (mA?.avgSalary || 0);
                  return (mB?.growthRate || 0) - (mA?.growthRate || 0);
                })
                .map((r, i) => <ResourceCard key={i} resource={r} />)
              }
            </div>
          </div>
        )}

        {/* ─── Trends Tab ─────────────────────────────────────────── */}
        {activeTab === 'trends' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Trending Skills */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0', color: '#e2e8f0' }}>📈 Industry Skill Trends</h3>
                {INDUSTRY_TRENDS.sort((a, b) => b.changePercent - a.changePercent).map(trend => (
                  <TrendRow key={trend.skill} trend={trend} />
                ))}
              </div>
              {/* Salary Comparison */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px 0', color: '#e2e8f0' }}>💰 Salary by Skill (avg $K)</h3>
                {MARKET_SKILLS.sort((a, b) => b.avgSalary - a.avgSalary).map(ms => (
                  <DemandBar key={ms.name} label={`${ms.name} ($${ms.avgSalary}K)`} value={ms.avgSalary} maxValue={140} color="#3b82f6" />
                ))}
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '20px 0 14px 0', color: '#e2e8f0' }}>📊 Growth Rate (% YoY)</h3>
                {MARKET_SKILLS.sort((a, b) => b.growthRate - a.growthRate).map(ms => (
                  <DemandBar key={ms.name} label={`${ms.name} (+${ms.growthRate}%)`} value={ms.growthRate} maxValue={30} color="#22c55e" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
