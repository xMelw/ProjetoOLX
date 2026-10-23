import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Index from "./Pages/Index";
import Anuncios from "./Pages/Anuncios";
import AdminDashboard from "./Pages/Dashboard";
import Login from "./Pages/LoginRegister";
import AnunciosPorCategoria from "./Pages/AnunciosPorCategoria";
import AnuncioDetalhe from "./Pages/AnuncioDetalhe";
import Favoritos from "./Pages/FavoritosUser";
import Profile from "./Pages/Profile";
import Chat from "./Pages/Chat";

const App = () => (
  <Router>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/anuncios" element={<Anuncios />} />
      <Route path="/categoria" element={<Anuncios />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/categoria/:id" element={<AnunciosPorCategoria />} />
      <Route path="/Anuncio/:id" element={<AnuncioDetalhe />} />
      <Route path="/favoritos" element={<Favoritos />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  </Router>
);

export default App;
