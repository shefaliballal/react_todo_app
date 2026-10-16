import { useEffect, useState } from 'react';

const DEMO_EMAIL = 'student@example.com';
const DEMO_PASSWORD = 'password123';
const TODO_STORAGE_KEY = 'daymark.todos';
const AUTH_STORAGE_KEY = 'daymark.authenticated';

const initialTodos = [
  { id: 'sample-1', text: 'Make a little room for focus', completed: false },
  { id: 'sample-2', text: 'Take a proper lunch break', completed: false },
  { id: 'sample-3', text: 'Write down one thing that went well', completed: true },
];

function getSavedTodos() {
  try {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTodos;
  } catch {
    return initialTodos;
  }
}

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true',
  );
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }

  function logIn() {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    setAuthenticated(true);
    navigate('/todos');
  }

  function logOut() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthenticated(false);
    navigate('/login');
  }

  if (!authenticated || path !== '/todos') {
    if (authenticated && path !== '/todos') {
      return <LoginPage onLogin={logIn} />;
    }
    return <LoginPage onLogin={logIn} />;
  }

  return <TodoPage onLogout={logOut} />;
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('That email and password do not match our demo account.');
      return;
    }

    onLogin();
  }

  return (
    <main className="login-layout">
      <section className="login-intro" aria-label="Welcome to Daymark">
        <a className="wordmark" href="/login" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark" aria-hidden="true">d</span>
          daymark
        </a>
        <div className="intro-copy">
          <p className="eyebrow">A clearer kind of to-do</p>
          <h1>Make space for<br /><span>what matters.</span></h1>
          <p className="intro-description">A small, steady place to gather your tasks and move through the day with intention.</p>
        </div>
        <div className="intro-note">
          <span className="note-line" aria-hidden="true" />
          <span>One thing at a time is still progress.</span>
        </div>
        <div className="sun-shape" aria-hidden="true"><span /></div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your day</h2>
          <p className="form-subtitle">Your list is right where you left it.</p>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby={error ? 'login-error' : undefined}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby={error ? 'login-error' : undefined}
            />
            {error && <p className="form-error" id="login-error" role="alert">{error}</p>}
            <button className="primary-button login-button" type="submit">
              Sign in <span aria-hidden="true">&rarr;</span>
            </button>
          </form>
          <p className="demo-hint">Demo access <span>student@example.com</span><span>password123</span></p>
        </div>
        <footer className="login-footer">A little more present, a little less scattered.</footer>
      </section>
    </main>
  );
}

function TodoPage({ onLogout }) {
  const [todos, setTodos] = useState(getSavedTodos);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const remaining = todos.filter((todo) => !todo.completed).length;
  const visibleTodos = todos.filter((todo) => {
    if (filter === 'Active') return !todo.completed;
    if (filter === 'Completed') return todo.completed;
    return true;
  });

  function addTodo(event) {
    event.preventDefault();
    const text = newTodo.trim();
    if (!text) return;
    setTodos((current) => [...current, { id: crypto.randomUUID(), text, completed: false }]);
    setNewTodo('');
  }

  function toggleTodo(id) {
    setTodos((current) => current.map((todo) => (
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )));
  }

  function deleteTodo(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  return (
    <main className="todo-page">
      <header className="app-header">
        <a className="wordmark" href="/todos" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark" aria-hidden="true">d</span>
          daymark
        </a>
        <button className="logout-button" onClick={onLogout}>
          <span aria-hidden="true">&#8599;</span> Log out
        </button>
      </header>

      <section className="todo-content">
        <div className="date-stamp"><span className="date-dot" /> YOUR SPACE, YOUR PACE</div>
        <div className="todo-heading-row">
          <div>
            <p className="eyebrow">A fresh page</p>
            <h1>Today<span className="heading-period">.</span></h1>
          </div>
          <p className="remaining-count"><strong>{remaining}</strong> {remaining === 1 ? 'thing' : 'things'}<br />left to do</p>
        </div>

        <form className="add-form" onSubmit={addTodo}>
          <span className="add-symbol" aria-hidden="true">+</span>
          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="What would you like to get done?"
            aria-label="New todo"
            maxLength={160}
          />
          <button type="submit" disabled={!newTodo.trim()} aria-label="Add todo">Add</button>
        </form>

        <div className="list-toolbar">
          <div className="filter-tabs" role="group" aria-label="Filter todos">
            {['All', 'Active', 'Completed'].map((item) => (
              <button
                className={filter === item ? 'filter-tab selected' : 'filter-tab'}
                key={item}
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="task-total">{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span>
        </div>

        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li className={todo.completed ? 'todo-item is-complete' : 'todo-item'} key={todo.id}>
              <button
                className="check-button"
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.completed ? `Mark ${todo.text} as active` : `Complete ${todo.text}`}
                aria-pressed={todo.completed}
              >
                {todo.completed && <span aria-hidden="true">&#10003;</span>}
              </button>
              <span className="todo-text">{todo.text}</span>
              <button className="delete-button" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.text}`}>
                <span aria-hidden="true">&times;</span>
              </button>
            </li>
          ))}
        </ul>

        {visibleTodos.length === 0 && (
          <div className="empty-state">
            <span className="empty-mark" aria-hidden="true">&#10038;</span>
            <p>{filter === 'Completed' ? 'Nothing checked off just yet.' : filter === 'Active' ? 'All clear. Take a breath.' : 'A little space to begin.'}</p>
          </div>
        )}

        <footer className="todo-footer">
          <span>Keep it kind. Keep it moving.</span>
          <span className="footer-spark" aria-hidden="true">&#10022;</span>
        </footer>
      </section>
    </main>
  );
}

export default App;