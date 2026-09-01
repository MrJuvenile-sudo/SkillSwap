// public/views_hub.js - SkillSwap Learning Hub Views
(function() {
  window.SkillSwap = window.SkillSwap || {};
  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;
  const { useState, useEffect, useCallback } = React;
  const html = htm.bind(React.createElement);
  const { api, Icon } = window.SkillSwap;

  const RESOURCE_TYPES = [
    { value: 'NOTES', label: 'Notes', icon: '📝', color: 'blue' },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: '📑', color: 'amber' },
    { value: 'KEY_POINTS', label: 'Key-Point Notes', icon: '⚡', color: 'violet' },
    { value: 'PYQ', label: 'Previous Year Paper', icon: '📄', color: 'emerald' },
    { value: 'LAB', label: 'Lab Manual', icon: '🧪', color: 'rose' },
    { value: 'QUESTION_BANK', label: 'Question Bank', icon: '❓', color: 'orange' },
    { value: 'EXAM_PREP', label: 'Exam Preparation', icon: '🎯', color: 'indigo' },
    { value: 'PROJECT', label: 'Project Resource', icon: '🛠', color: 'teal' },
    { value: 'PRESENTATION', label: 'Presentation', icon: '📊', color: 'pink' }
  ];

  const TYPE_COLORS = {
    NOTES: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIGNMENT: 'bg-amber-50 text-amber-700 border-amber-200',
    KEY_POINTS: 'bg-violet-50 text-violet-700 border-violet-200',
    PYQ: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LAB: 'bg-rose-50 text-rose-700 border-rose-200',
    QUESTION_BANK: 'bg-orange-50 text-orange-700 border-orange-200',
    EXAM_PREP: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PROJECT: 'bg-teal-50 text-teal-700 border-teal-200',
    PRESENTATION: 'bg-pink-50 text-pink-700 border-pink-200'
  };

  function getTypeInfo(type) {
    return RESOURCE_TYPES.find(t => t.value === type) || { icon: '📄', label: type };
  }

  // Reusable Resource Card
  function ResourceCard({ resource, onView, onSave, currentUserId }) {
    const typeInfo = getTypeInfo(resource.type);
    const typeColor = TYPE_COLORS[resource.type] || 'bg-cream-100 text-navy-700 border-cream-300';
    const isOwn = resource.contributor_id === currentUserId;
    const isCommunityReviewed = Number(resource.review_count) >= 3 && Number(resource.avg_rating) >= 4.0;

    return html`
      <div class="bg-white rounded-2xl border border-cream-300 shadow-sm hover:shadow-md hover:border-navy-200 transition-all duration-200 flex flex-col p-5 gap-3 cursor-pointer" onClick=${() => onView && onView(resource)}>
        <div class="flex items-start justify-between gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${typeColor}">
            ${typeInfo.icon} ${typeInfo.label}
          </span>
          <div class="flex items-center gap-2 shrink-0">
            ${isCommunityReviewed ? html`
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">✓ Reviewed</span>
            ` : null}
            ${resource.avg_rating ? html`<span class="text-[11px] font-bold text-amber-600">★ ${Number(resource.avg_rating).toFixed(1)}</span>` : null}
          </div>
        </div>

        <div class="space-y-1">
          <h3 class="font-serif font-bold text-navy-950 text-sm leading-tight">${resource.title}</h3>
          <p class="text-[11px] text-warmgray-500 font-semibold">${resource.subject}${resource.semester ? ' · Sem ' + resource.semester : ''}${resource.university ? ' · ' + resource.university : ''}</p>
        </div>

        ${resource.description ? html`<p class="text-xs text-warmgray-600 leading-relaxed line-clamp-2">${resource.description}</p>` : null}

        <div class="flex items-center justify-between pt-2 border-t border-cream-100 mt-auto">
          <div class="flex items-center gap-2">
            <img src=${resource.contributor_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop'} class="w-5 h-5 rounded-full object-cover border border-cream-200" />
            <span class="text-[10px] text-warmgray-500 font-semibold">${resource.contributor_name}</span>
          </div>
          <div class="flex items-center gap-3 text-[10px] text-warmgray-400 font-semibold">
            <span>⬇ ${resource.downloads || 0}</span>
            <span>💬 ${resource.review_count || 0}</span>
            ${!isOwn ? html`
              <button onClick=${(e) => { e.stopPropagation(); onSave && onSave(resource.id, !resource.is_saved); }}
                class="${Number(resource.is_saved) ? 'text-indigo-600' : 'text-warmgray-300 hover:text-indigo-500'} transition-colors text-base leading-none">
                🔖
              </button>
            ` : null}
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------
  // 1. Learning Hub Browse View
  // -------------------------------------------------------
  function LearningHubBrowseView({ setActiveTab, currentUser, onViewResource }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [semFilter, setSemFilter] = useState('');
    const [uniFilter, setUniFilter] = useState('');
    const [page, setPage] = useState(1);

    const loadResources = useCallback(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 12 });
        if (search) params.append('q', search);
        if (typeFilter !== 'ALL') params.append('type', typeFilter);
        if (semFilter) params.append('semester', semFilter);
        if (uniFilter) params.append('university', uniFilter);
        const data = await api('/api/resources?' + params.toString());
        setResources(data.resources || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error('Browse error:', e);
        setResources([]);
      } finally {
        setLoading(false);
      }
    }, [search, typeFilter, semFilter, uniFilter, page]);

    useEffect(() => { loadResources(); }, [loadResources]);

    const handleSave = async (id, save) => {
      try {
        if (save) {
          await api('/api/resources/saved', { method: 'POST', body: JSON.stringify({ resource_id: id }) });
        } else {
          await api('/api/resources/saved', { method: 'DELETE', body: JSON.stringify({ resource_id: id }) });
        }
        loadResources();
      } catch (e) { console.error(e); }
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950">📚 Learning Hub</h1>
            <p class="text-sm text-warmgray-500 mt-1">Browse peer-shared academic resources</p>
          </div>
          <div class="flex items-center gap-3">
            <button onClick=${() => setActiveTab('exam-mode')} class="px-4 py-2.5 border border-indigo-300 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-50 transition-all">
              🎯 Exam Mode
            </button>
            <button onClick=${() => setActiveTab('hub-upload')} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              + Share Resource
            </button>
          </div>
        </div>

        <!-- Quick Stats Bar -->
        <div class="grid grid-cols-3 sm:grid-cols-3 gap-3">
          ${[
            { label: 'Resources', value: total, icon: '📚' },
            { label: 'Peer Teachers', value: '100+', icon: '👥' },
            { label: 'Subjects', value: '50+', icon: '🔬' }
          ].map(s => html`
            <div key=${s.label} class="bg-white rounded-xl border border-cream-300 p-3 text-center">
              <p class="text-lg">${s.icon}</p>
              <p class="font-bold text-navy-950 text-sm">${s.value}</p>
              <p class="text-[10px] text-warmgray-400 font-semibold">${s.label}</p>
            </div>
          `)}
        </div>

        <!-- Search + Filters -->
        <div class="bg-white rounded-2xl border border-cream-300 shadow-sm p-4 space-y-3">
          <div class="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by title, subject, or topic..."
              value=${search}
              onInput=${e => { setSearch(e.target.value); setPage(1); }}
              class="flex-1 px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500 focus:bg-white transition-all"
            />
            <select value=${semFilter} onChange=${e => { setSemFilter(e.target.value); setPage(1); }}
              class="px-3 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500">
              <option value="">All Semesters</option>
              ${[1,2,3,4,5,6,7,8].map(s => html`<option key=${s} value=${s}>Semester ${s}</option>`)}
            </select>
            <input type="text" placeholder="University..." value=${uniFilter}
              onInput=${e => { setUniFilter(e.target.value); setPage(1); }}
              class="px-3 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500 w-full sm:w-40"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            ${[{ value: 'ALL', icon: '📚', label: 'All' }, ...RESOURCE_TYPES].map(t => {
              const isAll = t.value === 'ALL';
              return html`
                <button key=${t.value} onClick=${() => { setTypeFilter(t.value); setPage(1); }}
                  class="px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                    typeFilter === t.value
                      ? 'bg-navy-700 text-white border-navy-700'
                      : 'bg-cream-50 text-warmgray-600 border-cream-300 hover:border-navy-300'
                  }">
                  ${t.icon} ${t.label}
                </button>
              `;
            })}
          </div>
        </div>

        <!-- Results Grid -->
        ${loading ? html`
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${[1,2,3,4,5,6,7,8].map(i => html`
              <div key=${i} class="bg-white rounded-2xl border border-cream-200 p-5 h-48 animate-pulse space-y-3">
                <div class="h-4 bg-cream-200 rounded w-24"></div>
                <div class="h-5 bg-cream-200 rounded"></div>
                <div class="h-4 bg-cream-200 rounded w-3/4"></div>
              </div>
            `)}
          </div>
        ` : html`
          <div class="flex items-center justify-between">
            <p class="text-xs text-warmgray-500 font-semibold">${total} resource${total !== 1 ? 's' : ''} found</p>
          </div>
          ${resources.length === 0 ? html`
            <div class="text-center py-20 space-y-4">
              <p class="text-4xl">🚫</p>
              <p class="text-navy-900 font-bold text-lg">No resources found</p>
              <p class="text-warmgray-500 text-sm">Try different filters, or be the first to share resources for this subject.</p>
              <button onClick=${() => setActiveTab('hub-upload')} class="mt-2 px-5 py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl">Share Your Notes</button>
            </div>
          ` : html`
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              ${resources.map(r => html`
                <${ResourceCard} key=${r.id} resource=${r} onView=${onViewResource} onSave=${handleSave} currentUserId=${currentUser && currentUser.id} />
              `)}
            </div>
            ${total > 12 ? html`
              <div class="flex justify-center items-center gap-3 pt-4">
                <button onClick=${() => setPage(p => Math.max(1, p - 1))} disabled=${page === 1}
                  class="px-4 py-2 text-xs font-bold border border-cream-300 rounded-xl disabled:opacity-40 hover:bg-cream-50">← Prev</button>
                <span class="text-xs font-semibold text-warmgray-500">Page ${page} of ${Math.ceil(total / 12)}</span>
                <button onClick=${() => setPage(p => p + 1)} disabled=${page >= Math.ceil(total / 12)}
                  class="px-4 py-2 text-xs font-bold border border-cream-300 rounded-xl disabled:opacity-40 hover:bg-cream-50">Next →</button>
              </div>
            ` : null}
          `}
        `}
      </div>
    `;
  }
  window.SkillSwap.LearningHubBrowseView = LearningHubBrowseView;

  // -------------------------------------------------------
  // 2. Upload / Share Resource View
  // -------------------------------------------------------
  function LearningHubUploadView({ setActiveTab, currentUser }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
      type: '', title: '', subject: '', university: '', course: '',
      semester: '', unit_topic: '', description: '', file_url: '',
      visibility: 'EVERYONE', permission_confirmed: false
    });
    const [keyPoints, setKeyPoints] = useState([{ type: 'CONCEPT', title: '', content: '' }]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const addKP = (type) => setKeyPoints(kp => [...kp, { type, title: '', content: '' }]);
    const updKP = (i, k, v) => setKeyPoints(kp => kp.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
    const remKP = (i) => setKeyPoints(kp => kp.filter((_, idx) => idx !== i));

    const readTime = () => {
      const words = keyPoints.reduce((acc, kp) => acc + (kp.title + ' ' + kp.content).split(/\s+/).length, 0);
      return Math.max(1, Math.ceil(words / 200));
    };

    const handleSubmit = async () => {
      if (!form.permission_confirmed) { setError('Please confirm you have permission to share this material.'); return; }
      setSubmitting(true); setError(null);
      try {
        const body = { ...form, key_points: form.type === 'KEY_POINTS' ? keyPoints.filter(k => k.title && k.content) : undefined };
        await api('/api/resources/upload', { method: 'POST', body: JSON.stringify(body) });
        setSubmitted(true);
      } catch (e) {
        setError(e.message || 'Upload failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    if (submitted) return html`
      <div class="max-w-lg mx-auto py-20 px-4 text-center space-y-5 animate-fadeIn">
        <div class="w-16 h-16 bg-emerald-50 text-emerald-600 border-2 border-emerald-200 rounded-full flex items-center justify-center text-2xl mx-auto">✓</div>
        <h2 class="font-serif text-2xl font-bold text-navy-950">Resource Submitted!</h2>
        <p class="text-sm text-warmgray-600 leading-relaxed">Submitted for review. You'll get a notification once it's approved — usually within 24 hours.</p>
        <div class="flex gap-3 justify-center pt-2">
          <button onClick=${() => setActiveTab('hub-browse')} class="px-5 py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl shadow-sm">Browse Resources</button>
          <button onClick=${() => { setSubmitted(false); setStep(1); setForm({ type: '', title: '', subject: '', university: '', course: '', semester: '', unit_topic: '', description: '', file_url: '', visibility: 'EVERYONE', permission_confirmed: false }); setKeyPoints([{ type: 'CONCEPT', title: '', content: '' }]); }}
            class="px-5 py-2.5 border border-cream-300 text-navy-700 font-bold text-xs rounded-xl">Share Another</button>
        </div>
      </div>
    `;

    return html`
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
        <div class="flex items-center gap-3">
          <button onClick=${() => step > 1 ? setStep(s => s - 1) : setActiveTab('hub-browse')} class="p-2 rounded-xl border border-cream-300 hover:bg-cream-50 text-warmgray-600 font-bold text-sm">←</button>
          <div>
            <h1 class="font-serif text-2xl font-bold text-navy-950">Share a Resource</h1>
            <p class="text-xs text-warmgray-500">Step ${step} of 3</p>
          </div>
        </div>
        <div class="w-full bg-cream-200 rounded-full h-1.5">
          <div class="bg-navy-700 h-1.5 rounded-full transition-all duration-300" style=${{ width: `${(step / 3) * 100}%` }}></div>
        </div>
        ${error ? html`<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">${error}</div>` : null}

        ${step === 1 ? html`
          <div class="bg-white rounded-2xl border border-cream-300 shadow-sm p-6 space-y-5">
            <h2 class="font-bold text-navy-950">Resource Type & Academic Info</h2>
            <div>
              <label class="block text-xs font-bold text-navy-950 mb-2">Resource Type *</label>
              <div class="grid grid-cols-3 gap-2">
                ${RESOURCE_TYPES.map(t => html`
                  <button key=${t.value} onClick=${() => upd('type', t.value)}
                    class="p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      form.type === t.value ? 'bg-navy-700 text-white border-navy-700' : 'bg-cream-50 text-navy-700 border-cream-300 hover:border-navy-300'
                    }">
                    <div class="text-lg mb-1">${t.icon}</div><div>${t.label}</div>
                  </button>
                `)}
              </div>
            </div>
            ${form.type === 'ASSIGNMENT' ? html`
              <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
                ⚠️ <strong>Academic Integrity Notice:</strong> Assignments are labeled as Reference Material only. Use for learning. Do not submit another student's work as your own.
              </div>
            ` : null}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${[
                { key: 'title', label: 'Title *', placeholder: 'e.g. Complete DBMS Notes', type: 'text' },
                { key: 'subject', label: 'Subject *', placeholder: 'e.g. Database Management Systems', type: 'text' },
                { key: 'university', label: 'University', placeholder: 'e.g. VTU, MIT, Delhi University', type: 'text' },
                { key: 'course', label: 'Course', placeholder: 'e.g. B.Tech CSE', type: 'text' },
                { key: 'unit_topic', label: 'Unit / Topic', placeholder: 'e.g. Unit 3: Normalization', type: 'text' }
              ].map(f => html`
                <div key=${f.key}>
                  <label class="block text-xs font-bold text-navy-950 mb-1">${f.label}</label>
                  <input type=${f.type} value=${form[f.key]} onInput=${e => upd(f.key, e.target.value)} placeholder=${f.placeholder}
                    class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500" />
                </div>
              `)}
              <div>
                <label class="block text-xs font-bold text-navy-950 mb-1">Semester</label>
                <select value=${form.semester} onChange=${e => upd('semester', e.target.value)}
                  class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500">
                  <option value="">Select Semester</option>
                  ${[1,2,3,4,5,6,7,8].map(s => html`<option key=${s} value=${s}>Semester ${s}</option>`)}
                </select>
              </div>
            </div>
            <button onClick=${() => {
              if (!form.type || !form.title || !form.subject) { setError('Please fill in resource type, title, and subject.'); return; }
              setError(null); setStep(2);
            }} class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
              Next: Add Content →
            </button>
          </div>
        ` : null}

        ${step === 2 ? html`
          <div class="bg-white rounded-2xl border border-cream-300 shadow-sm p-6 space-y-5">
            <h2 class="font-bold text-navy-950">${form.type === 'KEY_POINTS' ? '⚡ Key-Point Notes Editor' : 'Resource Content'}</h2>

            ${form.type === 'KEY_POINTS' ? html`
              <div class="p-3 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-800 font-semibold">
                ⚡ Add structured concepts and questions. These power Exam Mode. Estimated read time: ~${readTime()} min
              </div>
              <div class="space-y-3">
                ${keyPoints.map((kp, i) => html`
                  <div key=${i} class="bg-cream-50 rounded-xl border border-cream-300 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex gap-2">
                        <button onClick=${() => updKP(i, 'type', 'CONCEPT')}
                          class="px-2.5 py-1 rounded-lg text-[10px] font-bold border ${kp.type === 'CONCEPT' ? 'bg-violet-600 text-white border-violet-600' : 'border-cream-300 text-warmgray-500'}">
                          💡 Concept
                        </button>
                        <button onClick=${() => updKP(i, 'type', 'QUESTION')}
                          class="px-2.5 py-1 rounded-lg text-[10px] font-bold border ${kp.type === 'QUESTION' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-cream-300 text-warmgray-500'}">
                          ❓ Question
                        </button>
                      </div>
                      ${keyPoints.length > 1 ? html`<button onClick=${() => remKP(i)} class="text-rose-400 hover:text-rose-600 text-xs font-bold">✕ Remove</button>` : null}
                    </div>
                    <input type="text" placeholder=${kp.type === 'CONCEPT' ? 'Concept or term title...' : 'Question text...'}
                      value=${kp.title} onInput=${e => updKP(i, 'title', e.target.value)}
                      class="w-full p-2.5 bg-white border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500" />
                    <textarea placeholder=${kp.type === 'CONCEPT' ? 'Brief explanation...' : 'Expected answer / key points...'}
                      value=${kp.content} onInput=${e => updKP(i, 'content', e.target.value)} rows="3"
                      class="w-full p-2.5 bg-white border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500 resize-none"></textarea>
                  </div>
                `)}
              </div>
              <div class="flex gap-2">
                <button onClick=${() => addKP('CONCEPT')} class="flex-1 py-2 border border-violet-300 text-violet-700 font-bold text-xs rounded-xl hover:bg-violet-50">+ Add Concept</button>
                <button onClick=${() => addKP('QUESTION')} class="flex-1 py-2 border border-emerald-300 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-50">+ Add Question</button>
              </div>
            ` : html`
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-navy-950 mb-1">Resource Link / URL</label>
                  <input type="url" value=${form.file_url} onInput=${e => upd('file_url', e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or GitHub link"
                    class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500" />
                  <p class="text-[10px] text-warmgray-400 mt-1">Paste a Google Drive, GitHub, OneDrive, or Dropbox link. Set sharing to "Anyone with the link can view."</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-navy-950 mb-1">Description</label>
                  <textarea value=${form.description} onInput=${e => upd('description', e.target.value)} rows="4"
                    placeholder="What's covered, which units/topics, how it helps, etc."
                    class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500 resize-none"></textarea>
                </div>
              </div>
            `}

            <div class="flex gap-3">
              <button onClick=${() => setStep(1)} class="px-5 py-3 border border-cream-300 text-navy-700 font-bold text-xs rounded-xl hover:bg-cream-50">← Back</button>
              <button onClick=${() => { setError(null); setStep(3); }} class="flex-1 py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm">Next: Review & Submit →</button>
            </div>
          </div>
        ` : null}

        ${step === 3 ? html`
          <div class="bg-white rounded-2xl border border-cream-300 shadow-sm p-6 space-y-5">
            <h2 class="font-bold text-navy-950">Review & Submit</h2>
            <div class="bg-cream-50 rounded-xl border border-cream-200 p-4 space-y-2 text-xs">
              <div class="flex justify-between"><span class="text-warmgray-500">Type</span><span class="font-bold">${getTypeInfo(form.type).icon} ${getTypeInfo(form.type).label}</span></div>
              <div class="flex justify-between"><span class="text-warmgray-500">Title</span><span class="font-bold">${form.title}</span></div>
              <div class="flex justify-between"><span class="text-warmgray-500">Subject</span><span class="font-bold">${form.subject}</span></div>
              ${form.university ? html`<div class="flex justify-between"><span class="text-warmgray-500">University</span><span class="font-bold">${form.university}</span></div>` : null}
              ${form.semester ? html`<div class="flex justify-between"><span class="text-warmgray-500">Semester</span><span class="font-bold">${form.semester}</span></div>` : null}
              ${form.type === 'KEY_POINTS' ? html`<div class="flex justify-between"><span class="text-warmgray-500">Key Points</span><span class="font-bold">${keyPoints.filter(k => k.title).length} entries</span></div>` : null}
            </div>

            <div>
              <label class="block text-xs font-bold text-navy-950 mb-2">Sharing Scope</label>
              <div class="space-y-2">
                ${[
                  { value: 'EVERYONE', label: '🌐 Everyone', desc: 'Visible to all SkillSwapX users' },
                  { value: 'UNIVERSITY', label: '🏫 My University', desc: 'Only users from same university' },
                  { value: 'CONNECTIONS', label: '🤝 My Connections', desc: 'Only people you have connected with' }
                ].map(opt => html`
                  <button key=${opt.value} onClick=${() => upd('visibility', opt.value)}
                    class="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      form.visibility === opt.value ? 'bg-navy-700 text-white border-navy-700' : 'border-cream-300 hover:border-navy-300'
                    }">
                    <span class="text-base">${opt.label.split(' ')[0]}</span>
                    <div>
                      <div class="text-xs font-bold">${opt.label.split(' ').slice(1).join(' ')}</div>
                      <div class="text-[10px] opacity-70">${opt.desc}</div>
                    </div>
                  </button>
                `)}
              </div>
            </div>

            <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
              <p class="font-bold">📋 Academic Integrity Declaration</p>
              <p>This material is shared for learning and reference only. Do not submit another student's work as your own.</p>
              <label class="flex items-start gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked=${form.permission_confirmed} onChange=${e => upd('permission_confirmed', e.target.checked)} class="mt-0.5 w-4 h-4" />
                <span class="font-semibold">I confirm I have the right to share this material and understand academic integrity guidelines.</span>
              </label>
            </div>

            <div class="flex gap-3">
              <button onClick=${() => setStep(2)} class="px-5 py-3 border border-cream-300 text-navy-700 font-bold text-xs rounded-xl hover:bg-cream-50">← Back</button>
              <button onClick=${handleSubmit} disabled=${submitting || !form.permission_confirmed}
                class="flex-1 py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-all">
                ${submitting ? 'Submitting...' : 'Submit for Review ✓'}
              </button>
            </div>
          </div>
        ` : null}
      </div>
    `;
  }
  window.SkillSwap.LearningHubUploadView = LearningHubUploadView;

  // -------------------------------------------------------
  // 3. Resource Detail View
  // -------------------------------------------------------
  function LearningHubDetailView({ resourceId, setActiveTab, currentUser, onProposeSwap }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ accuracy: 4, completeness: 4, relevance: 4, usefulness: 4, comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
      if (!resourceId) return;
      setLoading(true);
      api('/api/resources/' + resourceId)
        .then(d => { setData(d); setSaved(!!Number(d.resource && d.resource.is_saved)); })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, [resourceId]);

    const handleDownload = async () => {
      setDownloading(true);
      try {
        const r = await api('/api/resources/download', { method: 'POST', body: JSON.stringify({ resource_id: resourceId }) });
        if (r.file_url) window.open(r.file_url, '_blank');
        else alert('No file link available for this resource. Contact the contributor.');
        setData(d => d ? ({ ...d, resource: { ...d.resource, downloads: (d.resource.downloads || 0) + 1 } }) : d);
      } catch (e) { alert(e.message || 'Download failed'); }
      finally { setDownloading(false); }
    };

    const handleSave = async () => {
      try {
        if (saved) {
          await api('/api/resources/saved', { method: 'DELETE', body: JSON.stringify({ resource_id: resourceId }) });
        } else {
          await api('/api/resources/saved', { method: 'POST', body: JSON.stringify({ resource_id: resourceId }) });
        }
        setSaved(!saved);
      } catch (e) { console.error(e); }
    };

    const handleReviewSubmit = async (e) => {
      e.preventDefault(); setReviewSubmitting(true);
      try {
        await api('/api/resources/' + resourceId, { method: 'POST', body: JSON.stringify(reviewForm) });
        setReviewSuccess(true); setShowReviewForm(false);
        api('/api/resources/' + resourceId).then(d => setData(d)).catch(() => {});
      } catch (e) { alert(e.message || 'Review failed'); }
      finally { setReviewSubmitting(false); }
    };

    if (loading) return html`<div class="max-w-4xl mx-auto px-4 py-16 text-center text-warmgray-400">Loading resource...</div>`;
    if (!data || !data.resource) return html`
      <div class="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <p class="text-2xl">🔍</p>
        <p class="font-bold text-navy-900">Resource not found</p>
        <button onClick=${() => setActiveTab('hub-browse')} class="text-navy-600 font-bold hover:underline text-sm">← Go to Learning Hub</button>
      </div>
    `;

    const { resource, keyPoints, reviews, peerTeachers } = data;
    const typeInfo = getTypeInfo(resource.type);
    const isCommunityReviewed = Number(resource.review_count) >= 3 && Number(resource.avg_rating) >= 4.0;
    const isOwn = currentUser && resource.contributor_id === currentUser.id;

    return html`
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        <button onClick=${() => setActiveTab('hub-browse')} class="flex items-center gap-2 text-xs font-bold text-warmgray-500 hover:text-navy-700 transition-colors">
          ← Back to Learning Hub
        </button>

        <!-- Header Card -->
        <div class="bg-white rounded-2xl border border-cream-300 shadow-sm p-6 sm:p-8 space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-center flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${TYPE_COLORS[resource.type] || 'bg-cream-100 text-navy-700 border-cream-300'}">
                ${typeInfo.icon} ${typeInfo.label}
              </span>
              ${isCommunityReviewed ? html`<span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200 rounded-full">✓ Community Reviewed</span>` : null}
              ${resource.type === 'ASSIGNMENT' ? html`<span class="px-2.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200 rounded-full">⚠ Reference Material Only</span>` : null}
            </div>
            <div class="flex items-center gap-2">
              <button onClick=${handleSave} class="${saved ? 'text-indigo-600 border-indigo-300 bg-indigo-50' : 'text-warmgray-600 border-cream-300'} px-3 py-2 border rounded-xl text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all">
                🔖 ${saved ? 'Saved' : 'Save'}
              </button>
              ${!isOwn && resource.file_url ? html`
                <button onClick=${handleDownload} disabled=${downloading}
                  class="px-4 py-2 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-60">
                  ${downloading ? 'Opening...' : '⬇ Download / Open'}
                </button>
              ` : null}
            </div>
          </div>

          <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950 leading-tight">${resource.title}</h1>

          <div class="flex flex-wrap gap-3 text-xs text-warmgray-500 font-semibold">
            ${resource.subject ? html`<span>📚 ${resource.subject}</span>` : null}
            ${resource.semester ? html`<span>📅 Semester ${resource.semester}</span>` : null}
            ${resource.university ? html`<span>🏫 ${resource.university}</span>` : null}
            ${resource.course ? html`<span>🎓 ${resource.course}</span>` : null}
            ${resource.unit_topic ? html`<span>📌 ${resource.unit_topic}</span>` : null}
          </div>

          ${resource.type === 'ASSIGNMENT' ? html`
            <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
              ⚠️ <strong>Academic Integrity:</strong> Use for learning and reference only. Do not submit another student's work as your own.
            </div>
          ` : null}

          ${resource.description ? html`<p class="text-sm text-warmgray-600 leading-relaxed">${resource.description}</p>` : null}

          <div class="flex flex-wrap gap-5 pt-2 border-t border-cream-100 text-xs">
            <span class="font-semibold text-warmgray-500">⬇ ${resource.downloads || 0} downloads</span>
            <span class="font-semibold text-warmgray-500">💬 ${resource.review_count || 0} reviews</span>
            ${resource.avg_rating ? html`<span class="font-bold text-amber-600">★ ${Number(resource.avg_rating).toFixed(1)} avg</span>` : null}
          </div>

          <div class="flex items-center gap-3 pt-2 border-t border-cream-100">
            <img src=${resource.contributor_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop'} class="w-9 h-9 rounded-full object-cover border border-cream-200" />
            <div>
              <p class="text-xs font-bold text-navy-950">${resource.contributor_name}</p>
              <p class="text-[10px] text-warmgray-400 font-semibold">Shared ${new Date(resource.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <!-- Key-Point Notes (structured content) -->
        ${resource.type === 'KEY_POINTS' && keyPoints && keyPoints.length > 0 ? html`
          <div class="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-violet-50">
              <h2 class="font-serif font-bold text-violet-900">⚡ Key-Point Notes</h2>
              <span class="text-xs text-violet-500 font-semibold">${keyPoints.length} entries</span>
            </div>
            <div class="divide-y divide-cream-100">
              ${keyPoints.map((kp, i) => html`
                <div key=${i} class="px-6 py-4 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${kp.type === 'CONCEPT' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}">
                      ${kp.type === 'CONCEPT' ? '💡 Concept' : '❓ Question'}
                    </span>
                    <h3 class="font-bold text-navy-950 text-sm">${kp.title}</h3>
                  </div>
                  <p class="text-xs text-warmgray-600 leading-relaxed pl-3 border-l-2 border-cream-200">${kp.content}</p>
                </div>
              `)}
            </div>
          </div>
        ` : null}

        <!-- Quality Ratings -->
        ${resource.avg_rating ? html`
          <div class="bg-white rounded-2xl border border-cream-300 shadow-sm p-6 space-y-4">
            <h2 class="font-serif font-bold text-navy-950">Quality Ratings</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              ${[
                { label: 'Accuracy', value: resource.avg_accuracy },
                { label: 'Completeness', value: resource.avg_completeness },
                { label: 'Relevance', value: resource.avg_relevance },
                { label: 'Usefulness', value: resource.avg_usefulness }
              ].map(m => html`
                <div key=${m.label} class="text-center p-3 bg-cream-50 rounded-xl border border-cream-200">
                  <p class="text-xl font-bold text-navy-950">${m.value ? Number(m.value).toFixed(1) : '–'}</p>
                  <p class="text-[10px] font-semibold text-warmgray-500 mt-0.5">${m.label}</p>
                  <div class="w-full bg-cream-200 rounded-full h-1 mt-2">
                    <div class="bg-navy-600 h-1 rounded-full" style=${{ width: `${((m.value || 0) / 5) * 100}%` }}></div>
                  </div>
                </div>
              `)}
            </div>
          </div>
        ` : null}

        <!-- Peer Teachers — Core Differentiator -->
        ${peerTeachers && peerTeachers.length > 0 ? html`
          <div class="bg-gradient-to-br from-navy-900 to-navy-950 rounded-2xl border border-navy-800 shadow-lg p-6 text-white space-y-4">
            <div class="space-y-1">
              <p class="text-[10px] font-black uppercase tracking-widest text-navy-300">Learn From Real Peers</p>
              <h2 class="font-serif text-xl font-bold">${peerTeachers.length} peer${peerTeachers.length > 1 ? 's' : ''} can teach you ${resource.subject}</h2>
              <p class="text-xs text-navy-300 leading-relaxed">Exchange your knowledge for 1:1 teaching sessions — completely free through skill swapping.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${peerTeachers.map(peer => html`
                <div key=${peer.id} class="bg-navy-800/60 rounded-xl border border-navy-700 p-4 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <img src=${peer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop'} class="w-10 h-10 rounded-xl object-cover border border-navy-600 shrink-0" />
                    <div class="min-w-0">
                      <p class="font-bold text-sm truncate">${peer.name}</p>
                      <p class="text-[10px] text-navy-300 font-semibold">${peer.skill_name} · ${peer.level || 'Intermediate'}</p>
                      ${peer.avg_rating ? html`<p class="text-[10px] text-amber-400 font-bold">★ ${peer.avg_rating}</p>` : null}
                    </div>
                  </div>
                  <button onClick=${() => onProposeSwap && onProposeSwap(peer)}
                    class="shrink-0 px-3 py-2 bg-white hover:bg-cream-100 text-navy-950 font-bold text-[10px] rounded-lg transition-all">
                    Propose Swap
                  </button>
                </div>
              `)}
            </div>
            <button onClick=${() => setActiveTab('matches')} class="w-full py-2.5 border border-navy-700 text-white font-bold text-xs rounded-xl hover:bg-navy-800 transition-all">
              Explore All Matches →
            </button>
          </div>
        ` : null}

        <!-- Reviews -->
        <div class="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
            <h2 class="font-serif font-bold text-navy-950">Community Reviews</h2>
            ${!isOwn && !reviewSuccess ? html`
              <button onClick=${() => setShowReviewForm(!showReviewForm)} class="px-3 py-1.5 bg-navy-700 text-white font-bold text-[10px] rounded-lg">
                + Write Review
              </button>
            ` : null}
          </div>
          ${reviewSuccess ? html`<div class="p-4 text-center text-emerald-600 text-sm font-bold">✓ Review submitted! Thank you.</div>` : null}
          ${showReviewForm ? html`
            <form onSubmit=${handleReviewSubmit} class="p-6 border-b border-cream-100 space-y-4 bg-cream-50">
              <div class="grid grid-cols-2 gap-4">
                ${['accuracy', 'completeness', 'relevance', 'usefulness'].map(field => html`
                  <div key=${field}>
                    <label class="block text-[10px] font-bold uppercase tracking-wide text-warmgray-500 mb-1">${field}</label>
                    <div class="flex gap-1">
                      ${[1,2,3,4,5].map(star => html`
                        <button key=${star} type="button" onClick=${() => setReviewForm(f => ({ ...f, [field]: star }))}
                          class="text-xl ${star <= reviewForm[field] ? 'text-amber-400' : 'text-cream-300'} hover:text-amber-400 transition-colors leading-none">★</button>
                      `)}
                    </div>
                  </div>
                `)}
              </div>
              <textarea value=${reviewForm.comment} onInput=${e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                rows="2" placeholder="Optional comment..." class="w-full p-2.5 bg-white border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none resize-none"></textarea>
              <button type="submit" disabled=${reviewSubmitting} class="w-full py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl disabled:opacity-50">
                ${reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ` : null}
          ${reviews && reviews.length === 0 ? html`
            <div class="p-8 text-center text-xs text-warmgray-400">No reviews yet. Be the first to review this resource.</div>
          ` : html`
            <div class="divide-y divide-cream-100">
              ${reviews && reviews.map(r => html`
                <div key=${r.id} class="px-6 py-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <img src=${r.reviewer_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop'} class="w-7 h-7 rounded-full object-cover" />
                      <span class="text-xs font-bold text-navy-950">${r.reviewer_name}</span>
                    </div>
                    <span class="text-xs font-bold text-amber-500">★ ${((Number(r.accuracy) + Number(r.completeness) + Number(r.relevance) + Number(r.usefulness)) / 4).toFixed(1)}</span>
                  </div>
                  ${r.comment ? html`<p class="text-xs text-warmgray-600 leading-relaxed">${r.comment}</p>` : null}
                </div>
              `)}
            </div>
          `}
        </div>
      </div>
    `;
  }
  window.SkillSwap.LearningHubDetailView = LearningHubDetailView;

  // -------------------------------------------------------
  // 4. Saved Resources View
  // -------------------------------------------------------
  function LearningHubSavedView({ setActiveTab, currentUser, onViewResource }) {
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      api('/api/resources/saved')
        .then(d => setSaved(d.saved || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const handleUnsave = async (id) => {
      await api('/api/resources/saved', { method: 'DELETE', body: JSON.stringify({ resource_id: id }) }).catch(() => {});
      setSaved(s => s.filter(r => r.id !== id));
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl font-bold text-navy-950">🔖 Saved Resources</h1>
            <p class="text-sm text-warmgray-500 mt-1">${saved.length} resource${saved.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button onClick=${() => setActiveTab('hub-browse')} class="px-4 py-2 border border-cream-300 text-navy-700 font-bold text-xs rounded-xl hover:bg-cream-50">Browse More</button>
        </div>
        ${loading ? html`<div class="text-center py-16 text-warmgray-400">Loading...</div>` : null}
        ${!loading && saved.length === 0 ? html`
          <div class="text-center py-20 space-y-4">
            <p class="text-4xl">🔖</p>
            <p class="font-bold text-navy-900">No saved resources yet</p>
            <p class="text-sm text-warmgray-500">Browse resources and click the bookmark icon to save them for later.</p>
            <button onClick=${() => setActiveTab('hub-browse')} class="mt-2 px-5 py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl">Browse Learning Hub</button>
          </div>
        ` : null}
        ${!loading && saved.length > 0 ? html`
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${saved.map(r => html`
              <${ResourceCard} key=${r.id} resource=${{ ...r, is_saved: 1 }} onView=${onViewResource}
                onSave=${(id) => handleUnsave(id)} currentUserId=${currentUser && currentUser.id} />
            `)}
          </div>
        ` : null}
      </div>
    `;
  }
  window.SkillSwap.LearningHubSavedView = LearningHubSavedView;

  // -------------------------------------------------------
  // 5. My Resources (Uploads + Downloads)
  // -------------------------------------------------------
  function LearningHubMyView({ setActiveTab, currentUser, onViewResource }) {
    const [tab, setTab] = useState('uploads');
    const [uploads, setUploads] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      api('/api/resources/my?tab=' + tab)
        .then(d => {
          if (tab === 'uploads') setUploads(d.uploads || []);
          else setDownloads(d.downloads || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [tab]);

    const STATUS_BADGE = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
      REPORTED: 'bg-red-50 text-red-700 border-red-200'
    };

    return html`
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
        <h1 class="font-serif text-2xl font-bold text-navy-950">My Resources</h1>
        <div class="flex border-b border-cream-300">
          ${[['uploads', '⬆ My Uploads'], ['downloads', '⬇ Download History']].map(([t, label]) => html`
            <button key=${t} onClick=${() => setTab(t)}
              class="px-5 py-3 text-xs font-bold border-b-2 transition-all ${tab === t ? 'border-navy-700 text-navy-700' : 'border-transparent text-warmgray-500 hover:text-navy-700'}">
              ${label}
            </button>
          `)}
        </div>
        ${loading ? html`<div class="text-center py-12 text-warmgray-400">Loading...</div>` : null}
        ${!loading && tab === 'uploads' ? html`
          ${uploads.length === 0 ? html`
            <div class="text-center py-16 space-y-4">
              <p class="text-4xl">📤</p>
              <p class="font-bold text-navy-900">No uploads yet</p>
              <button onClick=${() => setActiveTab('hub-upload')} class="px-5 py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl">Share Your First Resource</button>
            </div>
          ` : html`
            <div class="space-y-3">
              ${uploads.map(r => html`
                <div key=${r.id} class="bg-white rounded-xl border border-cream-300 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition-all cursor-pointer" onClick=${() => onViewResource && onViewResource(r)}>
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-xl">${getTypeInfo(r.type).icon}</span>
                    <div class="min-w-0">
                      <p class="font-bold text-navy-950 text-sm truncate">${r.title}</p>
                      <p class="text-[10px] text-warmgray-500 font-semibold">${r.subject}${r.semester ? ' · Sem ' + r.semester : ''}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 shrink-0">
                    <span class="text-[10px] text-warmgray-400 font-semibold">⬇ ${r.downloads || 0}</span>
                    <span class="px-2.5 py-1 rounded-full text-[9px] font-bold border ${STATUS_BADGE[r.status] || 'bg-cream-100 text-navy-700 border-cream-200'}">${r.status}</span>
                  </div>
                </div>
              `)}
            </div>
          `}
        ` : null}
        ${!loading && tab === 'downloads' ? html`
          ${downloads.length === 0 ? html`
            <div class="text-center py-16 space-y-4">
              <p class="text-4xl">⬇</p>
              <p class="font-bold text-navy-900">No downloads yet</p>
              <button onClick=${() => setActiveTab('hub-browse')} class="px-5 py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl">Browse Resources</button>
            </div>
          ` : html`
            <div class="space-y-3">
              ${downloads.map(r => html`
                <div key=${r.id} class="bg-white rounded-xl border border-cream-300 shadow-sm p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md" onClick=${() => onViewResource && onViewResource(r)}>
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-xl">${getTypeInfo(r.type).icon}</span>
                    <div class="min-w-0">
                      <p class="font-bold text-navy-950 text-sm truncate">${r.title}</p>
                      <p class="text-[10px] text-warmgray-500">${r.subject} · by ${r.contributor_name}</p>
                    </div>
                  </div>
                  <p class="text-[10px] text-warmgray-400 shrink-0">${new Date(r.downloaded_at).toLocaleDateString()}</p>
                </div>
              `)}
            </div>
          `}
        ` : null}
      </div>
    `;
  }
  window.SkillSwap.LearningHubMyView = LearningHubMyView;

  // -------------------------------------------------------
  // 6. Resource Requests View
  // -------------------------------------------------------
  function LearningHubRequestsView({ setActiveTab }) {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ subject: '', university: '', course: '', semester: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
      api('/api/resources/requests').then(d => setRequests(d.requests || [])).catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.subject || !form.description) return;
      setSubmitting(true);
      try {
        await api('/api/resources/requests', { method: 'POST', body: JSON.stringify(form) });
        setSubmitted(true); setShowForm(false);
        const d = await api('/api/resources/requests');
        setRequests(d.requests || []);
      } catch (e) { alert(e.message || 'Failed'); }
      finally { setSubmitting(false); }
    };

    return html`
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-serif text-2xl font-bold text-navy-950">📬 Resource Requests</h1>
            <p class="text-sm text-warmgray-500 mt-1">Request notes or materials from the community</p>
          </div>
          <button onClick=${() => setShowForm(!showForm)} class="px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm">+ New Request</button>
        </div>
        ${submitted ? html`<div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold">✓ Request posted! The community can now respond.</div>` : null}
        ${showForm ? html`
          <form onSubmit=${handleSubmit} class="bg-white rounded-2xl border border-cream-300 shadow-sm p-6 space-y-4">
            <h2 class="font-bold text-navy-950">New Resource Request</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-navy-950 mb-1">Subject *</label>
                <input value=${form.subject} onInput=${e => setForm(f => ({...f, subject: e.target.value}))} placeholder="e.g. Operating Systems" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500" />
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-950 mb-1">University</label>
                <input value=${form.university} onInput=${e => setForm(f => ({...f, university: e.target.value}))} placeholder="e.g. VTU, Anna University" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500" />
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-950 mb-1">Course</label>
                <input value=${form.course} onInput=${e => setForm(f => ({...f, course: e.target.value}))} placeholder="e.g. B.Tech CSE" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500" />
              </div>
              <div>
                <label class="block text-xs font-bold text-navy-950 mb-1">Semester</label>
                <select value=${form.semester} onChange=${e => setForm(f => ({...f, semester: e.target.value}))} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-500">
                  <option value="">Any Semester</option>
                  ${[1,2,3,4,5,6,7,8].map(s => html`<option key=${s} value=${s}>Semester ${s}</option>`)}
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-navy-950 mb-1">What do you need? *</label>
              <textarea value=${form.description} onInput=${e => setForm(f => ({...f, description: e.target.value}))} rows="3"
                placeholder="Describe what material you're looking for — specific units, topics, resource type, etc."
                class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none resize-none focus:border-navy-500"></textarea>
            </div>
            <button type="submit" disabled=${submitting} class="w-full py-3 bg-navy-700 text-white font-bold text-xs rounded-xl disabled:opacity-50">${submitting ? 'Posting...' : 'Post Request'}</button>
          </form>
        ` : null}
        ${requests.length === 0 ? html`
          <div class="text-center py-16 space-y-3">
            <p class="text-3xl">📭</p>
            <p class="font-bold text-navy-900">No open requests</p>
            <p class="text-sm text-warmgray-500">Be the first to request a resource from the community!</p>
          </div>
        ` : html`
          <div class="space-y-3">
            ${requests.map(rq => html`
              <div key=${rq.id} class="bg-white rounded-xl border border-cream-300 shadow-sm p-5 space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-2.5">
                    <img src=${rq.requester_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop'} class="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p class="text-xs font-bold text-navy-950">${rq.requester_name}</p>
                      <p class="text-[10px] text-warmgray-400">${new Date(rq.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 bg-cream-100 text-navy-700 text-[9px] font-bold rounded-full border border-cream-300">OPEN</span>
                </div>
                <div>
                  <p class="font-bold text-navy-950 text-sm">${rq.subject}</p>
                  ${rq.university ? html`<p class="text-[10px] text-warmgray-500 font-semibold">${rq.university}${rq.course ? ' · ' + rq.course : ''}${rq.semester ? ' · Sem ' + rq.semester : ''}</p>` : null}
                  <p class="text-xs text-warmgray-600 mt-1.5 leading-relaxed">${rq.description}</p>
                </div>
                <button onClick=${() => setActiveTab('hub-upload')} class="px-4 py-2 border border-navy-300 text-navy-700 font-bold text-xs rounded-xl hover:bg-navy-50 transition-all">Share a resource for this →</button>
              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }
  window.SkillSwap.LearningHubRequestsView = LearningHubRequestsView;

  // -------------------------------------------------------
  // 7. Exam Mode View
  // -------------------------------------------------------
  function ExamModeView({ setActiveTab }) {
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
      e.preventDefault();
      if (!subject) return;
      setLoading(true); setSearched(true);
      try {
        const params = new URLSearchParams({ q: subject, limit: 30 });
        if (semester) params.append('semester', semester);
        const data = await api('/api/resources?' + params.toString());
        setResources(data.resources || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };

    const byType = (type) => resources.filter(r => r.type === type);

    const sections = [
      { type: 'KEY_POINTS', label: '⚡ Key Concepts & Questions', bgClass: 'bg-violet-50 border-violet-200 text-violet-900', subText: 'text-violet-500' },
      { type: 'PYQ', label: '📄 Previous Year Papers', bgClass: 'bg-emerald-50 border-emerald-200 text-emerald-900', subText: 'text-emerald-500' },
      { type: 'EXAM_PREP', label: '🎯 Last-Minute Notes', bgClass: 'bg-indigo-50 border-indigo-200 text-indigo-900', subText: 'text-indigo-500' },
      { type: 'NOTES', label: '📝 Notes', bgClass: 'bg-blue-50 border-blue-200 text-blue-900', subText: 'text-blue-500' },
      { type: 'QUESTION_BANK', label: '❓ Question Banks', bgClass: 'bg-orange-50 border-orange-200 text-orange-900', subText: 'text-orange-500' }
    ];

    return html`
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
        <div class="bg-gradient-to-br from-indigo-900 to-navy-950 text-white rounded-2xl p-6 space-y-4">
          <div>
            <span class="text-[10px] font-black uppercase tracking-widest text-indigo-300">Focused Study Mode</span>
            <h1 class="font-serif text-2xl font-bold mt-1">🎯 Exam Mode</h1>
            <p class="text-xs text-indigo-200 mt-1">Get a focused view of Key Points, PYQs, and Last-Minute Notes for any subject</p>
          </div>
          <form onSubmit=${handleSearch} class="flex flex-col sm:flex-row gap-3">
            <input type="text" value=${subject} onInput=${e => setSubject(e.target.value)}
              placeholder="Enter subject name (e.g. DBMS, Operating Systems)..."
              class="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder-white/50 focus:outline-none focus:border-white/40" />
            <select value=${semester} onChange=${e => setSemester(e.target.value)}
              class="px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-none">
              <option value="">All Sem</option>
              ${[1,2,3,4,5,6,7,8].map(s => html`<option key=${s} value=${s}>Sem ${s}</option>`)}
            </select>
            <button type="submit" class="px-5 py-2.5 bg-white text-navy-950 font-bold text-xs rounded-xl hover:bg-cream-100 transition-all">Search</button>
          </form>
        </div>

        ${loading ? html`<div class="text-center py-12 text-warmgray-400">Loading resources for ${subject}...</div>` : null}

        ${searched && !loading && resources.length === 0 ? html`
          <div class="text-center py-12 space-y-3">
            <p class="text-2xl">🚫</p>
            <p class="font-bold text-navy-900">No resources found for "${subject}"</p>
            <p class="text-sm text-warmgray-500">Be the first to share Key-Point Notes for this subject!</p>
            <button onClick=${() => setActiveTab('hub-upload')} class="px-5 py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl mt-2">Share Key-Point Notes</button>
          </div>
        ` : null}

        ${searched && !loading && resources.length > 0 ? html`
          <div class="space-y-8">
            ${sections.map(s => {
              const items = byType(s.type);
              if (!items.length) return null;
              return html`
                <div key=${s.type} class="space-y-3">
                  <h2 class="font-serif font-bold text-navy-950 flex items-center gap-2">
                    ${s.label}
                    <span class="text-xs font-normal text-warmgray-400">${items.length} resource${items.length > 1 ? 's' : ''}</span>
                  </h2>
                  <div class="grid sm:grid-cols-2 gap-3">
                    ${items.map(r => html`
                      <div key=${r.id} class="border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${s.bgClass}"
                        onClick=${() => { window._hubDetailResourceId = r.id; setActiveTab('hub-detail'); }}>
                        <p class="font-bold text-sm">${r.title}</p>
                        <p class="text-[10px] mt-0.5 ${s.subText}">${r.contributor_name}${r.avg_rating ? ' · ★ ' + Number(r.avg_rating).toFixed(1) : ''} · ⬇ ${r.downloads || 0}</p>
                      </div>
                    `)}
                  </div>
                </div>
              `;
            })}
          </div>
        ` : null}
      </div>
    `;
  }
  window.SkillSwap.ExamModeView = ExamModeView;

})();
