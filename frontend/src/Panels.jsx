import { useEffect, useState } from 'react';
import api, { errMsg } from './api';

const fmt = d => (d ? new Date(d).toLocaleDateString() : '-');
const fmtT = d => (d ? new Date(d).toLocaleTimeString() : '-');
const badge = s => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s] || 'secondary');

function useLoad(url) {
  const [data, setData] = useState([]);
  const load = () => api.get(url).then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, [url]);
  return [data, load];
}
const Card = ({ title, children }) => (
  <div className="card mb-3"><div className="card-header fw-semibold">{title}</div><div className="card-body">{children}</div></div>
);
const Msg = ({ m }) => m ? <div className="alert alert-info py-2">{m}</div> : null;

export function Profile() {
  const [p, setP] = useState(null); const [m, setM] = useState('');
  useEffect(() => { api.get('/employees/me').then(r => setP(r.data)); }, []);
  if (!p) return null;
  const save = async e => {
    e.preventDefault();
    try { await api.put('/employees/me', p); setM('Profile updated'); } catch (e) { setM(errMsg(e)); }
  };
  return (
    <Card title="My Profile"><Msg m={m} />
      <form onSubmit={save} className="row g-2">
        {['name', 'phone', 'department', 'designation'].map(k => (
          <div className="col-md-6" key={k}>
            <label className="form-label text-capitalize">{k}</label>
            <input className="form-control" value={p[k] || ''} onChange={e => setP({ ...p, [k]: e.target.value })} />
          </div>))}
        <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" disabled value={p.email} /></div>
        <div className="col-12"><button className="btn btn-primary">Save</button></div>
      </form>
    </Card>
  );
}

export function Leaves({ user }) {
  const [mine, loadMine] = useLoad('/leaves/mine');
  const [team, loadTeam] = useLoad(user.role === 'employee' ? '/leaves/mine' : '/leaves');
  const [f, setF] = useState({ type: 'Casual', fromDate: '', toDate: '', reason: '' });
  const [m, setM] = useState('');
  const apply = async e => {
    e.preventDefault();
    try { await api.post('/leaves', f); setM('Leave applied'); setF({ type: 'Casual', fromDate: '', toDate: '', reason: '' }); loadMine(); loadTeam(); }
    catch (e) { setM(errMsg(e)); }
  };
  const setStatus = async (id, status) => { try { await api.put(`/leaves/${id}/status`, { status }); loadTeam(); } catch (e) { setM(errMsg(e)); } };
  return (<>
    <Card title="Apply for Leave"><Msg m={m} />
      <form onSubmit={apply} className="row g-2">
        <div className="col-md-2"><select className="form-select" value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
          {['Casual', 'Sick', 'Earned', 'Other'].map(t => <option key={t}>{t}</option>)}</select></div>
        <div className="col-md-2"><input type="date" required className="form-control" value={f.fromDate} onChange={e => setF({ ...f, fromDate: e.target.value })} /></div>
        <div className="col-md-2"><input type="date" required className="form-control" value={f.toDate} onChange={e => setF({ ...f, toDate: e.target.value })} /></div>
        <div className="col-md-4"><input className="form-control" placeholder="Reason" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} /></div>
        <div className="col-md-2"><button className="btn btn-primary w-100">Apply</button></div>
      </form>
    </Card>
    <Card title="My Leaves">
      <table className="table table-sm"><thead><tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>{mine.map(l => <tr key={l._id}><td>{l.type}</td><td>{fmt(l.fromDate)}</td><td>{fmt(l.toDate)}</td><td>{l.reason}</td>
          <td><span className={'badge bg-' + badge(l.status)}>{l.status}</span></td></tr>)}</tbody></table>
    </Card>
    {user.role !== 'employee' && <Card title={user.role === 'hr' ? 'All Leave Requests' : 'Team Leave Requests'}>
      <table className="table table-sm"><thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{team.map(l => <tr key={l._id}><td>{l.employee?.name}</td><td>{l.type}</td><td>{fmt(l.fromDate)}</td><td>{fmt(l.toDate)}</td><td>{l.reason}</td>
          <td><span className={'badge bg-' + badge(l.status)}>{l.status}</span></td>
          <td>{l.status === 'pending' && <>
            <button className="btn btn-sm btn-success me-1" onClick={() => setStatus(l._id, 'approved')}>Approve</button>
            <button className="btn btn-sm btn-danger" onClick={() => setStatus(l._id, 'rejected')}>Reject</button></>}</td></tr>)}</tbody></table>
    </Card>}
  </>);
}

export function Attendance({ user }) {
  const [mine, loadMine] = useLoad('/attendance/mine');
  const [all] = useLoad(user.role === 'employee' ? '/attendance/mine' : '/attendance');
  const [m, setM] = useState('');
  const act = async p => { try { await api.post('/attendance/' + p); setM(p === 'checkin' ? 'Checked in' : 'Checked out'); } catch (e) { setM(errMsg(e)); } loadMine(); };
  return (<>
    <Card title="Mark Attendance"><Msg m={m} />
      <button className="btn btn-success me-2" onClick={() => act('checkin')}>Check In</button>
      <button className="btn btn-danger" onClick={() => act('checkout')}>Check Out</button>
    </Card>
    <Card title="My Attendance">
      <table className="table table-sm"><thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
        <tbody>{mine.map(a => <tr key={a._id}><td>{a.date}</td><td>{fmtT(a.checkIn)}</td><td>{fmtT(a.checkOut)}</td><td>{a.status}</td></tr>)}</tbody></table>
    </Card>
    {user.role !== 'employee' && <Card title={user.role === 'hr' ? 'All Attendance' : 'Team Attendance'}>
      <table className="table table-sm"><thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th></tr></thead>
        <tbody>{all.map(a => <tr key={a._id}><td>{a.employee?.name}</td><td>{a.date}</td><td>{fmtT(a.checkIn)}</td><td>{fmtT(a.checkOut)}</td></tr>)}</tbody></table>
    </Card>}
  </>);
}

export function Announcements({ user }) {
  const [list, load] = useLoad('/announcements');
  const [f, setF] = useState({ title: '', message: '' });
  const post = async e => { e.preventDefault(); await api.post('/announcements', f); setF({ title: '', message: '' }); load(); };
  const del = async id => { await api.delete('/announcements/' + id); load(); };
  return (<>
    {user.role === 'hr' && <Card title="Post Announcement / News">
      <form onSubmit={post}>
        <input className="form-control mb-2" placeholder="Title" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
        <textarea className="form-control mb-2" rows="3" placeholder="Message" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
        <button className="btn btn-primary">Post</button>
      </form></Card>}
    <Card title="Announcements">
      {list.length === 0 && <p className="text-muted mb-0">No announcements yet.</p>}
      {list.map(a => <div key={a._id} className="border rounded p-2 mb-2">
        <div className="d-flex justify-content-between"><strong>{a.title}</strong>
          {user.role === 'hr' && <button className="btn btn-sm btn-outline-danger" onClick={() => del(a._id)}>Delete</button>}</div>
        <div>{a.message}</div><small className="text-muted">{a.postedBy?.name} • {fmt(a.createdAt)}</small></div>)}
    </Card>
  </>);
}

export function Training({ user }) {
  const [list, load] = useLoad('/training');
  const [team] = useLoad(user.role === 'manager' ? '/employees' : '/employees/me');
  const [f, setF] = useState({ title: '', description: '', date: '', assignedTo: [] });
  const add = async e => { e.preventDefault(); await api.post('/training', f); setF({ title: '', description: '', date: '', assignedTo: [] }); load(); };
  const del = async id => { await api.delete('/training/' + id); load(); };
  return (<>
    {user.role === 'manager' && <Card title="Create Training Program">
      <form onSubmit={add} className="row g-2">
        <div className="col-md-4"><input className="form-control" placeholder="Title" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
        <div className="col-md-3"><input type="date" className="form-control" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
        <div className="col-md-5"><input className="form-control" placeholder="Description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div>
        <div className="col-12"><label className="form-label">Assign to (Ctrl+click for multiple)</label>
          <select multiple className="form-select" value={f.assignedTo} onChange={e => setF({ ...f, assignedTo: [...e.target.selectedOptions].map(o => o.value) })}>
            {Array.isArray(team) && team.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
        <div className="col-12"><button className="btn btn-primary">Create</button></div>
      </form></Card>}
    <Card title="Training & Development">
      <table className="table table-sm"><thead><tr><th>Title</th><th>Date</th><th>Description</th><th>Assigned To</th><th></th></tr></thead>
        <tbody>{list.map(t => <tr key={t._id}><td>{t.title}</td><td>{fmt(t.date)}</td><td>{t.description}</td>
          <td>{t.assignedTo?.map(a => a.name).join(', ')}</td>
          <td>{user.role === 'manager' && <button className="btn btn-sm btn-outline-danger" onClick={() => del(t._id)}>Delete</button>}</td></tr>)}</tbody></table>
    </Card>
  </>);
}

export function Employees({ user }) {
  const [list, load] = useLoad('/employees');
  const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', manager: '' };
  const [f, setF] = useState(empty); const [m, setM] = useState('');
  const managers = list.filter(e => e.role === 'manager');
  const add = async e => { e.preventDefault(); try { await api.post('/employees', f); setF(empty); setM('Employee added'); load(); } catch (e) { setM(errMsg(e)); } };
  const del = async id => { if (confirm('Delete this employee?')) { await api.delete('/employees/' + id); load(); } };
  return (<>
    {user.role === 'hr' && <Card title="Add Employee"><Msg m={m} />
      <form onSubmit={add} className="row g-2">
        <div className="col-md-3"><input className="form-control" placeholder="Name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
        <div className="col-md-3"><input type="email" className="form-control" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
        <div className="col-md-2"><input className="form-control" placeholder="Password (default 123456)" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
        <div className="col-md-2"><select className="form-select" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
          <option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option></select></div>
        <div className="col-md-2"><select className="form-select" value={f.manager} onChange={e => setF({ ...f, manager: e.target.value })}>
          <option value="">No manager</option>{managers.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}</select></div>
        <div className="col-md-3"><input className="form-control" placeholder="Department" value={f.department} onChange={e => setF({ ...f, department: e.target.value })} /></div>
        <div className="col-md-3"><input className="form-control" placeholder="Designation" value={f.designation} onChange={e => setF({ ...f, designation: e.target.value })} /></div>
        <div className="col-md-2"><button className="btn btn-primary w-100">Add</button></div>
      </form></Card>}
    <Card title={user.role === 'hr' ? 'All Employees' : 'My Team'}>
      <table className="table table-sm"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Designation</th><th>Manager</th><th></th></tr></thead>
        <tbody>{list.map(e => <tr key={e._id}><td>{e.name}</td><td>{e.email}</td><td>{e.role}</td><td>{e.department}</td><td>{e.designation}</td><td>{e.manager?.name}</td>
          <td>{user.role === 'hr' && <button className="btn btn-sm btn-outline-danger" onClick={() => del(e._id)}>Delete</button>}</td></tr>)}</tbody></table>
    </Card>
  </>);
}
