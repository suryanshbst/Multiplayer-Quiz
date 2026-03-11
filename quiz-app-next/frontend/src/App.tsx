import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { User } from './components/User';
import { Admin } from './components/Admin';
import { Dashboard } from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          {/* Your new MongoDB Landing Page */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Your existing WebSocket Game Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/user" element={<User />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;