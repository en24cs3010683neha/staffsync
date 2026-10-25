import { useState } from 'react';
import { Profile, Leaves, Attendance, Announcements, Training, Employees } from './Panels';

export default function Dashboard({ user, logout }) {
  const tabs = [
    ['profile', 'My Profile'], ['leaves', 'Leaves'], ['attendance', 'Attendance'],
    ['announcements', 'Announcements'], ['training', 'Training'],
    ...(user.role !== 'employee' ? [['employees', user.role === 'hr' ? 'Employees' : 'My Team']] : [])
  ];
  const [tab, setTab] = useState('profile');
  const View = { profile: Profile, leaves: Leaves, attendance: Attendance, announcements: Announcements, training: Training, employees: Employees }[tab];

  return (
    <>
      <nav className="navbar navbar-dark bg-primary px-3">
        <span className="navbar-brand fw-bold">StaffSync</span>
        <span className="text-white">
          {user.name} <span className="badge bg-light text-primary text-uppercase">{user.role}</span>
          <button className="btn btn-sm btn-outline-light ms-3" onClick={logout}>Logout</button>
        </span>
      </nav>
      <div className="container mt-3">
        <ul className="nav nav-pills mb-3">
          {tabs.map(([k, label]) => (
            <li className="nav-item" key={k}>
              <button className={'nav-link ' + (tab === k ? 'active' : '')} onClick={() => setTab(k)}>{label}</button>
            </li>))}
        </ul>
        <View user={user} />
      </div>
    </>
  );
}
