import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';

type Route =
  | 'landing'
  | 'login'
  | 'signup'
  | 'user'
  | 'admin-login'
  | 'admin';

function getRouteFromPath(): Route {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/login') return 'login';
  if (path === '/signup') return 'signup';
  if (path === '/administrator' || path === '/admin') return 'admin-login';
  if (path.startsWith('/app')) return 'user';
  if (path.startsWith('/admin-panel')) return 'admin';
  return 'landing';
}

export default function App() {
  const { currentUser, state, loading } = useApp();
  const [route, setRoute] = useState<Route>(getRouteFromPath);

  useEffect(() => {
    const onPop = () => setRoute(getRouteFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (r: Route, path?: string) => {
    const paths: Record<Route, string> = {
      landing: '/',
      login: '/login',
      signup: '/signup',
      user: '/app',
      'admin-login': '/administrator',
      admin: '/admin-panel',
    };
    const p = path || paths[r];
    window.history.pushState({}, '', p);
    setRoute(r);
  };

  useEffect(() => {
    if (loading) return;
    if (state.isAdmin && route !== 'admin') {
      navigate('admin');
    } else if (currentUser && (route === 'login' || route === 'signup' || route === 'landing')) {
      navigate('user');
    } else if (!currentUser && !state.isAdmin && route === 'user') {
      navigate('login');
    } else if (!state.isAdmin && route === 'admin') {
      navigate('admin-login');
    }
  }, [currentUser, state.isAdmin, route, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (route === 'landing') return <Landing onNavigate={navigate} />;
  if (route === 'login') return <Login onNavigate={navigate} />;
  if (route === 'signup') return <Signup onNavigate={navigate} />;
  if (route === 'admin-login') return <AdminLogin onNavigate={navigate} />;
  if (route === 'admin' && state.isAdmin) return <AdminLayout onNavigate={navigate} />;
  if (route === 'user' && currentUser) return <UserLayout onNavigate={navigate} />;

  return <Landing onNavigate={navigate} />;
}
