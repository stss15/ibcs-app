import { useCallback, useEffect, useMemo, useState } from 'react';
import { addStudentsToClass, createClass, getTeacherDashboard, removeStudent } from '../lib/api.js';
import { useSession } from '../hooks/useSession.js';
import FeedbackPanel from '../components/ui/FeedbackPanel.jsx';
import './TeacherDashboardPage.css';

const DEFAULT_CLASS_FORM = {
  yearLevel: 'Year 7',
  classNumber: '1',
  studentCount: 30,
};

function TeacherDashboardPage() {
  const { session, ready } = useSession();
  const isTeacher = session?.user?.role === 'teacher';
  const token = session?.token ?? null;

  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classForm, setClassForm] = useState(DEFAULT_CLASS_FORM);
  const [pendingAdds, setPendingAdds] = useState({});
  const [removing, setRemoving] = useState({});

  const loadDashboard = useCallback(async () => {
    if (!token || !isTeacher) return;
    setLoading(true);
    try {
      const data = await getTeacherDashboard(token);
      setDashboard(data);
      setStatus(null);
    } catch (error) {
      setStatus({ tone: 'error', message: error.message || 'Failed to load dashboard.' });
    } finally {
      setLoading(false);
    }
  }, [token, isTeacher]);

  useEffect(() => {
    if (!ready || !isTeacher) return;
    loadDashboard();
  }, [ready, isTeacher, loadDashboard]);

  const totalStudents = useMemo(() => {
    return (dashboard?.classes ?? []).reduce((sum, classItem) => sum + (classItem.students?.length ?? 0), 0);
  }, [dashboard]);

  const handleCreateClass = useCallback(
    async (event) => {
      event.preventDefault();
      if (!token) return;
      setStatus({ tone: 'info', message: 'Creating class…' });
      try {
        await createClass(token, classForm);
        setClassForm(DEFAULT_CLASS_FORM);
        await loadDashboard();
        setStatus({ tone: 'success', message: 'Class created and students generated.' });
      } catch (error) {
        setStatus({ tone: 'error', message: error.message || 'Failed to create class.' });
      }
    },
    [token, classForm, loadDashboard],
  );

  const handleAddStudents = useCallback(
    async (event, classId) => {
      event.preventDefault();
      if (!token) return;
      const count = Math.max(1, Number(pendingAdds[classId] ?? 1));
      setStatus({ tone: 'info', message: 'Adding students…' });
      try {
        const result = await addStudentsToClass(token, classId, { count });
        setDashboard((prev) => {
          if (!prev) return prev;
          const updated = prev.classes.map((classItem) => {
            if (classItem.id !== classId) return classItem;
            return {
              ...classItem,
              students: [...(classItem.students ?? []), ...(result?.students ?? [])],
            };
          });
          return { ...prev, classes: updated };
        });
        setPendingAdds((prev) => ({ ...prev, [classId]: 1 }));
        setStatus({ tone: 'success', message: `${count} student${count > 1 ? 's' : ''} added.` });
      } catch (error) {
        setStatus({ tone: 'error', message: error.message || 'Failed to add students.' });
      }
    },
    [token, pendingAdds],
  );

  const handleRemoveStudent = useCallback(
    async (classId, student) => {
      if (!token) return;
      setRemoving((prev) => ({ ...prev, [student.id]: true }));
      setStatus({ tone: 'info', message: 'Removing student…' });
      try {
        await removeStudent(token, classId, student.id);
        setDashboard((prev) => {
          if (!prev) return prev;
          const updatedClasses = prev.classes.map((classItem) => {
            if (classItem.id !== classId) return classItem;
            return {
              ...classItem,
              students: (classItem.students ?? []).filter((item) => item.id !== student.id),
            };
          });
          return { ...prev, classes: updatedClasses };
        });
        setStatus({ tone: 'success', message: 'Student removed.' });
      } catch (error) {
        setStatus({ tone: 'error', message: error.message || 'Failed to remove student.' });
      } finally {
        setRemoving((prev) => {
          const next = { ...prev };
          delete next[student.id];
          return next;
        });
      }
    },
    [token],
  );

  if (!ready || !isTeacher) {
    return (
      <div className="teacher-dashboard">
        <section className="card">
          <p className="muted">Preparing your dashboard…</p>
        </section>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <section className="card create-class">
        <header>
          <h2>Create a class</h2>
          <p>Define the year group, class number, and how many students to generate.</p>
        </header>
        <form className="class-form" onSubmit={handleCreateClass}>
          <label>
            <span>Year level</span>
            <input
              value={classForm.yearLevel}
              onChange={(event) => setClassForm((prev) => ({ ...prev, yearLevel: event.target.value }))}
            />
          </label>
          <label>
            <span>Class number</span>
            <input
              value={classForm.classNumber}
              onChange={(event) => setClassForm((prev) => ({ ...prev, classNumber: event.target.value }))}
            />
          </label>
          <label>
            <span>Students to generate</span>
            <input
              type="number"
              min="0"
              max="60"
              value={classForm.studentCount}
              onChange={(event) =>
                setClassForm((prev) => ({ ...prev, studentCount: Number(event.target.value) || 0 }))
              }
            />
          </label>
          <button type="submit" className="dashboard-submit" disabled={loading}>
            Create class
          </button>
        </form>
        <dl className="class-stats">
          <div>
            <dt>Classes</dt>
            <dd>{dashboard?.classes?.length ?? 0}</dd>
          </div>
          <div>
            <dt>Students</dt>
            <dd>{totalStudents}</dd>
          </div>
        </dl>
        {status && (
          <FeedbackPanel tone={status.tone === 'error' ? 'error' : status.tone === 'success' ? 'success' : 'info'}>
            {status.message}
          </FeedbackPanel>
        )}
      </section>

      {(dashboard?.classes ?? []).length === 0 && (
        <section className="card empty-state">
          <h3>You don’t have any classes yet.</h3>
          <p>Create a class above to generate student credentials.</p>
        </section>
      )}

      {dashboard?.classes?.map((classItem) => (
        <section key={classItem.id} className="card class-card">
          <header className="class-card__header">
            <div>
              <h3>{classItem.label}</h3>
              <p className="muted">{classItem.code}</p>
            </div>
            <div className="class-card__stats">
              <span>{classItem.students?.length ?? 0} active students</span>
            </div>
          </header>
          <form className="class-actions" onSubmit={(event) => handleAddStudents(event, classItem.id)}>
            <label>
              <span>Add students</span>
              <input
                type="number"
                min="1"
                max="60"
                value={pendingAdds[classItem.id] ?? 1}
                onChange={(event) =>
                  setPendingAdds((prev) => ({ ...prev, [classItem.id]: event.target.value }))
                }
              />
            </label>
            <button type="submit" className="dashboard-submit">Generate credentials</button>
          </form>
          <div className="class-roster">
            <div className="class-roster__head">
              <span>#</span>
              <span>Username</span>
              <span>Password</span>
              <span>Actions</span>
            </div>
            <div className="class-roster__body">
              {(classItem.students ?? []).map((student) => (
                <div key={student.id} className="class-roster__row">
                  <span>{student.rosterNumber}</span>
                  <span>{student.username}</span>
                  <span className="password-chip">{student.password || '—'}</span>
                  <span>
                    <button
                      type="button"
                      className="button-outline"
                      disabled={!!removing[student.id]}
                      onClick={() => handleRemoveStudent(classItem.id, student)}
                    >
                      {removing[student.id] ? 'Removing…' : 'Remove'}
                    </button>
                  </span>
                </div>
              ))}
              {(classItem.students?.length ?? 0) === 0 && <p className="muted">No students yet.</p>}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export default TeacherDashboardPage;
