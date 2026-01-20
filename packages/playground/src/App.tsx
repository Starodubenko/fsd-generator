import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { UserPage } from '@pages/UserPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav>
          <Link to="/">Home</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<h1>Home</h1>} />   
            <Route path="/user" element={<UserPage />} />
            {/* ROUTES_INJECTION_POINT */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}


export default App;
