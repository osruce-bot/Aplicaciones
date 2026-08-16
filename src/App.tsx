/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, DragEvent } from 'react';
import {
  Search,
  Trash2,
  ExternalLink,
  RotateCcw,
  Menu,
  X,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  FolderPlus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Edit3,
  FolderOutput
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APP_CATEGORIES, App as AppType, Category as CategoryType } from './constants';
import { cn } from './lib/utils';

export default function App() {
  // Initialize categories from localStorage if available, or default
  const [categories, setCategories] = useState<CategoryType[]>(() => {
    const saved = localStorage.getItem('orc_app_categories_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved categories:', e);
      }
    }
    return APP_CATEGORIES;
  });

  // Save to localStorage whenever categories change
  useEffect(() => {
    localStorage.setItem('orc_app_categories_v3', JSON.stringify(categories));
  }, [categories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication state stored in sessionStorage so closing window/tab requires re-login
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Clean up any legacy localStorage login key to ensure window close behavior works
    try {
      localStorage.removeItem('orc_app_logged_in');
    } catch {
      // ignore
    }
    return sessionStorage.getItem('orc_app_logged_in') === 'true';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Drag & Drop state
  const [draggedApp, setDraggedApp] = useState<{ appId: string; categoryName: string } | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragOverAppId, setDragOverAppId] = useState<string | null>(null);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);

  // Modals state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Category Modal (Create / Rename)
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    mode: 'create' | 'rename';
    oldName?: string;
    name: string;
  }>({ open: false, mode: 'create', name: '' });

  // App Modal (Create / Edit)
  const [appModal, setAppModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    categoryName: string;
    appId?: string;
    name: string;
    url: string;
  }>({ open: false, mode: 'create', categoryName: '', name: '', url: '' });

  // Move App Modal (for quick movement)
  const [moveModal, setMoveModal] = useState<{
    open: boolean;
    appId: string;
    appName: string;
    sourceCategory: string;
    targetCategory: string;
  }>({ open: false, appId: '', appName: '', sourceCategory: '', targetCategory: '' });

  // Filtered Categories based on search query and active category selection
  const filteredCategories = categories
    .map(category => ({
      ...category,
      apps: category.apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      category =>
        (!activeCategory || category.name === activeCategory) &&
        (searchQuery === '' || category.apps.length > 0)
    );

  // Action handlers for Categories
  const handleSaveCategory = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = categoryModal.name.trim();
    if (!trimmedName) return;

    if (categoryModal.mode === 'create') {
      if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        alert('Ya existe una categoría con ese nombre.');
        return;
      }
      setCategories(prev => [...prev, { name: trimmedName, apps: [] }]);
      setActiveCategory(trimmedName);
    } else if (categoryModal.mode === 'rename' && categoryModal.oldName) {
      if (
        categories.some(
          c => c.name !== categoryModal.oldName && c.name.toLowerCase() === trimmedName.toLowerCase()
        )
      ) {
        alert('Ya existe otra categoría con ese nombre.');
        return;
      }
      const oldName = categoryModal.oldName;
      setCategories(prev =>
        prev.map(c => (c.name === oldName ? { ...c, name: trimmedName } : c))
      );
      if (activeCategory === oldName) {
        setActiveCategory(trimmedName);
      }
    }

    setCategoryModal({ open: false, mode: 'create', name: '' });
  };

  const handleDeleteCategory = (catName: string) => {
    const targetCat = categories.find(c => c.name === catName);
    if (!targetCat) return;

    const appCount = targetCat.apps.length;
    setConfirmDialog({
      title: 'Eliminar Categoría',
      message: appCount > 0
        ? `La categoría "${catName}" contiene ${appCount} aplicación(es). ¿Deseas eliminar la categoría junto con sus aplicaciones?`
        : `¿Estás seguro de eliminar la categoría "${catName}"?`,
      onConfirm: () => {
        setCategories(prev => prev.filter(c => c.name !== catName));
        if (activeCategory === catName) {
          setActiveCategory(null);
        }
        setConfirmDialog(null);
      }
    });
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const nextCats = [...categories];
    const [moved] = nextCats.splice(index, 1);
    nextCats.splice(targetIndex, 0, moved);
    setCategories(nextCats);
  };

  // Action handlers for Apps
  const handleSaveApp = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = appModal.name.trim();
    const trimmedUrl = appModal.url.trim();
    if (!trimmedName || !trimmedUrl) return;

    if (appModal.mode === 'create') {
      const newApp: AppType = {
        id: Date.now().toString(),
        name: trimmedName,
        url: trimmedUrl
      };
      setCategories(prev =>
        prev.map(c =>
          c.name === appModal.categoryName
            ? { ...c, apps: [...c.apps, newApp] }
            : c
        )
      );
    } else if (appModal.mode === 'edit' && appModal.appId) {
      setCategories(prev =>
        prev.map(c => ({
          ...c,
          apps: c.apps.map(a =>
            a.id === appModal.appId
              ? { ...a, name: trimmedName, url: trimmedUrl }
              : a
          )
        }))
      );
    }

    setAppModal({ open: false, mode: 'create', categoryName: '', name: '', url: '' });
  };

  const uninstallApp = (appId: string, appName: string) => {
    setConfirmDialog({
      title: 'Eliminar Aplicación',
      message: `¿Estás seguro de que deseas eliminar la aplicación "${appName}"?`,
      onConfirm: () => {
        setCategories(prev =>
          prev.map(c => ({
            ...c,
            apps: c.apps.filter(a => a.id !== appId)
          }))
        );
        setConfirmDialog(null);
      }
    });
  };

  const handleMoveAppToCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!moveModal.appId || !moveModal.targetCategory) return;
    if (moveModal.sourceCategory === moveModal.targetCategory) {
      setMoveModal({ open: false, appId: '', appName: '', sourceCategory: '', targetCategory: '' });
      return;
    }

    setCategories(prev => {
      let movedApp: AppType | undefined;
      const sourceCleaned = prev.map(c => {
        if (c.name === moveModal.sourceCategory) {
          movedApp = c.apps.find(a => a.id === moveModal.appId);
          return { ...c, apps: c.apps.filter(a => a.id !== moveModal.appId) };
        }
        return c;
      });

      if (!movedApp) return prev;

      return sourceCleaned.map(c => {
        if (c.name === moveModal.targetCategory) {
          return { ...c, apps: [...c.apps, movedApp!] };
        }
        return c;
      });
    });

    setMoveModal({ open: false, appId: '', appName: '', sourceCategory: '', targetCategory: '' });
  };

  // Drag & Drop logic for Apps
  const handleAppDragStart = (e: DragEvent, appId: string, categoryName: string) => {
    setDraggedApp({ appId, categoryName });
    e.dataTransfer.setData('text/app-id', appId);
    e.dataTransfer.setData('text/category-name', categoryName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleAppDragOverCategory = (e: DragEvent, categoryName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategory !== categoryName) {
      setDragOverCategory(categoryName);
    }
  };

  const handleAppDropOnCategory = (e: DragEvent, targetCategoryName: string) => {
    e.preventDefault();
    setDragOverCategory(null);
    setDragOverAppId(null);

    if (!draggedApp) return;
    const { appId, categoryName: sourceCategoryName } = draggedApp;

    if (sourceCategoryName === targetCategoryName) return;

    setCategories(prev => {
      let movedApp: AppType | undefined;
      const cleaned = prev.map(c => {
        if (c.name === sourceCategoryName) {
          movedApp = c.apps.find(a => a.id === appId);
          return { ...c, apps: c.apps.filter(a => a.id !== appId) };
        }
        return c;
      });

      if (!movedApp) return prev;

      return cleaned.map(c => {
        if (c.name === targetCategoryName) {
          return { ...c, apps: [...c.apps, movedApp!] };
        }
        return c;
      });
    });

    setDraggedApp(null);
  };

  const handleAppDropOnApp = (e: DragEvent, targetAppId: string, targetCategoryName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(null);
    setDragOverAppId(null);

    if (!draggedApp) return;
    const { appId, categoryName: sourceCategoryName } = draggedApp;
    if (appId === targetAppId) return;

    setCategories(prev => {
      let appToMove: AppType | undefined;

      const cleaned = prev.map(c => {
        if (c.name === sourceCategoryName) {
          appToMove = c.apps.find(a => a.id === appId);
          return { ...c, apps: c.apps.filter(a => a.id !== appId) };
        }
        return c;
      });

      if (!appToMove) return prev;

      return cleaned.map(c => {
        if (c.name === targetCategoryName) {
          const targetIdx = c.apps.findIndex(a => a.id === targetAppId);
          const newApps = [...c.apps];
          if (targetIdx >= 0) {
            newApps.splice(targetIdx, 0, appToMove!);
          } else {
            newApps.push(appToMove!);
          }
          return { ...c, apps: newApps };
        }
        return c;
      });
    });

    setDraggedApp(null);
  };

  const resetApps = () => {
    setConfirmDialog({
      title: 'Resetear Aplicaciones y Categorías',
      message: '¿Estás seguro de que deseas restablecer todas las aplicaciones y categorías a su estado inicial por defecto?',
      onConfirm: () => {
        setCategories(APP_CATEGORIES);
        localStorage.removeItem('orc_app_categories_v3');
        setActiveCategory(null);
        setConfirmDialog(null);
      }
    });
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'osruce' && password === 'Zafiro641') {
      setIsLoggedIn(true);
      // Save session in sessionStorage so that closing the tab/window asks for credentials again
      sessionStorage.setItem('orc_app_logged_in', 'true');
      localStorage.removeItem('orc_app_logged_in');
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  const handleLogout = () => {
    setConfirmDialog({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar la sesión de APP ORC?',
      onConfirm: () => {
        setIsLoggedIn(false);
        sessionStorage.removeItem('orc_app_logged_in');
        localStorage.removeItem('orc_app_logged_in');
        setUsername('');
        setPassword('');
        setConfirmDialog(null);
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans select-none text-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6 ring-1 ring-slate-800"
        >
          {/* Logo / Brand */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-16 h-16 shrink-0 transform hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 rounded-full border-2 border-slate-700 shadow-md overflow-hidden flex flex-col">
                <div className="flex-1 flex">
                  <div className="flex-1 bg-terracotta" />
                  <div className="flex-1 bg-coral" />
                </div>
                <div className="h-[30%] bg-slate-800" />
                <div className="flex-1 flex">
                  <div className="flex-1 bg-slate-600" />
                  <div className="flex-1 bg-slate-950" />
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-coral rotate-45" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">APP ORC</h1>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest border-b-2 border-coral pb-1 px-4 inline-block">
                Acceso Privado
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Introduce tu usuario"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-750 focus:border-coral outline-none transition-all text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-950/80 border border-slate-750 focus:border-coral outline-none transition-all text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-coral tracking-tight"
              >
                ⚠️ {loginError}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-coral hover:bg-terracotta text-white font-bold text-xs tracking-widest uppercase shadow-lg shadow-coral/20 transition-all duration-300 transform active:scale-[0.98] cursor-pointer mt-6"
            >
              Iniciar Sesión
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const item = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none relative">
      {/* Mobile Sidebar Backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-72 border-r border-slate-800 flex flex-col shrink-0 bg-slate-900 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 shrink-0 transform hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 rounded-full border-2 border-slate-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="flex-1 flex">
                    <div className="flex-1 bg-terracotta" />
                    <div className="flex-1 bg-coral" />
                  </div>
                  <div className="h-[30%] bg-slate-800" />
                  <div className="flex-1 flex">
                    <div className="flex-1 bg-slate-600" />
                    <div className="flex-1 bg-slate-950" />
                  </div>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-coral rotate-45" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white uppercase">APP ORC</h1>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 md:hidden transition-colors"
              title="Cerrar menú"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Categories Filter */}
          <div className="space-y-1.5 mb-6">
            <button
              onClick={() => {
                setActiveCategory(null);
                setIsSidebarOpen(false);
              }}
              className={cn(
                'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-between group transform hover:-translate-y-0.5 cursor-pointer',
                !activeCategory
                  ? 'bg-coral text-white shadow-md shadow-coral/25 ring-1 ring-coral'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700'
              )}
            >
              <span>Todas las Apps</span>
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors duration-200 border',
                  !activeCategory
                    ? 'bg-white text-coral border-white'
                    : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:bg-coral group-hover:text-white group-hover:border-coral'
                )}
              >
                {categories.reduce((acc, cat) => acc + cat.apps.length, 0)}
              </span>
            </button>
          </div>

          {/* Categories Nav Header */}
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Categorías ({categories.length})
            </span>
            <button
              onClick={() =>
                setCategoryModal({ open: true, mode: 'create', name: '' })
              }
              className="flex items-center gap-1 text-[10px] font-bold text-coral hover:text-white transition-colors py-0.5 px-2 rounded-lg bg-coral/15 hover:bg-coral border border-coral/30 cursor-pointer"
              title="Crear nueva categoría"
            >
              <Plus size={12} />
              <span>Nueva</span>
            </button>
          </div>

          {/* Categories List with Drag & Drop */}
          <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
            {categories.map((cat, catIndex) => (
              <div
                key={cat.name}
                draggable
                onDragStart={() => setDraggedCategoryIndex(catIndex)}
                onDragOver={e => handleAppDragOverCategory(e, cat.name)}
                onDrop={e => {
                  if (draggedApp) {
                    handleAppDropOnCategory(e, cat.name);
                  } else if (draggedCategoryIndex !== null && draggedCategoryIndex !== catIndex) {
                    const nextCats = [...categories];
                    const [moved] = nextCats.splice(draggedCategoryIndex, 1);
                    nextCats.splice(catIndex, 0, moved);
                    setCategories(nextCats);
                    setDraggedCategoryIndex(null);
                  }
                }}
                className={cn(
                  'group relative rounded-xl border transition-all duration-200 flex items-center justify-between p-1.5',
                  activeCategory === cat.name
                    ? 'bg-slate-800 border-slate-600 font-bold text-white shadow-xs'
                    : 'border-transparent hover:border-slate-750 hover:bg-slate-800/60 text-slate-300',
                  dragOverCategory === cat.name && 'border-coral border-dashed bg-coral/15'
                )}
              >
                <div
                  onClick={() => {
                    setActiveCategory(activeCategory === cat.name ? null : cat.name);
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center gap-2 flex-1 min-w-0 py-1 pl-1 cursor-pointer"
                >
                  <GripVertical
                    size={13}
                    className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0"
                  />
                  <span
                    className={cn(
                      'truncate text-xs',
                      activeCategory === cat.name ? 'font-bold text-white' : 'font-medium text-slate-300'
                    )}
                  >
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold border',
                      activeCategory === cat.name
                        ? 'bg-coral text-white border-coral'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    )}
                  >
                    {cat.apps.length}
                  </span>

                  {/* Actions for Category in Sidebar */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setCategoryModal({
                          open: true,
                          mode: 'rename',
                          oldName: cat.name,
                          name: cat.name
                        });
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Renombrar categoría"
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.name);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-coral hover:bg-coral/20 transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto pt-4 space-y-2 border-t border-slate-800 shrink-0">
            <button
              onClick={() =>
                setCategoryModal({ open: true, mode: 'create', name: '' })
              }
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/80 border border-slate-700 hover:bg-coral hover:text-white hover:border-coral transition-all duration-200 cursor-pointer shadow-xs"
            >
              <FolderPlus size={14} />
              <span>Nueva Categoría</span>
            </button>

            <button
              onClick={resetApps}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-coral transition-colors group cursor-pointer"
            >
              <RotateCcw size={13} className="text-slate-500 group-hover:text-coral transition-colors" />
              <span>Resetear Apps</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-coral transition-colors group cursor-pointer"
            >
              <LogOut size={13} className="text-slate-500 group-hover:text-coral transition-colors" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        <header className="px-4 md:px-8 py-3 md:py-4 border-b border-slate-800 flex items-center gap-2 md:gap-4 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-coral md:hidden transition-colors cursor-pointer"
            title="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <div className="relative flex-1 max-w-xl">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar aplicación por nombre..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-750 focus:border-coral outline-none transition-all text-xs md:text-sm text-slate-100 placeholder:text-slate-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            {/* Quick Add App Button in Header */}
            <button
              onClick={() =>
                setAppModal({
                  open: true,
                  mode: 'create',
                  categoryName: activeCategory || (categories[0]?.name ?? 'Legal y Contratos'),
                  name: '',
                  url: ''
                })
              }
              className="hidden sm:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-coral hover:bg-terracotta text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-coral/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus size={14} />
              <span>Añadir App</span>
            </button>

            <div className="text-right border-l-2 border-coral pl-3 md:pl-4">
              <h2 className="text-xs md:text-sm font-bold truncate max-w-[120px] sm:max-w-[200px] text-white">
                Panel Principal
              </h2>
              <p className="text-[9px] md:text-[10px] text-coral font-extrabold uppercase tracking-widest truncate">
                APP ORC
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Canvas / Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 md:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory || 'all'}
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-12"
            >
              {filteredCategories.map((category, catIndex) => (
                <section
                  key={category.name}
                  onDragOver={e => handleAppDragOverCategory(e, category.name)}
                  onDrop={e => handleAppDropOnCategory(e, category.name)}
                  className={cn(
                    'transition-all duration-200 rounded-2xl p-2 md:p-3 -m-2 md:-m-3 border',
                    dragOverCategory === category.name
                      ? 'border-coral border-dashed bg-coral/10'
                      : 'border-transparent'
                  )}
                >
                  {/* Category Header Bar */}
                  <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-5 bg-coral rounded-full" />
                      <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-white">
                        {category.name}
                      </h3>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {category.apps.length} app(s)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move category up / down */}
                      <button
                        onClick={() => moveCategory(catIndex, 'up')}
                        disabled={catIndex === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Mover categoría arriba"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveCategory(catIndex, 'down')}
                        disabled={catIndex === categories.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Mover categoría abajo"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Add App to this specific category */}
                      <button
                        onClick={() =>
                          setAppModal({
                            open: true,
                            mode: 'create',
                            categoryName: category.name,
                            name: '',
                            url: ''
                          })
                        }
                        className="p-1.5 rounded-lg text-xs font-bold text-coral hover:bg-coral hover:text-white bg-coral/15 transition-colors flex items-center gap-1 cursor-pointer ml-1 border border-coral/30"
                        title="Añadir App a esta categoría"
                      >
                        <Plus size={12} />
                        <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Añadir App</span>
                      </button>

                      {/* Rename Category */}
                      <button
                        onClick={() =>
                          setCategoryModal({
                            open: true,
                            mode: 'rename',
                            oldName: category.name,
                            name: category.name
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Renombrar categoría"
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* Delete Category */}
                      <button
                        onClick={() => handleDeleteCategory(category.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-coral hover:bg-coral/20 transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-slate-800 mb-3.5" />

                  {/* App Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                    {category.apps.map(app => (
                      <motion.div
                        key={app.id}
                        variants={item}
                        draggable
                        onDragStart={e => handleAppDragStart(e, app.id, category.name)}
                        onDragOver={e => {
                          e.preventDefault();
                          setDragOverAppId(app.id);
                        }}
                        onDrop={e => handleAppDropOnApp(e, app.id, category.name)}
                        className={cn(
                          'group relative bg-slate-900 p-3.5 rounded-xl border transition-all duration-300 ease-out flex flex-col justify-between min-h-[125px] shadow-sm transform hover:-translate-y-1.5 cursor-grab active:cursor-grabbing',
                          dragOverAppId === app.id
                            ? 'border-coral ring-2 ring-coral/40 shadow-lg bg-coral/10'
                            : 'border-slate-800 hover:border-coral hover:shadow-xl hover:shadow-coral/10'
                        )}
                      >
                        {/* Drag indicator & App Header */}
                        <div className="flex justify-between items-start gap-1.5 mb-2.5">
                          <div className="flex items-start gap-1.5 flex-1 min-w-0">
                            <GripVertical
                              size={14}
                              className="text-slate-500 mt-0.5 shrink-0 group-hover:text-coral transition-colors"
                            />
                            <h4 className="font-bold text-xs md:text-sm leading-snug text-slate-100 group-hover:text-coral transition-colors break-words min-w-0">
                              {app.name}
                            </h4>
                          </div>

                          {/* Actions on Card */}
                          <div className="flex items-center gap-0.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            {/* Move App */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const firstOtherCat = categories.find(c => c.name !== category.name)?.name || category.name;
                                setMoveModal({
                                  open: true,
                                  appId: app.id,
                                  appName: app.name,
                                  sourceCategory: category.name,
                                  targetCategory: firstOtherCat
                                });
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Mover a otra categoría"
                            >
                              <FolderOutput size={12} />
                            </button>

                            {/* Edit App */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setAppModal({
                                  open: true,
                                  mode: 'edit',
                                  categoryName: category.name,
                                  appId: app.id,
                                  name: app.name,
                                  url: app.url
                                });
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Editar app"
                            >
                              <Edit3 size={12} />
                            </button>

                            {/* Delete App */}
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                uninstallApp(app.id, app.name);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-coral hover:bg-coral/20 transition-colors"
                              title="Eliminar app"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Access Button */}
                        <div className="mt-auto pt-2 border-t border-slate-800/80">
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700 text-xs font-bold group-hover:bg-coral group-hover:border-coral group-hover:text-white transition-all duration-300 shadow-sm hover:shadow-md no-underline"
                          >
                            <span className="uppercase tracking-wider">Acceder</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </motion.div>
                    ))}

                    {/* Empty Category placeholder */}
                    {category.apps.length === 0 && (
                      <div
                        onClick={() =>
                          setAppModal({
                            open: true,
                            mode: 'create',
                            categoryName: category.name,
                            name: '',
                            url: ''
                          })
                        }
                        className="col-span-full border-2 border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-500 hover:border-coral hover:text-coral transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        <Plus size={14} />
                        <span>Categoría vacía. Arrastra una app aquí o haz clic para añadir una app.</span>
                      </div>
                    )}
                  </div>
                </section>
              ))}

              {filteredCategories.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-4"
                >
                  <div className="p-6 rounded-full bg-slate-900 border border-slate-800">
                    <Search size={48} strokeWidth={1} className="text-slate-500" />
                  </div>
                  <p className="text-xs font-bold tracking-tight uppercase text-coral">
                    No se encontraron aplicaciones o categorías
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-coral hover:text-white transition-colors cursor-pointer border border-slate-700"
                  >
                    Limpiar búsqueda
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Category Modal (Create / Rename) */}
      <AnimatePresence>
        {categoryModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryModal({ open: false, mode: 'create', name: '' })}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 z-10 ring-1 ring-slate-800 text-slate-100"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                  <FolderPlus size={18} className="text-coral" />
                  <span>
                    {categoryModal.mode === 'create'
                      ? 'Nueva Categoría'
                      : 'Renombrar Categoría'}
                  </span>
                </div>
                <button
                  onClick={() => setCategoryModal({ open: false, mode: 'create', name: '' })}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej: Proyectos Específicos..."
                    value={categoryModal.name}
                    onChange={e =>
                      setCategoryModal({ ...categoryModal, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-coral outline-none transition-all text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCategoryModal({ open: false, mode: 'create', name: '' })
                    }
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-coral hover:bg-terracotta text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Modal (Create / Edit) */}
      <AnimatePresence>
        {appModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setAppModal({ open: false, mode: 'create', categoryName: '', name: '', url: '' })
              }
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 z-10 ring-1 ring-slate-800 text-slate-100"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                  <Plus size={18} className="text-coral" />
                  <span>
                    {appModal.mode === 'create' ? 'Añadir Nueva App' : 'Editar App'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setAppModal({ open: false, mode: 'create', categoryName: '', name: '', url: '' })
                  }
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveApp} className="space-y-4 pt-1">
                {appModal.mode === 'create' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Categoría
                    </label>
                    <select
                      value={appModal.categoryName}
                      onChange={e =>
                        setAppModal({ ...appModal, categoryName: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-coral outline-none transition-all text-xs font-bold text-slate-100 ring-1 ring-slate-800"
                    >
                      {categories.map(c => (
                        <option key={c.name} value={c.name} className="bg-slate-900 text-slate-100">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Nombre de la Aplicación
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej: Generador de Contratos..."
                    value={appModal.name}
                    onChange={e => setAppModal({ ...appModal, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-coral outline-none transition-all text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    URL / Enlace de la App
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://aistudio.google.com/..."
                    value={appModal.url}
                    onChange={e => setAppModal({ ...appModal, url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-coral outline-none transition-all text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAppModal({ open: false, mode: 'create', categoryName: '', name: '', url: '' })
                    }
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-coral hover:bg-terracotta text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move App Modal */}
      <AnimatePresence>
        {moveModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoveModal({ open: false, appId: '', appName: '', sourceCategory: '', targetCategory: '' })}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 z-10 ring-1 ring-slate-800 text-slate-100"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                  <FolderOutput size={18} className="text-coral" />
                  <span>Mover Aplicación</span>
                </div>
                <button
                  onClick={() => setMoveModal({ open: false, appId: '', appName: '', sourceCategory: '', targetCategory: '' })}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleMoveAppToCategory} className="space-y-4 pt-1">
                <p className="text-xs text-slate-300">
                  Mover <strong className="text-white font-bold">{moveModal.appName}</strong> a:
                </p>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Categoría Destino
                  </label>
                  <select
                    value={moveModal.targetCategory}
                    onChange={e => setMoveModal({ ...moveModal, targetCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-coral outline-none transition-all text-xs font-bold text-slate-100 ring-1 ring-slate-800"
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name} className="bg-slate-900 text-slate-100">
                        {c.name} {c.name === moveModal.sourceCategory ? '(Actual)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMoveModal({ open: false, appId: '', appName: '', sourceCategory: '', targetCategory: '' })}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-coral hover:bg-terracotta text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                  >
                    Mover
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog Modal */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4 z-10 ring-1 ring-slate-800 text-slate-100"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-coral/15 text-coral rounded-xl shrink-0 border border-coral/30">
                  <Lock size={18} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 rounded-xl bg-coral hover:bg-terracotta text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
