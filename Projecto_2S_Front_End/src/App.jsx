import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./views/components/ScrollToTop";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Index = lazy(() => import("./views/pages/Index"));
const Anuncios = lazy(() => import("./views/pages/Anuncios"));
const AdminDashboard = lazy(() => import("./views/pages/Dashboard"));
const Login = lazy(() => import("./views/pages/LoginRegister"));
const AnunciosPorCategoria = lazy(() => import("./views/pages/AnunciosPorCategoria"));
const AnuncioDetalhe = lazy(() => import("./views/pages/AnuncioDetalhe"));
const Favoritos = lazy(() => import("./views/pages/FavoritosUser"));
const Profile = lazy(() => import("./views/pages/Profile"));
const Chat = lazy(() => import("./views/pages/Chat"));

const App = () => (
  <Router>
    <ScrollToTop />
    <Suspense fallback={<main className="d-flex min-vh-100 align-items-center justify-content-center text-muted">A carregar página…</main>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/anuncios" element={<Anuncios />} />
        <Route path="/categoria" element={<Anuncios />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categoria/:id" element={<AnunciosPorCategoria />} />
        <Route path="/anuncio/:id" element={<AnuncioDetalhe />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Suspense>
  </Router>
);

export default App;