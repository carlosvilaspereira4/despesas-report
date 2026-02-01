import React, { useState, useEffect } from 'react';
import { Download, LogOut, Plus, Filter, X, Camera, Trash2, Edit2, Check, Paperclip, Eye } from 'lucide-react';

const AtleticoFinancesApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isFinanceDirector, setIsFinanceDirector] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showTransactionForm, setShowTransactionForm] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    user: '',
    type: 'despesa',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: '',
    receipt: null,
    isPaid: false
  });

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    user: '',
    category: ''
  });

  // Predefined users and categories
  const users = [
    'Carlos Pereira', 'Nelson Martins', 'Paulo Fernandes', 'António Pereira', 'António Teixeira',
    'Júlio Dinis', 'António Miguel', 'Luís Miguel', 'Ricardo Oliveira', 'Pedro Pereira',
    'Marcelo Teixeira', 'Catarina Oliveira', 'Daniela Passos', 'Ana Glória', 'Margarida Ramos',
    'Maria João', 'Cátia Mariana', 'Patrícia Valadares', 'Sara Correia', 'Diogo Andrade'
  ].sort();

  const categories = [
    'Alimentação',
    'Transporte',
    'Equipamento',
    'Instalações',
    'Arbitragem',
    'Inscrições',
    'Material Desportivo',
    'Publicidade',
    'Eventos',
    'Quotas',
    'Donativos',
    'Outros'
  ];

  // Load data from storage
  useEffect(() => {
  const loadData = () => {
    try {
      const result = localStorage.getItem('transactions');
      if (result) {  // ← SEM .value
        setTransactions(JSON.parse(result));  // ← SEM .value
      }
      } catch (error) {
        console.log('No previous transactions found');
      }
    };
    loadData();
  }, []);

  // Save transactions to storage
  const saveTransactions = (newTransactions) => {  // ← SEM async
  try {
    localStorage.setItem('transactions', JSON.stringify(newTransactions));  // ← SEM await
    setTransactions(newTransactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
      alert('Erro ao guardar transação');
    }
  };

  // Login handler
  const handleLogin = (user, isDirector = false, password = '') => {
    if (isDirector) {
      if (password === 'financas2025') {
        setCurrentUser('Diretor Financeiro');
        setIsFinanceDirector(true);
        setShowTransactionForm(false);
      } else {
        alert('Password incorreta');
      }
    } else {
      setCurrentUser(user);
      setIsFinanceDirector(false);
      setFormData({ ...formData, user: user });
      setShowTransactionForm(true);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setIsFinanceDirector(false);
    setShowTransactionForm(false);
    setShowFilters(false);
    setEditingTransaction(null);
    setFormData({
      user: '',
      type: 'despesa',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: '',
      receipt: null,
      isPaid: false
    });
  };

  // Submit transaction
  const handleSubmitTransaction = () => {
    if (!formData.user || !formData.amount || !formData.description) {
      alert('Por favor preencha o nome, valor e descrição');
      return;
    }

    const newTransaction = {
      id: editingTransaction ? editingTransaction.id : Date.now(),
      user: formData.user,
      type: formData.type,
      date: formData.date,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      receipt: formData.receipt,
      isPaid: formData.isPaid,
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString()
    };

    let updatedTransactions;
    if (editingTransaction) {
      updatedTransactions = transactions.map(t => 
        t.id === editingTransaction.id ? newTransaction : t
      );
    } else {
      updatedTransactions = [...transactions, newTransaction];
    }

    saveTransactions(updatedTransactions);
    
    setFormData({
      user: currentUser,
      type: 'despesa',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: '',
      receipt: null,
      isPaid: false
    });
    setShowTransactionForm(true);
    setEditingTransaction(null);
    
    if (!isFinanceDirector) {
      alert('Transação submetida com sucesso!');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = (id) => {
    if (confirm('Tem a certeza que deseja eliminar esta transação?')) {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      saveTransactions(updatedTransactions);
    }
  };

  // Edit transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      user: transaction.user,
      type: transaction.type,
      date: transaction.date,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      receipt: transaction.receipt,
      isPaid: transaction.isPaid || false
    });
    setShowTransactionForm(true);
  };

  // Handle receipt upload
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ 
          ...formData, 
          receipt: {
            data: reader.result,
            name: file.name
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter transactions
  const getFilteredTransactions = () => {
    let filtered = isFinanceDirector ? transactions : transactions.filter(t => t.user === currentUser);

    if (filters.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate);
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.user) {
      filtered = filtered.filter(t => t.user === filters.user);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Calculate totals
  const calculateTotals = () => {
    const filtered = getFilteredTransactions();
    const despesas = filtered.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const receitas = filtered.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    return { despesas, receitas, saldo: receitas - despesas };
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const filtered = getFilteredTransactions();
      
      if (filtered.length === 0) {
        alert('Não há transações para exportar');
        return;
      }
      
      const headers = ['Data', 'Tipo', 'Colaborador', 'Valor (€)', 'Descrição', 'Categoria', 'Estado Pagamento'];
      const rows = filtered.map(t => [
        t.date,
        t.type === 'despesa' ? 'Despesa' : 'Receita',
        t.user,
        t.amount.toFixed(2),
        t.description,
        t.category || '-',
        t.type === 'despesa' ? (t.isPaid ? 'Pago' : 'Pendente') : '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      alert(`Ficheiro CSV exportado com ${filtered.length} transações!`);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar ficheiro. Por favor tente novamente.');
    }
  };

  // MAIN APP - Opens directly to transaction form
  const totals = calculateTotals();
  const filteredTransactions = getFilteredTransactions();

  // For regular users, show transaction form
  if (!isFinanceDirector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        {/* Discrete Director Login Button - Always visible */}
        <div className="absolute top-4 right-4 z-20">
          <DirectorLoginButton onLogin={handleLogin} isDirector={isFinanceDirector} />
        </div>

        {/* Header */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-red-600/80 to-blue-600/80 text-white p-4 shadow-2xl border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-center">Atlético Cabeceirense</h1>
            <p className="text-sm text-gray-200 text-center">Reportar Transação</p>
          </div>
        </div>

        {/* Transaction Form for Collaborators */}
        <div className="max-w-4xl mx-auto p-4">
          <TransactionFormSimple
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleSubmitTransaction}
            onReceiptUpload={handleReceiptUpload}
            users={users}
          />

          {/* My Transactions */}
          <div className="mt-6">
            <h2 className="text-white text-lg font-semibold mb-3">Minhas Transações</h2>
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/10 rounded-xl shadow-xl p-8 text-center text-gray-300 border border-white/20">
                  Nenhuma transação encontrada
                </div>
              ) : (
                filteredTransactions.map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={handleDeleteTransaction}
                    onEdit={handleEditTransaction}
                    canEdit={true}
                    showUser={false}
                    onPreviewReceipt={setPreviewReceipt}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Receipt Preview Modal */}
        {previewReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewReceipt(null)}>
            <div className="max-w-4xl max-h-[90vh] relative">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-white backdrop-blur-lg border border-white/20"
              >
                <X size={24} />
              </button>
              <img src={previewReceipt} alt="Comprovativo" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // For Finance Director, show full management view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Discrete Director Login Button - Always visible */}
      <div className="absolute top-4 right-4 z-20">
        <DirectorLoginButton onLogin={handleLogin} isDirector={isFinanceDirector} />
      </div>

      {/* Header */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-red-600/80 to-blue-600/80 text-white p-4 shadow-2xl sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-center">Atlético Cabeceirense</h1>
          <p className="text-sm text-gray-200 text-center">Visão do Diretor Financeiro</p>
        </div>
      </div>

      {/* Totals Summary */}
      <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          <div className="backdrop-blur-lg bg-white/10 rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300">Despesas</p>
            <p className="text-xl font-bold text-red-400">-{totals.despesas.toFixed(2)}€</p>
          </div>
          <div className="backdrop-blur-lg bg-white/10 rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300">Receitas</p>
            <p className="text-xl font-bold text-green-400">+{totals.receitas.toFixed(2)}€</p>
          </div>
          <div className="backdrop-blur-lg bg-white/10 rounded-xl p-4 text-center border border-white/20">
            <p className="text-sm text-gray-300">Saldo</p>
            <p className={`text-xl font-bold ${totals.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totals.saldo.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto p-4 flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex-1 backdrop-blur-xl bg-white/10 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-white/20 transition border border-white/20"
        >
          <Filter size={20} />
          Filtros
        </button>
        <button
          onClick={exportToCSV}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 transition border border-white/20"
        >
          <Download size={20} />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-xl shadow-2xl p-4 space-y-3 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">Filtros</h3>
              <button onClick={() => setFilters({ startDate: '', endDate: '', type: '', user: '', category: '' })} className="text-sm text-blue-400 hover:text-blue-300">
                Limpar
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400"
                placeholder="Data inicial"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400"
                placeholder="Data final"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="" className="bg-gray-800">Todos os tipos</option>
              <option value="despesa" className="bg-gray-800">Despesas</option>
              <option value="receita" className="bg-gray-800">Receitas</option>
            </select>

            <select
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="" className="bg-gray-800">Todos os colaboradores</option>
              {users.map(user => (
                <option key={user} value={user} className="bg-gray-800">{user}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="" className="bg-gray-800">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 rounded-xl shadow-xl p-8 text-center text-gray-300 border border-white/20">
              Nenhuma transação encontrada
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDeleteTransaction}
                onEdit={handleEditTransaction}
                canEdit={true}
                showUser={true}
                onPreviewReceipt={setPreviewReceipt}
              />
            ))
          )}
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewReceipt(null)}>
          <div className="max-w-4xl max-h-[90vh] relative">
            <button
              onClick={() => setPreviewReceipt(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-white backdrop-blur-lg border border-white/20"
            >
              <X size={24} />
            </button>
            <img src={previewReceipt} alt="Comprovativo" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

// Director Login Button (Discrete)
const DirectorLoginButton = ({ onLogin, isDirector }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (password === 'financas2025') {
      onLogin(null, true, password);
      setPassword('');
      setShowLogin(false);
    } else {
      alert('Password incorreta');
      setPassword('');
    }
  };

  const handleLogout = () => {
    window.location.reload();
  };

  if (isDirector) {
    return (
      <button
        onClick={handleLogout}
        className="backdrop-blur-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg transition border border-red-400/30 text-xs flex items-center gap-1"
      >
        <LogOut size={14} />
        Sair
      </button>
    );
  }

  if (!showLogin) {
    return (
      <button
        onClick={() => setShowLogin(true)}
        className="backdrop-blur-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 p-2 rounded-lg transition border border-white/10 text-xs"
      >
        Diretor
      </button>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm w-32"
          placeholder="Password"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-red-600 to-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:shadow-lg transition"
        >
          OK
        </button>
        <button
          onClick={() => {
            setShowLogin(false);
            setPassword('');
          }}
          className="text-gray-400 hover:text-gray-200 p-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Simple Transaction Form (for collaborators on main screen)
const TransactionFormSimple = ({ formData, setFormData, categories, onSubmit, onReceiptUpload, users }) => {
  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-6 border border-white/20 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Reportar Transação</h2>

      {/* User Selection - First Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Colaborador *</label>
        <select
          value={formData.user}
          onChange={(e) => setFormData({ ...formData, user: e.target.value })}
          className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
        >
          <option value="" className="bg-gray-800">Selecione...</option>
          {users.map(user => (
            <option key={user} value={user} className="bg-gray-800">{user}</option>
          ))}
        </select>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormData({ ...formData, type: 'despesa' })}
            className={`py-2 px-4 rounded-xl font-medium transition backdrop-blur-lg border ${
              formData.type === 'despesa'
                ? 'bg-red-600/80 text-white border-red-400/50 shadow-lg'
                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
            }`}
          >
            Despesa
          </button>
          <button
            onClick={() => setFormData({ ...formData, type: 'receita' })}
            className={`py-2 px-4 rounded-xl font-medium transition backdrop-blur-lg border ${
              formData.type === 'receita'
                ? 'bg-green-600/80 text-white border-green-400/50 shadow-lg'
                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
            }`}
          >
            Receita
          </button>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Valor (€) *</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          placeholder="0.00"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Descrição *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
          rows="3"
          placeholder="Descreva a transação..."
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Categoria (opcional)</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
        >
          <option value="" className="bg-gray-800">Sem categoria</option>
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
          ))}
        </select>
      </div>

      {/* Is Paid - Only for expenses */}
      {formData.type === 'despesa' && (
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPaid}
              onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-white/10 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-300">Despesa já foi paga</span>
          </label>
        </div>
      )}

      {/* Receipt */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Comprovativo (opcional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onReceiptUpload}
          className="w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-red-600 file:to-blue-600 file:text-white hover:file:opacity-80"
        />
        {formData.receipt && (
          <div className="mt-2 flex items-center gap-2 backdrop-blur-lg bg-white/10 p-2 rounded-lg border border-white/20">
            <Paperclip size={16} className="text-blue-400" />
            <span className="text-sm text-gray-300 flex-1">{formData.receipt.name}</span>
            <button
              onClick={() => setFormData({ ...formData, receipt: null })}
              className="text-red-400 hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        className="w-full bg-gradient-to-r from-red-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition flex items-center justify-center gap-2 border border-white/20"
      >
        <Check size={20} />
        Submeter Transação
      </button>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, onDelete, onEdit, canEdit, showUser, onPreviewReceipt }) => {
  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl shadow-xl p-4 border border-white/20 hover:bg-white/15 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm ${
              transaction.type === 'despesa' ? 'bg-red-500/30 text-red-300 border border-red-400/30' : 'bg-green-500/30 text-green-300 border border-green-400/30'
            }`}>
              {transaction.type === 'despesa' ? 'Despesa' : 'Receita'}
            </span>
            {transaction.category && (
              <span className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                {transaction.category}
              </span>
            )}
            {transaction.type === 'despesa' && (
              <span className={`text-xs px-2 py-1 rounded-lg backdrop-blur-sm border ${
                transaction.isPaid 
                  ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                  : 'bg-orange-500/20 text-orange-300 border-orange-400/30'
              }`}>
                {transaction.isPaid ? '✓ Pago' : 'Pendente'}
              </span>
            )}
          </div>
          
          {showUser && (
            <p className="text-sm font-medium text-gray-200 mb-1">{transaction.user}</p>
          )}
          
          <p className="text-gray-100 mb-1">{transaction.description}</p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleDateString('pt-PT')}</p>
            <p className={`text-lg font-bold ${
              transaction.type === 'despesa' ? 'text-red-400' : 'text-green-400'
            }`}>
              {transaction.type === 'despesa' ? '-' : '+'}{transaction.amount.toFixed(2)}€
            </p>
          </div>

          {transaction.receipt && (
            <button
              onClick={() => onPreviewReceipt(transaction.receipt.data)}
              className="mt-2 text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 backdrop-blur-sm bg-white/10 px-2 py-1 rounded-lg border border-white/20"
            >
              <Paperclip size={14} />
              {transaction.receipt.name}
              <Eye size={14} className="ml-1" />
            </button>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition backdrop-blur-sm border border-white/20"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition backdrop-blur-sm border border-white/20"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtleticoFinancesApp;
