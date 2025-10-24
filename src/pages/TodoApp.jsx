import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, Star, Trash2, Check, X, Tag, Briefcase, ShoppingCart, Heart, Archive, CheckCircle2, Users } from 'lucide-react';

// Icon map to properly save/load icons from localStorage. Moved outside the component to ensure stability.
const iconMap = { Users, Briefcase, ShoppingCart, Heart, Archive, Tag };

// This component is for adding a new category. It's kept separate to prevent UI bugs.
const AddCategoryForm = ({ isAddingCategory, newCategoryName, setNewCategoryName, handleAddNewCategory, setIsAddingCategory, newCategoryInputRef }) => (
    isAddingCategory ? (
        <div className="p-2">
            <input
                ref={newCategoryInputRef}
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
            />
            <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsAddingCategory(false)} className="px-2 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-100">Cancel</button>
                <button onClick={handleAddNewCategory} className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">Add</button>
            </div>
        </div>
    ) : (
        <button onClick={() => setIsAddingCategory(true)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-blue-600 hover:bg-blue-50">
            <Plus className="w-4 h-4" /> Create New
        </button>
    )
);

// The main component for the To-Do application
const TodoApp = () => {
    // State hooks for managing todos, filters, and UI state
    const [todos, setTodos] = useState([]);
    const [categories, setCategories] = useState([
        { id: 'personal', name: 'Personal', icon: Users, iconName: 'Users', color: '#3b82f6' },
        { id: 'work', name: 'Work', icon: Briefcase, iconName: 'Briefcase', color: '#8b5cf6' },
        { id: 'shopping', name: 'Shopping', icon: ShoppingCart, iconName: 'ShoppingCart', color: '#10b981' },
        { id: 'health', name: 'Health', icon: Heart, iconName: 'Heart', color: '#ef4444' },
    ]);
    const [editingId, setEditingId] = useState(null);
    const [isAddExpanded, setIsAddExpanded] = useState(false);
    const [newTodo, setNewTodo] = useState('');
    const [activeInput, setActiveInput] = useState(null);
    const [tempInputValue, setTempInputValue] = useState('');
    const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        category: 'All',
        status: 'All'
    });
    // Add subtasks to newTodoDetails state
    const [newTodoDetails, setNewTodoDetails] = useState({
        title: '',
        category: 'personal',
        dueDate: '',
        description: '',
        isImportant: false,
        subtasks: [],
    });
    const [newSubtask, setNewSubtask] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');


    // Refs for DOM elements to handle clicks outside
    const addInputRef = useRef(null);
    const containerRef = useRef(null);
    const filterContainerRef = useRef(null);
    const tempInputRef = useRef(null);
    const newCategoryInputRef = useRef(null);
    
    // An array combining 'All' with the other categories for filter dropdowns
    const categoryOptions = [{ id: 'All', name: 'All', icon: Archive, color: '#6b7280' }, ...categories];
    const statusOptions = ['All', 'Active', 'Completed', 'Important'];
    const availableColors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#14b8a6'];
    
    // Load todos and categories from localStorage on initial render
    useEffect(() => {
        try {
            const savedTodos = JSON.parse(localStorage.getItem('modernTodos') || '[]');
            setTodos(savedTodos);
            const savedCategories = JSON.parse(localStorage.getItem('modernCategories'));
            if (savedCategories) {
                // Restore icon functions correctly after loading from JSON.
                const restoredCategories = savedCategories.map(cat => ({
                    ...cat,
                    icon: iconMap[cat.iconName] || Tag 
                }));
                setCategories(restoredCategories);
            }
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        }
    }, []);

    // Save todos and categories to localStorage whenever they change
    useEffect(() => {
        // Create a serializable version by removing the 'icon' function property.
        const serializableCategories = categories.map(({ icon, ...rest }) => rest);
        localStorage.setItem('modernTodos', JSON.stringify(todos));
        localStorage.setItem('modernCategories', JSON.stringify(serializableCategories));
    }, [todos, categories]);


    // Effect to handle clicks outside of active elements
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                handleSaveAndClose();
            }
            if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
                setActiveFilterDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isAddExpanded, activeFilterDropdown, newTodo, newTodoDetails, editingId]);

    // Focus on temporary input fields when they become active
    useEffect(() => {
        if (activeInput && tempInputRef.current) {
            tempInputRef.current.focus();
        }
        if(isAddingCategory && newCategoryInputRef.current){
            newCategoryInputRef.current.focus();
        }
    }, [activeInput, isAddingCategory]);

    // Handles changes in the main "add task" input field
    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewTodo(value);
        if (value.length > 0) {
            setIsAddExpanded(true);
        } else {
            setIsAddExpanded(false);
        }
    };
    
    // Handles saving new tasks or updating existing ones
    const handleSaveAndClose = () => {
        const title = newTodo.trim();

        if (!title && !editingId) {
            setIsAddExpanded(false);
            return;
        }

        if (editingId) {
            if (!title) { 
                deleteTodo(editingId);
            } else {
                setTodos(todos.map(t =>
                    t.id === editingId
                        ? { ...t, title, ...newTodoDetails }
                        : t
                ));
            }
        } else if (title) {
            const newTodoItem = {
                id: Date.now(),
                title,
                category: newTodoDetails.category || 'personal',
                dueDate: newTodoDetails.dueDate || '',
                description: newTodoDetails.description || '',
                completed: false,
                isImportant: newTodoDetails.isImportant || false,
                subtasks: newTodoDetails.subtasks || [],
                createdAt: new Date().toISOString(),
            };
            setTodos([newTodoItem, ...todos]);
        }
        
        resetFooterState();
    };
    
    const resetFooterState = () => {
        setEditingId(null);
        setIsAddExpanded(false);
        setNewTodo('');
        setActiveInput(null);
        setNewTodoDetails({
            title: '', category: 'personal', dueDate: '', description: '', isImportant: false, subtasks: []
        });
        setNewSubtask('');
    };

    // Cancels an edit in progress
    const cancelCurrentEdit = () => {
       resetFooterState();
    };
    
    const handleAddNewCategory = () => {
        const name = newCategoryName.trim();
        if(!name || categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;

        const newCategory = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            icon: Archive,
            iconName: 'Archive', 
            color: availableColors[categories.length % availableColors.length]
        };
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const toggleImportant = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, isImportant: !todo.isImportant } : todo
        ));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };
    
    // Populates the main input area for editing a task
    const startEdit = (todo) => {
        if (todo.completed) return;
        setEditingId(todo.id);
        setNewTodo(todo.title);
        setNewTodoDetails({
            category: todo.category,
            dueDate: todo.dueDate,
            description: todo.description,
            isImportant: todo.isImportant,
            subtasks: todo.subtasks || [], // Ensure subtasks is an array
        });
        setIsAddExpanded(true);
        setTimeout(() => addInputRef.current?.focus(), 100);
    };

    const handleInputConfirm = () => {
        const value = tempInputValue.trim();
        if (activeInput === 'dueDate') {
            setNewTodoDetails({ ...newTodoDetails, dueDate: value });
        }
        setTempInputValue('');
        setActiveInput(null);
    };

    const handleFilterChange = (filterType, value) => {
        setActiveFilters(prev => ({ ...prev, [filterType]: value }));
        setActiveFilterDropdown(null);
    };
    
    const clearFilters = () => {
        setActiveFilters({ category: 'All', status: 'All' });
        setActiveFilterDropdown(null);
    };
    
    // --- Subtask Handlers ---
    const handleAddSubtask = () => {
        const text = newSubtask.trim();
        if (text) {
            const newSub = { id: Date.now(), text, completed: false };
            setNewTodoDetails(prev => ({ ...prev, subtasks: [...(prev.subtasks || []), newSub] }));
            setNewSubtask('');
        }
    };
    
    const handleToggleSubtaskInEdit = (subId) => {
        const updatedSubtasks = newTodoDetails.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
        setNewTodoDetails(prev => ({ ...prev, subtasks: updatedSubtasks }));
    };

    const handleDeleteSubtaskInEdit = (subId) => {
        setNewTodoDetails(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter(s => s.id !== subId)
        }));
    };

    const handleToggleSubtaskOnCard = (todoId, subtaskId) => {
        setTodos(todos.map(todo => {
            if (todo.id === todoId) {
                const updatedSubtasks = (todo.subtasks || []).map(sub =>
                    sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
                );
                return { ...todo, subtasks: updatedSubtasks };
            }
            return todo;
        }));
    };


    const isAnyFilterActive = activeFilters.category !== 'All' || activeFilters.status !== 'All';

    const getFilteredTodos = () => {
        let filtered = todos;
        if (activeFilters.category !== 'All') {
            filtered = filtered.filter(todo => todo.category === activeFilters.category);
        }
        if (activeFilters.status === 'Active') {
            filtered = filtered.filter(todo => !todo.completed);
        } else if (activeFilters.status === 'Completed') {
            filtered = filtered.filter(todo => todo.completed);
        } else if (activeFilters.status === 'Important') {
            filtered = filtered.filter(todo => todo.isImportant);
        }
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (dateString) => {
        if (!dateString) return false;
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };
    
    const getCategoryInfo = (categoryId, property) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return property === 'color' ? '#6b7280' : Tag;
        return category[property] || (property === 'icon' ? Tag : '#6b7280');
    };
    
    const filteredTodos = getFilteredTodos();
    const activeTodos = filteredTodos.filter(t => !t.completed);
    const completedTodos = filteredTodos.filter(t => t.completed);

    const activeCategoryInfo = categoryOptions.find(c => c.id === activeFilters.category) || categoryOptions[0];
    const activeTasksCount = todos.filter(t => !t.completed).length;
    const importantTasksCount = todos.filter(t => t.isImportant && !t.completed).length;

    return (
        <div className="space-y-6">
            <div className="container mx-auto">
                <header className="flex flex-wrap items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
                        <p className="text-gray-500 text-sm">Organize your life, one task at a time.</p>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap justify-end">
                        <div ref={filterContainerRef} className="flex items-center gap-2 flex-wrap justify-end">
                            <div className="relative">
                                <button
                                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'category' ? null : 'category')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${activeFilters.category !== 'All' ? 'bg-blue-100 text-blue-800 border-blue-200 shadow-sm' : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-white hover:shadow-sm'}`}
                                >
                                    {React.createElement(activeCategoryInfo.icon, { className: "w-4 h-4", style: { color: activeCategoryInfo.color } })}
                                    <span><b>{activeCategoryInfo.name}</b></span>
                                </button>
                                {activeFilterDropdown === 'category' && (
                                    <div className="absolute top-full mt-2 right-0 p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border z-20 min-w-[200px]">
                                        {categoryOptions.map(cat => (
                                            <button key={cat.id} onClick={() => handleFilterChange('category', cat.id)} className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeFilters.category === cat.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}>
                                                <cat.icon className="w-4 h-4" style={{color: cat.color}}/>
                                                {cat.name}
                                            </button>
                                        ))}
                                        <div className="my-1 h-px bg-gray-100"></div>
                                        <AddCategoryForm 
                                            isAddingCategory={isAddingCategory}
                                            newCategoryName={newCategoryName}
                                            setNewCategoryName={setNewCategoryName}
                                            handleAddNewCategory={handleAddNewCategory}
                                            setIsAddingCategory={setIsAddingCategory}
                                            newCategoryInputRef={newCategoryInputRef}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'status' ? null : 'status')}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${activeFilters.status !== 'All' ? 'bg-green-100 text-green-800 border-green-200 shadow-sm' : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-white hover:shadow-sm'}`}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Status: <b>{activeFilters.status}</b></span>
                                </button>
                                {activeFilterDropdown === 'status' && (
                                    <div className="absolute top-full mt-2 right-0 p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border z-20 min-w-[200px]">
                                        {statusOptions.map(status => (
                                            <button key={status} onClick={() => handleFilterChange('status', status)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeFilters.status === status ? 'bg-green-50 text-green-700' : 'hover:bg-gray-100'}`}>
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {isAnyFilterActive && (
                                <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors shadow-sm">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{activeTasksCount}</p>
                                <p className="text-xs text-gray-500 font-medium">Active</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-500">{importantTasksCount}</p>
                                <p className="text-xs text-gray-500 font-medium">Important</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-0 mb-52">
                    {activeTodos.length > 0 && (
                        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                            {activeTodos.map((todo) => (
                                <TodoCard 
                                    key={todo.id}
                                    todo={todo}
                                    startEdit={startEdit}
                                    toggleTodo={toggleTodo}
                                    deleteTodo={deleteTodo}
                                    toggleImportant={toggleImportant}
                                    getCategoryInfo={getCategoryInfo}
                                    formatDate={formatDate}
                                    isOverdue={isOverdue}
                                    onToggleSubtask={handleToggleSubtaskOnCard}
                                />
                            ))}
                        </div>
                    )}
                    
                    {completedTodos.length > 0 && (
                        <>
                            <h3 className="text-lg font-semibold text-gray-600 mt-12 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Completed
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {completedTodos.map(todo => (
                                    <div key={todo.id} className="group relative bg-gray-50/70 opacity-80 border-l-4 border-gray-300 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <button onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }} className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-green-500 border-green-500 text-white shadow-md shadow-green-200`}>
                                                <Check size={12} />
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-500 leading-snug break-words text-base mb-1 line-through">{todo.title}</h4>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-opacity duration-300 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {filteredTodos.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg"><CheckCircle2 className="w-20 h-20 text-indigo-400" /></div>
                            <h3 className="text-2xl font-semibold text-gray-700 mb-3">{isAnyFilterActive ? 'No matching tasks' : 'All caught up!'}</h3>
                            <p className="text-gray-500">{isAnyFilterActive ? 'Try adjusting your filters.' : 'Add a new task below to get started.'}</p>
                        </div>
                    )}
                </main>

                <footer className="fixed bottom-0 left-0 right-0 flex justify-center px-4 py-6 z-50 pointer-events-none">
                    <div ref={containerRef} className="w-full max-w-2xl pointer-events-auto">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl shadow-grey-300/60 border border-gray-100/80 w-full transform transition-all duration-300 ease-out ring-1 ring-black/5">
                            <div className="p-4">
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isAddExpanded ? 'max-h-[30rem]' : 'max-h-0'}`}>
                                    <textarea placeholder="Add description..." value={newTodoDetails.description} onChange={(e) => setNewTodoDetails({ ...newTodoDetails, description: e.target.value })} className="w-full h-20 border-none outline-none resize-none bg-transparent text-sm leading-relaxed text-gray-700 placeholder-gray-400 p-2 focus:bg-transparent" />
                                    {/* Sub-task Section */}
                                    <div className="px-2 pt-2 border-t border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-500 mb-2">CHECKLIST</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {(newTodoDetails.subtasks || []).map(sub => (
                                                <div key={sub.id} className="group flex items-center gap-3">
                                                    <button onClick={() => handleToggleSubtaskInEdit(sub.id)} className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${sub.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                                        {sub.completed && <Check size={12}/>}
                                                    </button>
                                                    <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{sub.text}</span>
                                                    <button onClick={() => handleDeleteSubtaskInEdit(sub.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-gray-100">
                                            <Plus className="text-gray-400 w-5 h-5 flex-shrink-0"/>
                                            <input 
                                                type="text" 
                                                placeholder="Add sub-task" 
                                                value={newSubtask} 
                                                onChange={(e) => setNewSubtask(e.target.value)} 
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()} 
                                                className="flex-1 w-full text-sm outline-none bg-transparent placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={`pt-2 ${isAddExpanded ? 'border-t mt-2' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                            <Plus className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                                            <input ref={addInputRef} type="text" placeholder={editingId ? "Edit task..." : "Add a task..."} value={newTodo} onChange={handleInputChange} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveAndClose(); }}} className="flex-1 text-base text-gray-800 placeholder-gray-500 border-none outline-none bg-transparent" onFocus={() => { if (newTodo) setIsAddExpanded(true); }} />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {editingId && (<button onClick={cancelCurrentEdit} className="p-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors" title="Cancel edit"><X className="w-4 h-4"/></button>)}
                                            <button onClick={() => setNewTodoDetails({ ...newTodoDetails, isImportant: !newTodoDetails.isImportant })} className={`p-2 rounded-lg transition-colors ${newTodoDetails.isImportant ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`} title="Mark as important"><Star className="w-4 h-4" /></button>
                                            
                                            {activeInput === 'dueDate' ? (
                                                <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-md border"><input ref={tempInputRef} type="date" value={tempInputValue} onChange={(e) => setTempInputValue(e.target.value)} className="outline-none bg-transparent text-sm w-32"/><button onClick={handleInputConfirm} className="text-green-600 p-1 rounded-md hover:bg-green-50"><Check className="w-3 h-3" /></button><button onClick={() => setActiveInput(null)} className="text-gray-400 p-1 rounded-md hover:bg-gray-50"><X className="w-3 h-3" /></button></div>
                                            ) : (
                                                <button onClick={() => { setActiveInput('dueDate'); setTempInputValue(newTodoDetails.dueDate || new Date().toISOString().split('T')[0]); }} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Set due date"><Calendar className="w-4 h-4" /></button>
                                            )}
                                            
                                            <div className="relative">
                                                <button onClick={() => setActiveInput(activeInput === 'category' ? null : 'category')} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Select category">
                                                    {React.createElement(getCategoryInfo(newTodoDetails.category, 'icon'), { className: "w-4 h-4", style:{color: getCategoryInfo(newTodoDetails.category, 'color')}})}
                                                </button>
                                                {activeInput === 'category' && (
                                                    <div className="absolute bottom-full mb-2 right-0 p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border z-50 min-w-[200px]">
                                                        {categories.map((cat) => (
                                                            <button key={cat.id} onClick={() => { setNewTodoDetails({ ...newTodoDetails, category: cat.id }); setActiveInput(null); }} className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${newTodoDetails.category === cat.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}>
                                                                <cat.icon className="w-4 h-4" style={{color: cat.color}}/>
                                                                <span>{cat.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const TodoCard = ({ todo, startEdit, toggleTodo, toggleImportant, deleteTodo, getCategoryInfo, formatDate, isOverdue, onToggleSubtask }) => {
    const categoryColor = getCategoryInfo(todo.category, 'color');
    const CategoryIcon = getCategoryInfo(todo.category, 'icon');
    const overdue = isOverdue(todo.dueDate);
    const leftBorderColor = todo.isImportant ? '#facc15' : overdue ? '#f87171' : categoryColor;
    
    const totalSubtasks = todo.subtasks?.length || 0;
    const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;

    return (
        <div
            onClick={() => startEdit(todo)}
            className={`group relative flex flex-col justify-between bg-white/80 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03] break-inside-avoid border-l-4 shadow-md`}
            style={{ borderLeftColor: leftBorderColor }}
        >
            <div>
                <div className="flex items-start gap-3">
                    <button onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }} className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center hover:scale-110 border-gray-300 hover:border-green-400`}></button>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-semibold text-gray-800 leading-snug break-words text-base mb-1`}>{todo.title}</h4>
                            <div className="flex items-center flex-shrink-0 -mt-1 -mr-1.5">
                                <button onClick={(e) => { e.stopPropagation(); toggleImportant(todo.id); }} className={`p-1.5 rounded-full transition-all duration-300 ${todo.isImportant ? 'text-yellow-500 hover:bg-yellow-100 opacity-100' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 opacity-0 group-hover:opacity-100'}`}><Star size={16} className={todo.isImportant ? 'fill-current' : ''} /></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className="p-1.5 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-opacity duration-300 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        {todo.description && (<p className={`text-sm text-gray-600 leading-relaxed break-words`}>{todo.description}</p>)}
                    </div>
                </div>
            </div>
             {/* Subtask list shown on hover */}
             {totalSubtasks > 0 && (
                <div className="overflow-hidden max-h-0 group-hover:max-h-96 transition-all duration-500 ease-in-out group-hover:mt-3">
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        {todo.subtasks.map(sub => (
                             <div key={sub.id} className="flex items-center gap-3 rounded-md p-1" onClick={(e) => e.stopPropagation()}>
                                 <button onClick={() => onToggleSubtask(todo.id, sub.id)} className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${sub.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 hover:border-blue-400'}`}>
                                     {sub.completed && <Check size={10} />}
                                 </button>
                                 <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{sub.text}</span>
                             </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                    {todo.dueDate && (<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}><Calendar className="w-3 h-3" />{formatDate(todo.dueDate)}</span>)}
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: `${categoryColor}1A`, color: categoryColor }}><CategoryIcon className="w-3 h-3" />{getCategoryInfo(todo.category, 'name')}</span>
                </div>
                {totalSubtasks > 0 && (
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                         <div className="w-12 bg-gray-200 rounded-full h-1.5">
                             <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${Math.round((completedSubtasks/totalSubtasks)*100)}%`}}></div>
                         </div>
                         <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
                     </div>
                )}
            </div>
        </div>
    );
};

export default TodoApp;

