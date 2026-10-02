import { useEffect, useMemo, useState } from 'react'
import { AlarmClock, ArrowDown, ArrowUp, BookOpen, Check, CheckCircle2, ChevronDown, Circle, Clock3, Command, Ellipsis, FileText, Focus, Leaf, ListTodo, Menu, MoreHorizontal, Pause, Play, Plus, Search, Settings2, Sparkles, SquarePen, Trash2, X } from 'lucide-react'

const API = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api'
const request = async (url, options) => {
  const response = await fetch(`${API}${url}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) {
    let detail = 'Something went wrong. Please try again.'
    try { detail = (await response.json()).detail || detail } catch {}
    throw new Error(detail)
  }
  return response.status === 204 ? null : response.json()
}
const todayLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
const clock = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

export default function App() {
  const [section, setSection] = useState('Overview')
  const [todos, setTodos] = useState([])
  const [notes, setNotes] = useState([])
  const [todoText, setTodoText] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [activeNote, setActiveNote] = useState(null)
  const [filter, setFilter] = useState('All tasks')
  const [remaining, setRemaining] = useState(25 * 60)
  const [duration, setDuration] = useState(25)
  const [running, setRunning] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const refresh = async () => {
    try {
      const [t, n] = await Promise.all([request('/todos'), request('/notes')])
      setTodos(t); setNotes(n); setError('')
    } catch (e) { setError(`Couldn't connect to the API: ${e.message}`) }
  }
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setRemaining(value => {
      if (value <= 1) { setRunning(false); setToast('Session complete — take a well-earned break.'); return 0 }
      return value - 1
    }), 1000)
    return () => clearInterval(id)
  }, [running])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3600); return () => clearTimeout(id) }, [toast])
  const completed = todos.filter(todo => todo.completed).length
  const visibleTodos = useMemo(() => filter === 'Completed' ? todos.filter(t => t.completed) : filter === 'Active' ? todos.filter(t => !t.completed) : todos, [todos, filter])
  const addTodo = async e => {
    e.preventDefault(); if (!todoText.trim()) return
    try { await request('/todos', { method: 'POST', body: JSON.stringify({ title: todoText }) }); setTodoText(''); await refresh() } catch (e) { setError(e.message) }
  }
  const toggleTodo = async id => { try { await request(`/todos/${id}`, { method: 'PATCH' }); await refresh() } catch (e) { setError(e.message) } }
  const deleteTodo = async id => { try { await request(`/todos/${id}`, { method: 'DELETE' }); await refresh() } catch (e) { setError(e.message) } }
  const saveNote = async e => {
    e?.preventDefault(); if (!noteTitle.trim()) return
    try {
      if (activeNote) await request(`/notes/${activeNote.id}`, { method: 'PUT', body: JSON.stringify({ title: noteTitle, content: noteContent }) })
      else await request('/notes', { method: 'POST', body: JSON.stringify({ title: noteTitle, content: noteContent }) })
      setActiveNote(null); setNoteTitle(''); setNoteContent(''); await refresh(); setToast('Note saved')
    } catch (e) { setError(e.message) }
  }
  const openNote = note => { setActiveNote(note); setNoteTitle(note.title); setNoteContent(note.content) }
  const newNote = () => { setActiveNote(null); setNoteTitle(''); setNoteContent('') }
  const deleteNote = async id => { try { await request(`/notes/${id}`, { method: 'DELETE' }); if (activeNote?.id === id) newNote(); await refresh() } catch (e) { setError(e.message) } }
  const setTimerDuration = value => { setDuration(value); setRemaining(value * 60); setRunning(false) }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={() => setSection('Overview')}><span className="brand-mark"><Sparkles size={17} strokeWidth={2.3}/></span><span>daymark<span className="brand-dot">.</span></span></a>
      <div className="workspace-label">WORKSPACE <button aria-label="Workspace options"><MoreHorizontal size={17}/></button></div>
      <div className="nav-group">
        <button className={`nav-item ${section === 'Overview' ? 'selected' : ''}`} onClick={() => setSection('Overview')}><span className="nav-icon overview-icon"><Command size={17}/></span>Overview</button>
        <button className={`nav-item ${section === 'My tasks' ? 'selected' : ''}`} onClick={() => setSection('My tasks')}><span className="nav-icon"><ListTodo size={17}/></span>My tasks<span className="nav-count">{todos.filter(t => !t.completed).length}</span></button>
        <button className={`nav-item ${section === 'Notes' ? 'selected' : ''}`} onClick={() => setSection('Notes')}><span className="nav-icon"><FileText size={17}/></span>Notes<span className="nav-count">{notes.length || ''}</span></button>
      </div>
      <div className="workspace-label section-space">YOUR FOCUS</div>
      <button className={`nav-item ${section === 'Pomodoro' ? 'selected' : ''}`} onClick={() => setSection('Pomodoro')}><span className="nav-icon"><AlarmClock size={17}/></span>Pomodoro</button>
      <div className="sidebar-bottom">
        <div className="focus-card"><span className="focus-spark"><Leaf size={16}/></span><p>A little progress<br/>goes a long way.</p><span className="focus-caption">YOU'RE DOING GREAT</span></div>
        <button className="profile"><span className="avatar">JD</span><span className="profile-copy"><b>Jordan Davis</b><small>Personal workspace</small></span><MoreHorizontal size={17}/></button>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{section}</b></div><div className="top-actions"><span className="date-pill"><Clock3 size={15}/>{todayLabel}</span><button className="icon-button search-button" aria-label="Search"><Search size={17}/><span>Search</span><kbd>⌘ K</kbd></button><button className="avatar top-avatar" aria-label="Profile">JD</button></div></header>
      <div className="page-wrap">
        {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><X size={16}/></button></div>}
        {section === 'Overview' && <>
          <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/>YOUR PERSONAL SPACE</div><h1>Make room for<br/><em>what matters.</em></h1><p className="welcome-sub">A calmer place to plan your day, capture thoughts,<br className="desktop-break"/> and find your focus.</p></div><div className="date-card"><div className="date-card-top"><span>TODAY</span><span className="date-sun">☼</span></div><div className="date-number">{new Date().getDate()}</div><div className="date-month">{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date())}</div><div className="date-rule"/><div className="date-quote">“The secret of getting<br/>ahead is getting started.”<small>— Mark Twain</small></div></div></div>
          <div className="stats-row"><div className="stat-card"><span className="stat-icon green"><ListTodo size={16}/></span><div><span>OPEN TASKS</span><b>{todos.length - completed}</b></div><small>things to focus on</small></div><div className="stat-card"><span className="stat-icon violet"><CheckCircle2 size={16}/></span><div><span>COMPLETED</span><b>{completed}</b></div><small>look at you go</small></div><div className="stat-card"><span className="stat-icon amber"><BookOpen size={16}/></span><div><span>YOUR NOTES</span><b>{notes.length}</b></div><small>ideas captured</small></div><button className="stat-card focus-stat" onClick={() => setSection('Pomodoro')}><span className="stat-icon coral"><Focus size={16}/></span><div><span>FOCUS TIME</span><b>{clock(remaining)}</b></div><small>ready when you are <ArrowUpRight/></small></button></div>
          <div className="content-grid">
            <section className="panel tasks-panel"><div className="panel-heading"><div><div className="panel-kicker"><span className="tiny-dot"/> YOUR DAY</div><h2>Today’s tasks</h2></div><button className="subtle-button" onClick={() => setSection('My tasks')}>View all <ArrowUpRight/></button></div>
              <form className="todo-form" onSubmit={addTodo}><Plus size={17}/><input aria-label="Add a task" value={todoText} onChange={e => setTodoText(e.target.value)} placeholder="Add a task to your day..."/><button disabled={!todoText.trim()} aria-label="Create task"><ArrowUp size={16}/></button></form>
              <div className="task-list">{todos.slice(0, 5).map(todo => <TodoRow key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo}/>)}{todos.length === 0 && <div className="empty-tasks"><span className="empty-check"><Check size={17}/></span><div><b>Your day is a blank page.</b><small>Add one small thing to get started.</small></div></div>}{todos.length > 5 && <button className="see-more" onClick={() => setSection('My tasks')}>See all {todos.length} tasks <ArrowUpRight size={14}/></button>}</div>
              <div className="task-footer"><span><span className="footer-dot"/>{Math.max(todos.length-completed,0)} tasks left in your day</span><span className="progress-label">{todos.length ? Math.round(completed/todos.length*100) : 0}%<span className="progress-track"><i style={{width: `${todos.length ? completed/todos.length*100 : 0}%`}}/></span></span></div>
            </section>
            <section className="panel focus-panel"><div className="focus-heading"><div><div className="panel-kicker"><span className="tiny-dot coral-dot"/> FIND YOUR FLOW</div><h2>Focus session</h2></div><button className="round-more" aria-label="Timer options"><Settings2 size={16}/></button></div><p className="focus-intro">One thing at a time. You’ve got this.</p><div className="timer-ring" style={{'--timer-progress': `${(remaining/(duration*60))*100}%`}}><div className="timer-inner"><span className="timer-label">{remaining === 0 ? 'COMPLETE' : running ? 'FOCUSING' : 'READY WHEN YOU ARE'}</span><span className="timer-value">{clock(remaining)}</span><span className="timer-mode"><span className="mode-dot"/>Focus time</span></div></div><div className="timer-controls"><button className={`play-button ${running ? 'is-running' : ''}`} onClick={() => { if (remaining === 0) setRemaining(duration*60); setRunning(!running) }}>{running ? <><Pause size={16} fill="currentColor"/> Pause session</> : <><Play size={16} fill="currentColor"/> Start focus session</>}</button><button className="reset-button" aria-label="Reset timer" onClick={() => { setRunning(false); setRemaining(duration*60) }}><ArrowUpRight/></button></div><div className="timer-divider"/><div className="duration-row"><span>SESSION LENGTH</span><div className="duration-options">{[15,25,45].map(min => <button key={min} className={duration===min?'active':''} onClick={() => setTimerDuration(min)}>{min} min</button>)}</div></div></section>
          </div>
          <div className="bottom-strip"><div className="strip-left"><span className="strip-spark"><Sparkles size={15}/></span><div><b>Make today a little lighter.</b><span>Small steps still move you forward.</span></div></div><div className="strip-right"><button onClick={() => setSection('Notes')}><SquarePen size={15}/>Capture a thought<ArrowUpRight size={14}/></button><span className="strip-divider"/><button onClick={() => setSection('Pomodoro')}><Clock3 size={15}/>Start a focus session<ArrowUpRight size={14}/></button></div></div>
        </>}
        {section === 'My tasks' && <><div className="subpage-header"><div className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL SPACE</div><h1>Your tasks<span className="heading-period">.</span></h1><p>Every small step adds up.</p></div><section className="panel full-panel"><div className="panel-heading"><div><div className="panel-kicker"><span className="tiny-dot"/> YOUR DAY</div><h2>Task list</h2></div><div className="filter-pills">{['All tasks','Active','Completed'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div><form className="todo-form" onSubmit={addTodo}><Plus size={17}/><input aria-label="Add a task" value={todoText} onChange={e=>setTodoText(e.target.value)} placeholder="What needs to get done?"/><button disabled={!todoText.trim()} aria-label="Create task"><ArrowUp size={16}/></button></form><div className="task-list">{visibleTodos.map(todo=><TodoRow key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo}/>)}{visibleTodos.length===0&&<div className="empty-state"><span className="empty-check"><Check size={17}/></span><b>{filter==='Completed'?'Nothing completed yet.':'No tasks here.'}</b><span>{filter==='Completed'?'Your wins will show up here.':'Add a task above to get started.'}</span></div>}</div><div className="task-footer"><span><span className="footer-dot"/>{todos.length-completed} tasks left in your day</span><span className="progress-label">{todos.length?Math.round(completed/todos.length*100):0}%<span className="progress-track"><i style={{width:`${todos.length?completed/todos.length*100:0}%`}}/></span></span></div></section></>}
        {section === 'Notes' && <><div className="subpage-header"><div className="eyebrow"><span className="eyebrow-line"/> A SPACE FOR YOUR THOUGHTS</div><h1>Notes<span className="heading-period">.</span></h1><p>Catch a thought before it floats away.</p></div><div className="notes-layout"><section className="panel notes-list-panel"><div className="panel-heading"><div><div className="panel-kicker"><span className="tiny-dot amber-dot"/> YOUR IDEAS</div><h2>All notes <span className="heading-count">{notes.length}</span></h2></div><button className="add-note-button" onClick={newNote}><Plus size={15}/> New note</button></div>{notes.length===0?<div className="notes-empty"><span className="note-empty-icon"><FileText size={19}/></span><b>No notes yet</b><span>Save an idea, thought, or reminder.</span><button onClick={newNote}><Plus size={14}/> Write your first note</button></div>:<div className="notes-list">{notes.map(note=><button className={`note-item ${activeNote?.id===note.id?'active':''}`} key={note.id} onClick={()=>openNote(note)}><span className="note-icon"><FileText size={15}/></span><span className="note-item-copy"><b>{note.title}</b><small>{note.content||'No additional text'}<br/>{new Date(note.updated_at).toLocaleDateString()}</small></span><ChevronDown size={14} className="note-chevron"/></button>)}</div>}</section><form className="panel editor-panel" onSubmit={saveNote}><div className="editor-toolbar"><span><span className="editor-dot"/> {activeNote?'EDITING NOTE':'NEW NOTE'}</span>{activeNote&&<button type="button" className="delete-note" onClick={()=>deleteNote(activeNote.id)} aria-label="Delete note"><Trash2 size={15}/></button>}</div><input className="note-title-input" value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Untitled note" aria-label="Note title"/><textarea className="note-content-input" value={noteContent} onChange={e=>setNoteContent(e.target.value)} placeholder="Start writing..." aria-label="Note content"/><div className="editor-footer"><span>{noteContent.length} characters</span><button className="save-note-button" disabled={!noteTitle.trim()}><Check size={15}/> Save note</button></div></form></div></>}
        {section === 'Pomodoro' && <><div className="subpage-header"><div className="eyebrow"><span className="eyebrow-line"/> PROTECT YOUR ATTENTION</div><h1>Find your flow<span className="heading-period">.</span></h1><p>Give one thing your full attention.</p></div><section className="panel pomodoro-page"><div className="pomodoro-copy"><div className="panel-kicker"><span className="tiny-dot coral-dot"/> THE POMODORO METHOD</div><h2>Do one thing.<br/><em>Do it well.</em></h2><p>Choose a session length, settle into a task, and let the rest of the world wait a little.</p><div className="duration-options large">{[15,25,45].map(min=><button key={min} className={duration===min?'active':''} onClick={()=>setTimerDuration(min)}><b>{min}</b><span>minutes</span></button>)}</div><div className="pomodoro-tip"><span><Leaf size={17}/></span><p><b>A gentle reminder</b><small>Take a short break between sessions. You’re a person, not a machine.</small></p></div></div><div className="pomodoro-clock"><div className="timer-ring large-ring" style={{'--timer-progress':`${remaining/(duration*60)*100}%`}}><div className="timer-inner"><span className="timer-label">{remaining===0?'COMPLETE':running?'FOCUSING':'READY WHEN YOU ARE'}</span><span className="timer-value">{clock(remaining)}</span><span className="timer-mode"><span className="mode-dot"/>Focus time</span></div></div><button className="play-button wide-play" onClick={()=>{if(remaining===0)setRemaining(duration*60);setRunning(!running)}}>{running?<><Pause size={16} fill="currentColor"/> Pause session</>:<><Play size={16} fill="currentColor"/> Start focus session</>}</button><button className="pomodoro-reset" onClick={()=>{setRunning(false);setRemaining(duration*60)}}>Reset timer</button></div></section></>}
        <footer className="page-footer"><span>TAKE IT ONE THING AT A TIME</span><span>MADE WITH <span className="footer-heart">♥</span> FOR YOUR EVERYDAY</span></footer>
      </div>
    </main>
    {toast&&<div className="toast" role="status"><CheckCircle2 size={17}/>{toast}</div>}
  </div>
}

function ArrowUpRight(){return <ArrowUp size={13} className="arrow-diag"/>}
function TodoRow({todo,onToggle,onDelete}) { return <div className={`task-row ${todo.completed?'done':''}`}><button className="check-button" onClick={()=>onToggle(todo.id)} aria-label={todo.completed?'Mark incomplete':'Mark complete'}>{todo.completed?<Check size={13}/>:<Circle size={17}/>}</button><span className="task-title">{todo.title}</span><span className="task-tag"><span/>Personal</span><button className="task-delete" onClick={()=>onDelete(todo.id)} aria-label="Delete task"><Trash2 size={14}/></button></div> }
