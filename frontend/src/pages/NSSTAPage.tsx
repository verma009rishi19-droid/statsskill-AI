import React, { useState, useEffect } from 'react';
import { nsstaApi } from '../services/api';
import { NSSTATrainingProgramme } from '../types';
import {
  RefreshCw, AlertCircle, GraduationCap, Building2, Clock, Filter,
  ExternalLink, ShieldCheck, CalendarDays, MapPin, BookOpen, Users,
  BadgeCheck, Search
} from 'lucide-react';

export const NSSTAPage: React.FC = () => {
  const [programmes, setProgrammes] = useState<NSSTATrainingProgramme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string>('All');

  const loadProgrammes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await nsstaApi.listProgrammes();
      setProgrammes(res.data);
    } catch (err) {
      console.error('Failed to load NSSTA programmes', err);
      setError('Unable to load NSSTA training programmes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm text-slate-700">{error}</p>
        <button
          onClick={loadProgrammes}
          className="px-4 py-2 text-xs font-semibold bg-gov-blue text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const deliveryFormats = ['All', 'Classroom', 'Online', 'Blended'];

  const filteredProgrammes = programmes.filter((p) =>
    formatFilter === 'All' ? true : p.delivery_format.toLowerCase() === formatFilter.toLowerCase()
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatBadgeColor = (format: string) => {
    switch (format.toLowerCase()) {
      case 'classroom':
        return 'bg-blue-100 text-gov-blue border-blue-200';
      case 'online':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'blended':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gov-blue/10 rounded-lg">
                <GraduationCap className="w-5 h-5 text-gov-blue" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">NSSTA Training Programmes</h1>
                <p className="text-xs text-slate-700 mt-0.5">
                  Programmes offered by the National Statistical Systems Training Academy with TPAC approval status
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              TPAC Verified
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-gov-blue border border-blue-200">
              {programmes.length} Programme{programmes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-700 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Delivery Format:
          </span>
          {deliveryFormats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormatFilter(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                formatFilter === fmt
                  ? 'bg-gov-blue text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
        <div className="text-slate-700">
          Showing <strong>{filteredProgrammes.length}</strong> of {programmes.length} programmes
        </div>
      </div>

      {/* Empty State */}
      {filteredProgrammes.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center py-16 gap-3">
          <Search className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No programmes found</p>
          <p className="text-xs text-slate-500">
            {formatFilter !== 'All'
              ? `No ${formatFilter.toLowerCase()} programmes available. Try selecting a different format.`
              : 'No NSSTA training programmes are currently listed.'}
          </p>
          {formatFilter !== 'All' && (
            <button
              onClick={() => setFormatFilter('All')}
              className="mt-2 px-4 py-2 text-xs font-semibold bg-gov-blue text-white rounded-lg hover:bg-blue-700 transition"
            >
              View All Programmes
            </button>
          )}
        </div>
      )}

      {/* Programme Cards */}
      <div className="space-y-4">
        {filteredProgrammes.map((prog) => (
          <div
            key={prog.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="p-5">
              {/* Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h2 className="text-sm font-bold text-navy-900">{prog.title}</h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        prog.tpac_approval_status.toLowerCase() === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {prog.tpac_approval_status.toLowerCase() === 'approved'
                        ? '✓ TPAC Approved'
                        : '⏳ Under Review'}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {prog.source_organization}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {prog.duration_days} day{prog.duration_days !== 1 ? 's' : ''}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${formatBadgeColor(
                        prog.delivery_format
                      )}`}
                    >
                      {prog.delivery_format}
                    </span>
                    {prog.tpac_reference_number && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Ref: {prog.tpac_reference_number}
                      </span>
                    )}
                  </div>
                </div>

                {prog.official_url && (
                  <a
                    href={prog.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gov-blue text-white rounded-lg hover:bg-blue-700 transition shrink-0"
                  >
                    View Details
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Eligibility & Prerequisites */}
              {(prog.eligibility_criteria || prog.prerequisites) && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {prog.eligibility_criteria && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Eligibility Criteria</span>
                      <p className="text-slate-600 leading-relaxed">{prog.eligibility_criteria}</p>
                    </div>
                  )}
                  {prog.prerequisites && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Prerequisites</span>
                      <p className="text-slate-600 leading-relaxed">{prog.prerequisites}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Competencies & Target Roles */}
              {(prog.competencies_covered.length > 0 || prog.target_job_roles.length > 0) && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  {prog.competencies_covered.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                        <BookOpen className="w-3 h-3" /> Competencies Covered
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prog.competencies_covered.map((comp, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-50 text-gov-blue border border-blue-200"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {prog.target_job_roles.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                        <Users className="w-3 h-3" /> Target Job Roles
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prog.target_job_roles.map((role, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Schedule Table */}
              {prog.schedule_dates.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                    <CalendarDays className="w-3 h-3" /> Upcoming Batches
                  </span>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold">
                          <th className="py-2 px-3 text-left">Batch</th>
                          <th className="py-2 px-3 text-left">Start Date</th>
                          <th className="py-2 px-3 text-left">End Date</th>
                          <th className="py-2 px-3 text-left">Venue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {prog.schedule_dates.map((batch, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-slate-800">
                              Batch {batch.batch}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{formatDate(batch.start)}</td>
                            <td className="py-2 px-3 text-slate-600">{formatDate(batch.end)}</td>
                            <td className="py-2 px-3 text-slate-600">
                              {batch.venue ? (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  {batch.venue}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
              <span>
                Source: <span className="font-medium">{prog.source_reference}</span>
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                Last verified: {formatDate(prog.last_verified_date)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
