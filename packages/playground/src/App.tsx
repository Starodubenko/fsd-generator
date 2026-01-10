import { AliasedTable2Page } from './pages/AliasedTable2Page/ui/AliasedTable2Page';
import { AliasedTablePage } from './pages/AliasedTablePage/ui/AliasedTablePage';
import { TestTablePage } from './pages/TestTablePage/ui/TestTablePage';
import { UserPage } from './pages/UserPage/ui/UserPage';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

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
            <Route path="/testtable" element={<TestTablePage />} />
            <Route path="/aliasedtable" element={<AliasedTablePage />} />
            <Route path="/aliasedtable2" element={<AliasedTable2Page />} />
            {/* ROUTES_INJECTION_POINT */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
