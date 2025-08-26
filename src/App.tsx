import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AppDemo from './components/AppDemo';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background transition-colors duration-300">
                <Routes>
                  <Route path="/demo" element={<AppDemo />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
