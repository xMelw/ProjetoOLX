import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  BarChart as BarChartIcon, Package, Eye, DollarSign, TrendingUp, TrendingDown, Users,
  MessageSquare, Flag, Settings, LogOut, Menu, X, Search, Edit2, Trash2, Ban, CheckCircle, PlusCircle, Calendar, User as UserIcon
} from 'lucide-react';

// Importar o CSS específico para o Admin Dashboard
import './AdminStyle.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para dados da API
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    totalViews: 0,
    totalRevenue: 0,
    activeAds: 0,
    pendingAds: 0,
    bannedUsers: 0,
    todayViews: 0,
  });
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Estados de UI/Loading/Erro
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    status: 'active',
  });
  const [deleteDays, setDeleteDays] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  const [adCategoryFilterStatus, setAdCategoryFilterStatus] = useState('active');
  const [feedbackFilterStatus, setFeedbackFilterStatus] = useState('pending');

  // O cliente partilhado usa a API local na porta 5000 e envia o cookie httpOnly.

  const fetchData = useCallback(async (endpoint, method = 'GET', data = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const options = {
        method: method,
        url: endpoint,
        data: data,
      };
      const response = await api({ ...options, withCredentials: true });
      return response.data;
    } catch (err) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, err);
      if (err.response) {
        // O servidor respondeu com um status diferente de 2xx
        setError(err.response.data.error || err.response.data.message || err.response.statusText || 'Erro no servidor');
      } else if (err.request) {
        // A requisição foi feita, mas nenhuma resposta foi recebida
        setError('Nenhuma resposta do servidor. Verifique sua conexão.');
      } else {
        // Algo aconteceu na configuração da requisição que disparou um Erro
        setError(err.message || 'Erro desconhecido na requisição');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // GET - /admin/user/{id}
  const fetchUserById = useCallback(async (userId) => {
    const data = await fetchData(`/admin/user/${userId}`);
    if (data) {
        console.log(`Detalhes do utilizador ${userId}:`, data);
    }
    return data;
  }, [fetchData]);

  const fetchDashboardSummary = useCallback(async () => {
    const data = await fetchData('/admin/stats');
    if (data) setDashboardStats(current => ({ ...current, ...data }));
  }, [fetchData]);

  // GET - /admin/users/{estado}
  const fetchUsersByStatus = useCallback(async (statusFilter = 'all') => {
    try {
        const data = await fetchData(`/admin/users/${statusFilter}`);
        if (data) {
            setUsers(data);
            if (statusFilter === 'all') {
              setDashboardStats(prev => ({
                ...prev,
                totalUsers: data.length,
                bannedUsers: data.filter(user => user.status === 'banned').length
              }));
            } else if (statusFilter === 'banned') {
              setDashboardStats(prev => ({ ...prev, bannedUsers: data.length }));
            }
        }
    } catch {
      setUsers([]);
    }
  }, [fetchData]);

  // PUT - /admin/user/estado/{id}
  const updateUserStatus = useCallback(async (userId, newStatus) => {
    try {
      const data = await fetchData(`/admin/user/estado/${userId}`, 'PUT', { estado: newStatus });
      if (data) {
        console.log(`Estado do utilizador ${userId} atualizado para ${newStatus}:`, data);
        setUsers(prevUsers => prevUsers.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        alert(`Estado do utilizador ${userId} atualizado para ${newStatus}!`);
      }
    } catch {
      alert(`Erro ao atualizar estado: ${error}`); // Use a variável de erro do estado
    }
  }, [fetchData, error]);

  // POST - /admin/user/registar
  const registerUser = useCallback(async (userData) => {
    try {
      const data = await fetchData(`/admin/user/registar`, 'POST', userData);
      if (data) {
        console.log('Utilizador registado com sucesso:', data);
        setUsers(prevUsers => [...prevUsers, data]);
        alert('Utilizador registado com sucesso!');
        setShowAddUserModal(false);
        setNewUserData({ name: '', email: '', password: '', status: 'active' });
      }
    } catch {
      alert(`Erro ao registar utilizador: ${error}`);
    }
  }, [fetchData, error]);

  // GET - /admin/totais_anuncios/por-categoria/{estado}
  const fetchAdsByCategoryStatus = useCallback(async (statusFilter = 'active') => {
    try {
      const data = await fetchData(`/admin/totais_anuncios/por-categoria/${statusFilter}`);
      if (data) {
        setCategoriesData(Object.entries(data).map(([name, value]) => ({ name, value })));
      }
    } catch {
      setCategoriesData([]);
    }
  }, [fetchData]);

  // GET - /admin/totais_anuncios/por-estado
  const fetchAdsByStatus = useCallback(async () => {
    try {
      const data = await fetchData(`/admin/totais_anuncios/por-estado`);
      if (data) {
        setDashboardStats(prev => ({
          ...prev,
          totalAds: Object.values(data).reduce((total, count) => total + Number(count || 0), 0),
          activeAds: Number(data.active || 0),
          pendingAds: Number(data.pending || 0),
        }));
      }
    } catch {
      // fetchData já apresenta o erro no estado do painel.
    }
  }, [fetchData]);

  // PUT - /admin/mudar_estado_anuncio
  const updateAdStatus = useCallback(async (adId, newStatus) => {
    try {
      const data = await fetchData(`/admin/mudar_estado_anuncio`, 'PUT', { adId: adId, estado: newStatus });
      if (data) {
        console.log(`Estado do anúncio ${adId} atualizado para ${newStatus}:`, data);
        setAds(prevAds => prevAds.map(ad =>
          ad.id === adId ? { ...ad, status: newStatus } : ad
        ));
        alert(`Estado do anúncio ${adId} atualizado para ${newStatus}!`);
      }
    } catch {
      alert(`Erro ao atualizar estado do anúncio: ${error}`);
    }
  }, [fetchData, error]);

  // GET - /admin/recentes/{utilizador_id}
  const fetchRecentActivities = useCallback(async (userId = localStorage.getItem('utilizador_id')) => {
    try {
      const data = await fetchData(`/admin/recentes/${userId}`);
      if (data) {
        setRecentActivities(data);
      }
    } catch {
      setRecentActivities([]);
    }
  }, [fetchData]);

  // DELETE - /admin/recentes/apagar/{dias}
  const deleteRecentActivities = useCallback(async (days) => {
    try {
      const data = await fetchData(`/admin/recentes/apagar/${days}`, 'DELETE');
      if (data) {
        alert(`Atividades recentes com mais de ${days} dias foram apagadas!`);
        await fetchRecentActivities();
      }
    } catch {
      alert(`Erro ao apagar atividades recentes: ${error}`);
    }
  }, [fetchData, fetchRecentActivities, error]);

  // PUT - /admin/feedback/mudar_estado
  const updateFeedbackStatus = useCallback(async (feedbackId, newStatus) => {
    try {
      const data = await fetchData(`/admin/feedback/mudar_estado`, 'PUT', { feedbackId: feedbackId, estado: newStatus });
      if (data) {
        console.log(`Estado do feedback ${feedbackId} atualizado para ${newStatus}:`, data);
        setFeedbackList(prevFeedback => prevFeedback.map(fb =>
          fb.id === feedbackId ? { ...fb, status: newStatus } : fb
        ));
        alert(`Estado do feedback ${feedbackId} atualizado para ${newStatus}!`);
      }
    } catch {
      alert(`Erro ao atualizar estado do feedback: ${error}`);
    }
  }, [fetchData, error]);

  // GET - /admin/feedback/estado/{estado}
  const fetchFeedbackByStatus = useCallback(async (statusFilter = 'pending') => {
    try {
      const statuses = statusFilter === 'all' ? ['pending', 'active', 'hidden'] : [statusFilter];
      const lists = await Promise.all(statuses.map((status) => fetchData(`/admin/feedback/estado/${status}`)));
      if (lists.every(Array.isArray)) setFeedbackList(lists.flat());
    } catch {
      setFeedbackList([]);
    }
  }, [fetchData]);

  // GET - /admin/feedback/totais-por-estado
  const fetchFeedbackTotalsByStatus = useCallback(async () => {
    try {
      const data = await fetchData(`/admin/feedback/totais-por-estado`);
      if (data) {
        console.log('Totais de Feedback por Estado:', data);
      }
    } catch {
      // Erro já tratado em fetchData
    }
  }, [fetchData]);

  // --- Efeitos para Carregar Dados ---

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      // Sempre carregar dados base para o dashboard, mas de forma mais robusta
      await fetchUsersByStatus('all'); // Para totalUsers e bannedUsers
      await fetchAdsByStatus(); // Para totalAds, activeAds, pendingAds
      await fetchDashboardSummary();

      // Carregar dados específicos da tab ativa
      if (activeTab === 'dashboard') {
        await fetchAdsByCategoryStatus('active'); // Para o gráfico de categorias
      } else if (activeTab === 'users') {
        await fetchUsersByStatus(userFilterStatus);
      } else if (activeTab === 'ads') {
        const data = await fetchData('/admin/ads/all');
        setAds(Array.isArray(data) ? data : []);
      } else if (activeTab === 'messages') {
        await fetchFeedbackByStatus(feedbackFilterStatus);
      } else if (activeTab === 'analytics') {
        await fetchAdsByStatus();
        await fetchAdsByCategoryStatus('active');
        await fetchUsersByStatus('all');
        await fetchRecentActivities();
        await fetchFeedbackTotalsByStatus();
      }
      setIsLoading(false);
    };

    loadData();
  }, [activeTab, userFilterStatus, adCategoryFilterStatus, feedbackFilterStatus, fetchData, fetchUsersByStatus, fetchAdsByStatus, fetchDashboardSummary, fetchAdsByCategoryStatus, fetchFeedbackByStatus, fetchRecentActivities, fetchFeedbackTotalsByStatus]);


  // Mock data para gráficos se a API não retornar dados mensais diretamente para Dashboard
  const monthlyData = [
    { month: 'Jan', users: 65, ads: 28, revenue: 2400 },
    { month: 'Feb', users: 59, ads: 48, revenue: 2210 },
    { month: 'Mar', users: 80, ads: 40, revenue: 2290 },
    { month: 'Apr', users: 81, ads: 19, revenue: 2000 },
    { month: 'Mai', users: 56, ads: 96, revenue: 2181 },
    { month: 'Jun', users: 55, ads: 27, revenue: 2500 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChartIcon },
    { id: 'users', label: 'Utilizadores', icon: Users },
    { id: 'ads', label: 'Anúncios', icon: Package },
    { id: 'analytics', label: 'Análises', icon: TrendingUp },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'reports', label: 'Relatórios', icon: Flag },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const StatCard = ({ title, value, change, icon, iconColorClass, iconBgClass }) => (
    <div className="card h-100">
      <div className="card-body d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <p className="stat-card-title mb-1">{title}</p>
            <h4 className="stat-card-value text-dark mb-0">{value}</h4>
          </div>
          {/* Usando classes para cor de fundo e cor do ícone */}
          <div className={`stat-icon-wrapper rounded-circle ${iconBgClass}`}>
            {React.createElement(icon, { size: 24, className: iconColorClass })}
          </div>
        </div>
        {change && (
          <div className={`d-flex align-items-center mt-2 stat-card-change ${change > 0 ? 'text-success' : 'text-danger'}`}>
            {change > 0 ? <TrendingUp className="me-1" size={16} /> : <TrendingDown className="me-1" size={16} />}
            {Math.abs(change)}% vs mês anterior
          </div>
        )}
      </div>
    </div>
  );

  const UserTable = () => (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="h5 text-dark mb-0">Utilizadores</h3>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={userFilterStatus}
            onChange={(e) => setUserFilterStatus(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="pending">Pendentes</option>
            <option value="banned">Banidos</option>
          </select>
          <button type="button" className="btn btn-primary btn-sm d-flex align-items-center" onClick={() => setShowAddUserModal(true)}>
            <PlusCircle size={16} className="me-2" />Adicionar Utilizador
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nome</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Data Registo</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && users.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></td></tr>
            ) : error && users.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-danger py-5">Erro: {error}</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-5 text-muted">Nenhum utilizador encontrado para este estado.</td></tr>
            ) : (
              users.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-3">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?' /* Garante que o nome existe antes de acessar charAt(0) */}
                      </div>
                      <div>{user.name}</div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${
                      user.status === 'active' ? 'text-bg-success' :
                      user.status === 'pending' ? 'text-bg-warning' :
                      'text-bg-danger'
                    }`}>
                      {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Banido'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at || user.joinDate || '2000-01-01').toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => fetchUserById(user.id)} title="Ver Detalhes">
                        <Eye size={16} />
                      </button>
                      <button type="button" className="btn btn-outline-warning btn-sm" onClick={() => updateUserStatus(user.id, 'pending')} title="Marcar como Pendente">
                        <Edit2 size={16} />
                      </button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => updateUserStatus(user.id, 'banned')} title="Banir Utilizador">
                        <Ban size={16} />
                      </button>
                      <button type="button" className="btn btn-outline-success btn-sm" onClick={() => updateUserStatus(user.id, 'active')} title="Ativar Utilizador">
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AdsTable = () => (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="h5 text-dark mb-0">Anúncios Recentes</h3>
        <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={adCategoryFilterStatus}
              onChange={(e) => setAdCategoryFilterStatus(e.target.value)}
            >
              <option value="active">Ativos</option>
              <option value="pending">Pendentes</option>
            <option value="sold">Vendidos</option>
            <option value="removed">Removidos</option>
              <option value="all">Todos</option>
            </select>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Título</th>
              <th scope="col">Utilizador</th>
              <th scope="col">Categoria</th>
              <th scope="col">Preço</th>
              <th scope="col">Status</th>
              <th scope="col">Views</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && ads.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></td></tr>
            ) : error && ads.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-danger py-5">Erro: {error}</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-5 text-muted">Nenhum anúncio encontrado.</td></tr>
            ) : (
              ads.filter(ad => (adCategoryFilterStatus === 'all' || ad.status === adCategoryFilterStatus) && (
                (ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ad.user || '').toLowerCase().includes(searchTerm.toLowerCase())
              )).map((ad) => (
                <tr key={ad.id}>
                  <td>{ad.id}</td>
                  <td>{ad.title}</td>
                  <td>{ad.user || `Utilizador ${ad.user_id}`}</td>
                  <td>{ad.category}</td>
                  <td>{ad.price}</td>
                  <td>
                    <span className={`badge ${
                      ad.status === 'active' ? 'text-bg-success' :
                      ad.status === 'pending' ? 'text-bg-warning' :
                      ad.status === 'removed' ? 'text-bg-danger' :
                      'text-bg-secondary'
                    }`}>
                      {ad.status === 'active' ? 'Ativo' : ad.status === 'pending' ? 'Pendente' : ad.status === 'sold' ? 'Vendido' : ad.status === 'removed' ? 'Removido' : 'Outro'}
                    </span>
                  </td>
                  <td>{ad.views}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-success btn-sm" onClick={() => updateAdStatus(ad.id, 'active')} title="Ativar">
                        <CheckCircle size={16} />
                      </button>
                      <button type="button" className="btn btn-outline-warning btn-sm" onClick={() => updateAdStatus(ad.id, 'pending')} title="Marcar como Pendente">
                        <Edit2 size={16} />
                      </button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => updateAdStatus(ad.id, 'removed')} title="Remover anúncio">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const FeedbackTable = () => (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="h5 text-dark mb-0">Feedbacks/Mensagens</h3>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={feedbackFilterStatus}
            onChange={(e) => setFeedbackFilterStatus(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="active">Visíveis</option>
            <option value="hidden">Ocultos</option>
          </select>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Assunto</th>
              <th scope="col">Utilizador</th>
              <th scope="col">Status</th>
              <th scope="col">Data</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && feedbackList.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></td></tr>
            ) : error && feedbackList.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-danger py-5">Erro: {error}</td></tr>
            ) : feedbackList.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-5 text-muted">Nenhum feedback encontrado.</td></tr>
            ) : (
              feedbackList.filter(fb =>
                (fb.review || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (fb.anunciante_nome || '').toLowerCase().includes(searchTerm.toLowerCase())
              ).map((fb) => (
                <tr key={fb.id}>
                  <td>{fb.id}</td>
                  <td>{fb.review}</td>
                  <td>{fb.anunciante_nome || 'N/A'}</td>
                  <td>
                    <span className={`badge ${
                      fb.status === 'pending' ? 'text-bg-warning' :
                      fb.status === 'active' ? 'text-bg-success' :
                      'text-bg-secondary'
                    }`}>
                      {fb.status === 'pending' ? 'Pendente' : fb.status === 'active' ? 'Visível' : 'Oculto'}
                    </span>
                  </td>
                  <td>{new Date(fb.data_hora || '2000-01-01').toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-success btn-sm" onClick={() => updateFeedbackStatus(fb.id, 'active')} title="Tornar feedback visível">
                        <CheckCircle size={16} />
                      </button>
                      <button type="button" className="btn btn-outline-warning btn-sm" onClick={() => updateFeedbackStatus(fb.id, 'hidden')} title="Ocultar feedback">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleDeleteRecentActivities = () => {
    if (window.confirm(`Tem certeza que quer apagar as atividades recentes com mais de ${deleteDays} dias?`)) {
      deleteRecentActivities(deleteDays);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Termina a sessão local mesmo quando a API já não está disponível.
    }
    localStorage.removeItem('utilizador_id');
    window.location.assign('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="container-fluid p-3">
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-sm-6 col-lg-3">
                <StatCard
                  title="Total Utilizadores"
                  value={dashboardStats.totalUsers.toLocaleString()}
                  change={12}
                  icon={Users}
                  iconColorClass="color-primary-icon"
                  iconBgClass="color-primary-bg"
                />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard
                  title="Total Anúncios"
                  value={dashboardStats.totalAds.toLocaleString()}
                  change={8}
                  icon={Package}
                  iconColorClass="color-success-icon"
                  iconBgClass="color-success-bg"
                />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard
                  title="Total Visualizações"
                  value={dashboardStats.totalViews.toLocaleString()}
                  change={-3}
                  icon={Eye}
                  iconColorClass="color-warning-icon"
                  iconBgClass="color-warning-bg"
                />
              </div>
              <div className="col-sm-6 col-lg-3">
                <StatCard
                  title="Valor total das vendas"
                  value={`${dashboardStats.totalRevenue.toLocaleString()}€`}
                  change={15}
                  icon={DollarSign}
                  iconColorClass="color-info-icon"
                  iconBgClass="color-info-bg"
                />
              </div>
            </div>

            {/* Charts */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h3 className="h5 text-dark mb-0">Estatísticas Mensais (Mock Data)</h3>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="users" stackId="1" stroke="rgb(var(--bs-primary-rgb))" fill="rgba(var(--bs-primary-rgb), 0.2)" name="Utilizadores"/>
                        <Area type="monotone" dataKey="ads" stackId="1" stroke="rgb(var(--bs-success-rgb))" fill="rgba(var(--bs-success-rgb), 0.2)" name="Anúncios"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h3 className="h5 text-dark mb-0">Distribuição por Categoria (Anúncios Ativos)</h3>
                  </div>
                  <div className="card-body">
                    {categoriesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoriesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoriesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted py-5">Nenhum dado de categoria disponível.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tables */}
            <div className="row">
              <div className="col-12">
                <UserTable />
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="container-fluid p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Gestão de Utilizadores</h2>
              <div className="d-flex gap-2">
                <div className="input-group w-auto">
                  <span className="input-group-text"><Search size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar utilizadores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <UserTable />
          </div>
        );

      case 'ads':
        return (
          <div className="container-fluid p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Gestão de Anúncios</h2>
              <div className="d-flex gap-2">
                <div className="input-group w-auto">
                  <span className="input-group-text"><Search size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar anúncios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <AdsTable />
          </div>
        );

      case 'analytics':
        return (
          <div className="container-fluid p-3">
            <h2 className="mb-4">Análises Detalhadas</h2>

            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h3 className="h5 text-dark mb-0">Evolução de Receita (Mock Data)</h3>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="rgb(var(--bs-primary-rgb))" strokeWidth={2} name="Receita"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h3 className="h5 text-dark mb-0">Crescimento de Utilizadores vs Anúncios (Mock Data)</h3>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="users" fill="rgb(var(--bs-primary-rgb))" name="Utilizadores"/>
                        <Bar dataKey="ads" fill="rgb(var(--bs-success-rgb))" name="Anúncios"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h4 className="card-title h5 text-primary mb-3">Total de Utilizadores</h4>
                    <p className="display-6 text-dark mb-0">{dashboardStats.totalUsers.toLocaleString()}</p>
                    <p className="text-muted small">Total registados na plataforma</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h4 className="card-title h5 text-success mb-3">Anúncios Ativos</h4>
                    <p className="display-6 text-dark mb-0">{dashboardStats.activeAds.toLocaleString()}</p>
                    <p className="text-muted small">Anúncios atualmente no ar</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h4 className="card-title h5 text-info mb-3">Anúncios Pendentes</h4>
                    <p className="display-6 text-dark mb-0">{dashboardStats.pendingAds.toLocaleString()}</p>
                    <p className="text-muted small">Anúncios aguardando revisão</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-4 mt-4">
              <div className="col-12">
                <h4 className="mb-3">Gestão de Atividades Recentes</h4>
                <div className="card p-3">
                  <div className="d-flex align-items-center gap-3">
                    <label htmlFor="deleteDaysInput" className="form-label mb-0 fw-semibold">Apagar atividades com mais de (dias):</label>
                    <input
                      type="number"
                      id="deleteDaysInput"
                      className="form-control w-auto"
                      value={deleteDays}
                      onChange={(e) => setDeleteDays(e.target.value)}
                      placeholder="Ex: 30"
                      min="1"
                    />
                    <button
                      type="button"
                      className="btn btn-danger d-flex align-items-center"
                      onClick={handleDeleteRecentActivities}
                      disabled={!deleteDays || isLoading}
                    >
                      <Trash2 size={16} className="me-2" />Apagar
                    </button>
                  </div>
                  {recentActivities.length > 0 ? (
                    <ul className="list-group list-group-flush mt-3">
                      {recentActivities.slice(0, 8).map((activity) => (
                        <li className="list-group-item d-flex justify-content-between gap-3" key={activity.id}>
                          <span>{activity.anuncio || activity.titulo}</span>
                          <small className="text-muted text-nowrap">{new Date(activity.data_hora).toLocaleString()}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mt-3 mb-0">Ainda não há atividades recentes para esta conta.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="container-fluid p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Gestão de Mensagens/Feedback</h2>
              <div className="d-flex gap-2">
                <div className="input-group w-auto">
                  <span className="input-group-text"><Search size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <FeedbackTable />
          </div>
        );

      case 'reports':
        return (
          <div className="container-fluid p-3">
            <h2 className="mb-4">Relatórios</h2>
            <div className="card p-4 text-center text-muted">
              <p className="lead mb-0">
                Esta secção é dedicada a relatórios e estatísticas avançadas.
                Pode integrar ferramentas de BI ou dashboards de análise de dados aqui.
              </p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="container-fluid p-3">
            <h2 className="mb-4">Configurações da Plataforma</h2>
            <div className="card p-4 text-center text-muted">
              <p className="lead mb-0">
                Gerencie configurações gerais, como categorias de anúncios,
                perfis de permissão, integrações e muito mais.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="container-fluid p-3 text-center">
            <p className="text-muted mt-5">Selecione uma opção no menu lateral para começar.</p>
          </div>
        );
    }
  };

  return (
    <div className="d-flex bg-light">
      {/* Sidebar */}
      <div className={`sidebar d-flex flex-column ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          {sidebarOpen && (
            <h1 className="h5 text-dark mb-0 fw-bold">ADMIN PANEL</h1>
          )}
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Fechar Menu Lateral" : "Abrir Menu Lateral"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="nav flex-column flex-grow-1 p-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href="#!"
                onClick={(e) => { e.preventDefault(); setActiveTab(item.id); if (window.innerWidth < 992) setSidebarOpen(false); }}
                className={`nav-link ${
                  activeTab === item.id
                    ? 'active'
                    : ''
                }`}
                aria-current={activeTab === item.id ? "page" : undefined}
              >
                <Icon size={20} className={sidebarOpen ? 'me-3' : ''} />
                {sidebarOpen && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        <div className="p-3 border-top">
          <button type="button" onClick={handleLogout} className="btn btn-link w-100 d-flex align-items-center text-dark hover-bg-light rounded">
            <LogOut size={20} className={sidebarOpen ? 'me-3' : ''} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className={`flex-grow-1 d-flex flex-column overflow-hidden main-content-wrapper`}>
        {/* Header */}
        <nav className="navbar navbar-expand-lg">
          <div className="container-fluid">
            <a className="navbar-brand" href="#!">
              <h2 className="mb-0">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <small className="text-muted">Bem-vindo ao painel administrativo</small>
            </a>

            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <button type="button" className="btn btn-light rounded-circle p-2">
                  <MessageSquare size={20} className="text-dark" />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    3
                  </span>
                </button>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="user-avatar">
                  A
                </div>
                <div className="small">
                  <p className="fw-semibold text-dark mb-0">Admin</p>
                  <p className="text-muted mb-0">Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-grow-1 overflow-auto bg-light p-4">
            {/* Global Loading Spinner */}
            {isLoading && (
                <div className="d-flex justify-content-center align-items-center position-absolute top-50 start-50 translate-middle" style={{ zIndex: 1000 }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            {/* Global Error Message */}
            {error && (
                <div className="alert alert-danger text-center mx-auto mt-3" style={{ maxWidth: '400px' }} role="alert">
                    <p className="mb-0"><strong>Erro:</strong> {error}</p>
                    <small>Por favor, tente novamente.</small>
                </div>
            )}
            {/* Render content only when not in a global loading/error state if no data */}
            {renderContent()}
        </main>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && window.innerWidth < 992 && (
        <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Modal para Adicionar Utilizador */}
      <div className={`modal fade ${showAddUserModal ? 'show d-block' : 'd-none'}`} tabIndex="-1" role="dialog" aria-hidden={!showAddUserModal}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Adicionar Novo Utilizador</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAddUserModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); registerUser(newUserData); }}>
                <div className="mb-3">
                  <label htmlFor="userName" className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    id="userName"
                    placeholder="Nome do utilizador"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="userEmail" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="userEmail"
                    placeholder="Email do utilizador"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="userPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="userPassword"
                    placeholder="Password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="userStatus" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="userStatus"
                    value={newUserData.status}
                    onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value })}
                  >
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="banned">Banido</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" onClick={() => registerUser(newUserData)} disabled={isLoading}>
                {isLoading ? 'A registar...' : 'Registar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showAddUserModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AdminDashboard;
