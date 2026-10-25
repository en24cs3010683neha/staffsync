import { useState } from 'react';
import api, { errMsg } from './api';
import Dashboard from './Dashboard';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault(); setErr('');
    try {
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', f);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (e) { setErr(errMsg(e)); }
  };
  const logout = () => { localStorage.clear(); setUser(null); };

  if (user) return <Dashboard user={user} logout={logout} />;

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 80 }}>
      <div className="card shadow-sm"><div className="card-body">
        <h3 className="text-center mb-1">StaffSync</h3>
        <p className="text-center text-muted">Modern HR Management</p>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <form onSubmit={submit}>
          {mode === 'register' && <input className="form-control mb-2" placeholder="Full name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />}
          <input className="form-control mb-2" type="email" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
          <input className="form-control mb-2" type="password" placeholder="Password" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          {mode === 'register' && (
            <select className="form-select mb-2" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
              <option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option>
            </select>)}
          <button className="btn btn-primary w-100">{mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        <button className="btn btn-link w-100 mt-2" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
          {mode === 'login' ? 'New user? Register' : 'Already have an account? Login'}
        </button>
        <small className="text-muted d-block text-center">Demo: hr@test.com / manager@test.com / employee@test.com (123456)</small>
      </div></div>
    </div>
  );
}
