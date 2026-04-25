import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import {RobotTab} from './components/tabs/RobotTab';
import {RobotFace} from './components/tabs/RobotFace';
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const Classes = lazy(() => import('./pages/Classes'));          
const ClassDetails = lazy(() => import('./pages/ClassDetails')); 

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      localStorage.setItem('magic_join_code', joinCode);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);



  if (isAppLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>

          <Route element={<ProtectedRoute role="teacher" />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
          </Route>

          <Route path="/robot" element={<RobotTab />} />
          <Route path="/face" element={<RobotFace />} />

          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:id" element={<ClassDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;