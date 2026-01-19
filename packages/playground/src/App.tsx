import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TablePage } from '@pages/TablePage';

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
                        <Route path="/table" element={<TablePage />} />
            {/* ROUTES_INJECTION_POINT */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}


export default App;
