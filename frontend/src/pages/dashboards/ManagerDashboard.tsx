import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import {
  Users, CheckCircle2, XCircle, AlertTriangle, Download, Send,
  Award, Target, Clock, ArrowRight, ShieldCheck, ChevronRight,
  TrendingUp, BarChart2, Filter, FileText, Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

interface TeamMember {
  id: number;
  name: string;
  designation: string;
  assessed: boolean;
  score: number;
  topGap: string;
  status: 'Proficient' | 'Needs Training' | 'Pending Assessment';
}

interface TrainingRequest {
  id: number;
  officerName: string;
  courseTitle: string;
  requestedDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDept, setSelectedDept] = useState('Price Statistics Division (PSD)');

  // Team members list
  const [teamMembers] = useState<TeamMember[]>([
    { id: 101, name: 'Priya Sharma', designation: 'Senior Statistical Officer', assessed: true, score: 76.5, topGap: 'Survey Sampling & Estimation', status: 'Needs Training' },
    { id: 102, name: 'Amit Verma', designation: 'Statistical Investigator (Gr I)', assessed: true, score: 88.0, topGap: 'Price Index Quality Imputation', status: 'Proficient' },
    { id: 103, name: 'Sunil Mehta', designation: 'Junior Statistical Officer', assessed: false, score: 0, topGap: 'General Statistical Framework', status: 'Pending Assessment' },
    { id: 104, name: 'Ananya Roy', designation: 'Statistical Officer', assessed: true, score: 82.5, topGap: 'Python for Automated Surveys', status: 'Proficient' },
    { id: 105, name: 'Deepak Joshi', designation: 'Statistical Investigator (Gr II)', assessed: true, score: 64.0, topGap: 'Data Quality Assurance (DQAF)', status: 'Needs Training' },
  ]);

  // Approval queue
  const [requests, setRequests] = useState<TrainingRequest[]>([
    { id: 1, officerName: 'Priya Sharma', courseTitle: 'Advanced NSSO Survey Sampling Techniques', requestedDate: '2026-11-20', reason: 'Required for upcoming PLFS rural field scrutiny', status: 'pending' },
    { id: 2, officerName: 'Deepak Joshi', courseTitle: 'DQAF & Statistical Anomaly Detection in Python', requestedDate: '2026-11-21', reason: 'Assigned to factory returns data cleaning workflow', status: 'pending' },
  ]);

  // Heatmap data
  const heatmapData = [
    { competency: 'Price Index Compilation', proficiency: 86, target: 80 },
    { competency: 'Sampling & Estimation', proficiency: 62, target: 85 },
    { competency: 'National Accounts (SNA)', proficiency: 74, target: 75 },
    { competency: 'Python Survey Scrutiny', proficiency: 58, target: 80 },
    { competency: 'DQAF Quality Rules', proficiency: 69, target: 75 },
  ];

  const handleApprove = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleReject = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Name,Designation,Assessed,CompetencyScore,TopGap,Status\n"
      + teamMembers.map(m => `${m.id},"${m.name}","${m.designation}",${m.assessed},${m.score},"${m.topGap}","${m.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Division_Team_Readiness_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy-900">
              Department Head Portal — {user?.full_name || 'Anita Desai'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Division Manager (MoSPI)
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Overseeing workforce capacity building, competency assessments, and training approvals for <span className="font-semibold text-slate-800">{selectedDept}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Team Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Division KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Division Strength</span>
            <Users className="w-4 h-4 text-gov-blue" />
          </div>
          <div className="text-2xl font-extrabold text-navy-900 mt-2">18 Officials</div>
          <div className="text-[11px] text-slate-400 mt-1">15 Assessed • 3 Pending</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Average Readiness</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">78.4%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">↑ +4.2% since last quarter</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Critical Skill Gaps</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">4 Gaps</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">Sampling & Python Scrutiny</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">
            {requests.filter(r => r.status === 'pending').length} Requests
          </div>
          <div className="text-[11px] text-slate-400 mt-1">TPAC & NSSTA Courses</div>
        </div>
      </div>

      {/* Main Grid: Division Skill Heatmap & Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Skill Gap Heatmap */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Division Competency Benchmark vs Target</h2>
              <p className="text-[11px] text-slate-500">Current average proficiency vs mandatory job-role requirement</p>
            </div>
            <BarChart2 className="w-4 h-4 text-gov-blue" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="competency" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="proficiency" fill="#1d4ed8" radius={[0, 4, 4, 0]} name="Division Average" />
                <Bar dataKey="target" fill="#cbd5e1" radius={[0, 4, 4, 0]} name="Required Standard" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training Nomination & Approval Queue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Training Nomination & Approval Queue</h2>
              <p className="text-[11px] text-slate-500">Official requests from statistical personnel for NSSTA / iGOT programmes</p>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Action Required
            </span>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-navy-900">{req.officerName}</span>
                    <div className="text-xs text-gov-blue font-medium">{req.courseTitle}</div>
                  </div>
                  {req.status === 'pending' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  ) : req.status === 'approved' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-800">
                      Rejected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 italic">"{req.reason}"</p>

                {req.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-gov-blue hover:bg-blue-700 rounded transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Nomination
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Roster & Competency Status Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-navy-900">Division Officer Roster & Capability Status</h2>
            <p className="text-[11px] text-slate-500">Track and assign competency learning modules directly to team members</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Officer Name</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3">Assessment Status</th>
                <th className="py-2.5 px-3">Readiness Score</th>
                <th className="py-2.5 px-3">Priority Gap Identified</th>
                <th className="py-2.5 px-3 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {teamMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-semibold text-navy-900">{m.name}</td>
                  <td className="py-3 px-3 text-slate-600">{m.designation}</td>
                  <td className="py-3 px-3">
                    {m.assessed ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Assessed
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-navy-900">
                    {m.assessed ? `${m.score}%` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-800 font-medium">{m.topGap}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => alert(`Assigned targeted NSSTA module to ${m.name}`)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-gov-blue hover:text-white hover:bg-gov-blue rounded-md border border-blue-200 transition"
                    >
                      Assign Module
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
