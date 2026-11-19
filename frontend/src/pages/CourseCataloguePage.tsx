import React, { useState, useEffect } from 'react';
import { courseApi } from '../services/api';
import { Course } from '../types';
import {
  Search, Filter, RefreshCw, BookOpen, ExternalLink, Clock,
  GraduationCap, Globe, Monitor, AlertCircle, Library
} from 'lucide-react';

const difficultyStyle = (level: string): string => {
  const l = level.toLowerCase();
  if (l === 'beginner') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (l === 'intermediate') return 'bg-amber-100 text-amber-800 border border-amber-200';
  if (l === 'advanced') return 'bg-rose-100 text-rose-800 border border-rose-200';
  return 'bg-slate-100 text-slate-800 border border-slate-200';
};

export const CourseCataloguePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await courseApi.listCourses();
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to load courses', err);
      setError('Failed to load course catalogue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
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
          onClick={loadCourses}
          className="px-4 py-2 text-xs font-semibold text-white bg-gov-blue rounded-lg hover:bg-gov-darkblue transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Client-side filtering
  const filteredCourses = courses.filter((c) => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (difficultyFilter !== 'all' && c.difficulty_level.toLowerCase() !== difficultyFilter.toLowerCase()) return false;
    if (formatFilter !== 'all' && c.format.toLowerCase() !== formatFilter.toLowerCase()) return false;
    if (languageFilter !== 'all' && c.language.toLowerCase() !== languageFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Library className="w-5 h-5 text-gov-blue" />
              <h1 className="text-xl font-bold text-navy-900">Course Catalogue</h1>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              Browse verified learning resources from iGOT Karmayogi, NSSTA, and curated MOOCs aligned to India's Official Statistical System competency framework.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-gov-blue border border-blue-200">
              {courses.length} Courses Available
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <span className="text-slate-700 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 w-52 focus:outline-none focus:ring-1 focus:ring-gov-blue focus:border-gov-blue"
            />
          </div>

          {/* Difficulty */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Format */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Formats</option>
            <option value="online">Online</option>
            <option value="blended">Blended</option>
            <option value="classroom">Classroom</option>
          </select>

          {/* Language */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">All Languages</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>

        <div className="text-slate-700">
          Showing <strong>{filteredCourses.length}</strong> course{filteredCourses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Course Grid or Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center py-16 gap-3">
          <BookOpen className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No courses match your filters</p>
          <p className="text-xs text-slate-500">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDifficultyFilter('all');
              setFormatFilter('all');
              setLanguageFilter('all');
            }}
            className="mt-2 px-4 py-2 text-xs font-semibold text-gov-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              {/* Card Top */}
              <div className="space-y-3">
                {/* Title & Provider */}
                <div>
                  <h3 className="text-sm font-bold text-navy-900 leading-snug">{course.title}</h3>
                  <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-100 text-gov-blue border border-blue-200">
                    {course.provider}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Meta Tags */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3" />
                    {course.duration_hours}h
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${difficultyStyle(course.difficulty_level)}`}>
                    {course.difficulty_level}
                  </span>

                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    <Globe className="w-3 h-3" />
                    {course.language}
                  </span>

                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                    <Monitor className="w-3 h-3" />
                    {course.format}
                  </span>
                </div>

                {/* Competencies Covered */}
                {course.competencies_covered && course.competencies_covered.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Competencies Covered
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {course.competencies_covered.map((comp) => (
                        <span
                          key={comp.competency_id}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700 border border-teal-200"
                          title={`Target: Level ${comp.target_proficiency} · Weight: ${(comp.coverage_weight * 100).toFixed(0)}%`}
                        >
                          {comp.competency_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Bottom: CTA */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href={course.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2 text-xs font-semibold text-white bg-gov-blue rounded-lg hover:bg-gov-darkblue transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Course
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
