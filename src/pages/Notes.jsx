import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Check, X, Tag, Users, Bell, Palette, Square, ListTodo, MoreVertical, Image, Archive, Pin, Home, ShoppingCart, DollarSign, Plane, Briefcase, Filter, CalendarDays } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import AdminAPI from '../services/adminAPI';
import toast from 'react-hot-toast';

const backgroundColors = [
  { name: 'Default', class: 'bg-white border-gray-200', value: 'white', textClass: 'text-gray-800', placeholderClass: 'placeholder-gray-400' },
  { name: 'Red', class: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200', value: 'red', textClass: 'text-red-900', placeholderClass: 'placeholder-red-300' },
  { name: 'Orange', class: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200', value: 'orange', textClass: 'text-orange-900', placeholderClass: 'placeholder-orange-300' },
  { name: 'Yellow', class: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200', value: 'yellow', textClass: 'text-yellow-900', placeholderClass: 'placeholder-yellow-300' },
  { name: 'Green', class: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200', value: 'green', textClass: 'text-green-900', placeholderClass: 'placeholder-green-300' },
  { name: 'Teal', class: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200', value: 'teal', textClass: 'text-teal-900', placeholderClass: 'placeholder-teal-300' },
  { name: 'Blue', class: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200', value: 'blue', textClass: 'text-blue-900', placeholderClass: 'placeholder-blue-300' },
  { name: 'Purple', class: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200', value: 'purple', textClass: 'text-purple-900', placeholderClass: 'placeholder-purple-300' },
  { name: 'Pink', class: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200', value: 'pink', textClass: 'text-pink-900', placeholderClass: 'placeholder-pink-300' },
  { name: 'Brown', class: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200', value: 'brown', textClass: 'text-amber-900', placeholderClass: 'placeholder-amber-300' },
  { name: 'Gray', class: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200', value: 'gray', textClass: 'text-gray-900', placeholderClass: 'placeholder-gray-400' },
];

const defaultLabels = ['Personal', 'Work', 'Urgent', 'Ideas'];
const defaultPeople = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];
const initialCategories = [
  { name: 'General', Icon: Archive },
  { name: 'Home', Icon: Home },
  { name: 'Shopping', Icon: ShoppingCart },
  { name: 'Finance', Icon: DollarSign },
  { name: 'Travel', Icon: Plane },
  { name: 'Project', Icon: Briefcase },
];
const dateFilterOptions = ['Any time', 'Past 24 hours', 'Past 7 days', 'Past 30 days'];

// ++ ADDED: A reusable skeleton component for the loading state
const NoteSkeleton = () => (
  <div className="bg-gray-100 rounded-2xl p-5 mb-4 break-inside-avoid animate-pulse">
    <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
      <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
    </div>
    <div className="flex gap-2 mt-4">
      <div className="h-5 bg-gray-200 rounded-lg w-16"></div>
      <div className="h-5 bg-gray-200 rounded-lg w-20"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded-md w-1/2 mt-5"></div>
  </div>
);

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(initialCategories);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddCheckbox, setShowAddCheckbox] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    title: '',
    content: '',
    listItems: [],
    labels: [],
    people: [],
    reminder: '',
    backgroundColor: 'white',
    isPinned: false,
    category: 'General',
    image: null,
  });
  // const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [activeInput, setActiveInput] = useState(null);
  const [tempInputValue, setTempInputValue] = useState('');
  const [newListItem, setNewListItem] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState({
    category: 'All',
    label: 'All',
    people: 'All',
    date: 'Any time',
  });
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const [updatingNoteId, setUpdatingNoteId] = useState(null);


  const containerRef = useRef(null);
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const tempInputRef = useRef(null);
  const newListItemRef = useRef(null);
  const filterContainerRef = useRef(null);

  const { searchQuery, showConfirmation } = useOutletContext();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await AdminAPI.get('/notes');
        setNotes(response.data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setLoading(false); // Stop loading regardless of outcome
      }
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [tempInputValue, activeInput]);

  const allLabels = [...new Set([...defaultLabels, ...notes.flatMap(note => note.labels ?? [])])];
  const allPeople = [...new Set([...defaultPeople, ...notes.flatMap(note => note.people ?? [])])];

  const filteredLabels = allLabels.filter(label =>
    tempInputValue &&
    label.toLowerCase().includes(tempInputValue.toLowerCase()) &&
    !currentNote.labels?.includes(label)
  );

  const filteredPeople = allPeople.filter(person =>
    tempInputValue &&
    person.toLowerCase().includes(tempInputValue.toLowerCase()) &&
    !currentNote.people?.includes(person)
  );

  const showCreateNewLabel = tempInputValue && !allLabels.some(l => l.toLowerCase() === tempInputValue.toLowerCase());
  const showCreateNewPerson = tempInputValue && !allPeople.some(p => p.toLowerCase() === tempInputValue.toLowerCase());

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeInput !== 'label' && activeInput !== 'people') return;
      const isLabel = activeInput === 'label';
      const items = isLabel ? filteredLabels : filteredPeople;
      const showCreate = isLabel ? showCreateNewLabel : showCreateNewPerson;
      const totalItems = (items?.length ?? 0) + (showCreate ? 1 : 0);

      if (totalItems === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex < 0) return;
        if (showCreate && highlightedIndex === 0) {
          handleInputConfirm();
        } else {
          const itemIndex = showCreate ? highlightedIndex - 1 : highlightedIndex;
          const selectedItem = items?.[itemIndex];
          if (selectedItem) {
            handleDropdownSelect(activeInput, selectedItem);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInput, highlightedIndex, filteredLabels, filteredPeople, showCreateNewLabel, showCreateNewPerson]);

  useEffect(() => {
    function handleClickOutside(event) {
      const clickOutsideNoteEditor = !containerRef.current?.contains(event.target);
      const clickOutsideFilters = !filterContainerRef.current?.contains(event.target);

      if (isExpanded && !activeInput && clickOutsideNoteEditor && clickOutsideFilters) {
        handleSaveNote();
      }

      if (activeFilterDropdown && clickOutsideFilters) {
        setActiveFilterDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, currentNote, activeInput, activeFilterDropdown]);

  useEffect(() => {
    if (isExpanded && !activeInput) {
      if (!currentNote.title) {
        titleInputRef.current?.focus();
      } else {
        contentInputRef.current?.focus();
      }
    }
  }, [isExpanded, activeInput]);

  useEffect(() => {
    if ((activeInput === 'newCategory' || activeInput === 'label' || activeInput === 'people' || activeInput === 'reminder')) {
      tempInputRef.current?.focus();
    }
  }, [activeInput]);

  const hasContent = currentNote.title?.trim() ||
    currentNote.content?.trim() ||
    (currentNote.listItems?.length > 0) ||
    currentNote.image;

  const handleInputClick = () => {
    setShowModal(true);
    setTimeout(() => setIsExpanded(true), 10);
  };

  const handleSaveNote = async () => {
    if (hasContent) {
      try {
        if (editingId) {
          const response = await AdminAPI.put(`/update-note/${editingId}`, currentNote);
          const savedNote = response.data;
          setNotes(notes.map(note => note._id === editingId ? savedNote : note));
          toast.success('Note updated successfully.')
        } else {
          const response = await AdminAPI.post('/create-note', currentNote);
          const savedNote = response.data;
          setNotes([savedNote, ...notes]);
          toast.success('Note created successfully.')
        }
      } catch (error) {
        console.error("Failed to save note:", error);
        toast.error('Failed to save note.')
      }
    }
    resetCurrentNote();
  };

  const resetCurrentNote = () => {
    setIsExpanded(false); // Trigger closing animation

    setTimeout(() => {
      setShowModal(false);
      setCurrentNote({
        title: '',
        content: '',
        listItems: [],
        labels: [],
        people: [],
        reminder: '',
        backgroundColor: 'white',
        isPinned: false,
        category: 'General',
        image: null,
      });
      setShowAddCheckbox(false);
      setActiveInput(null);
      setTempInputValue('');
      setNewListItem('');
      setEditingId(null);
    }, 300); // This must match the transition duration
  };

  const handleEditNote = (note) => {
    setCurrentNote({ ...note });
    setEditingId(note._id);
    setShowAddCheckbox((note.listItems?.length ?? 0) > 0);
    setShowModal(true);
    setTimeout(() => setIsExpanded(true), 10);
  };

  const handleDeleteNote = async (id) => {
    setUpdatingNoteId(id);
    try {
      await AdminAPI.delete(`/delete-note/${id}`);
      setNotes(notes.filter(note => note._id !== id));
      toast.success('Note deleted successfully.')
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error('Failed to delete note.')
    } finally {
      setUpdatingNoteId(null); // MODIFIED: Clear the ID on completion
    }
  };

  const confirmNoteDeletion = (id) => {
    showConfirmation({
      title: 'Delete this note?',
      description: `Are you sure you want to permanently delete? This cannot be undone.`,
      confirmButtonText: 'Yes, Delete Note',
      variant: 'danger',
      onConfirm: () => handleDeleteNote(id),
    });
  };

  const toggleAddCheckbox = () => setShowAddCheckbox(!showAddCheckbox);

  const addListItem = () => {
    if (newListItem.trim()) {
      setCurrentNote({
        ...currentNote,
        listItems: [...(currentNote.listItems ?? []), {
          id: Date.now(),
          text: newListItem.trim(),
          description: '',
          completed: false
        }]
      });
      setNewListItem('');
    }
  };

  const toggleListItem = (itemId) => {
    setCurrentNote(prev => ({
      ...prev,
      listItems: prev.listItems?.map(item =>
        item._id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const removeListItem = (itemId) => {
    setCurrentNote(prev => ({
      ...prev,
      listItems: prev.listItems?.filter(item => item._id !== itemId)
    }));
  };

  const updateListItem = (itemId, field, value) => {
    setCurrentNote(prev => ({
      ...prev,
      listItems: prev.listItems?.map(item =>
        item._id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const togglePin = () => {
    setCurrentNote({ ...currentNote, isPinned: !currentNote.isPinned });
  };

  const handleCreateNewCategory = () => {
    const newCategoryName = tempInputValue.trim();
    if (newCategoryName && !categories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
      setCategories(prev => [...prev, { name: newCategoryName, Icon: Archive }]);
      setCurrentNote(prev => ({ ...prev, category: newCategoryName }));
    }
    setActiveInput(null);
    setTempInputValue('');
  };

  const handleInputConfirm = () => {
    const value = tempInputValue.trim();
    if (activeInput === 'newCategory') {
      handleCreateNewCategory();
      return;
    }

    if (!value) {
      setActiveInput(null);
      setTempInputValue('');
      return;
    }

    switch (activeInput) {
      case 'label':
        if (!currentNote.labels?.includes(value)) {
          setCurrentNote({ ...currentNote, labels: [...(currentNote.labels ?? []), value] });
        }
        break;
      case 'people':
        if (!currentNote.people?.includes(value)) {
          setCurrentNote({ ...currentNote, people: [...(currentNote.people ?? []), value] });
        }
        break;
      case 'reminder':
        setCurrentNote({ ...currentNote, reminder: value });
        break;
    }

    setTempInputValue('');
    setActiveInput(null);
  };

  const handleDropdownSelect = (type, value) => {
    if (type === 'label') {
      if (!currentNote.labels?.includes(value)) {
        setCurrentNote(prev => ({ ...prev, labels: [...(prev.labels ?? []), value] }));
      }
    } else if (type === 'people') {
      if (!currentNote.people?.includes(value)) {
        setCurrentNote(prev => ({ ...prev, people: [...(prev.people ?? []), value] }));
      }
    }
    setTempInputValue('');
    setActiveInput(null);
  };

  const removeTag = (type, item) => {
    if (type === 'label') {
      setCurrentNote({ ...currentNote, labels: currentNote.labels?.filter(label => label !== item) });
    } else if (type === 'people') {
      setCurrentNote({ ...currentNote, people: currentNote.people?.filter(person => person !== item) });
    }
  };

  const toggleNoteListItem = async (noteId, itemId) => {
    const noteToUpdate = notes.find(note => note._id === noteId);
    if (!noteToUpdate) return;

    setUpdatingNoteId(noteId);

    const updatedNote = {
      ...noteToUpdate,
      listItems: noteToUpdate.listItems?.map(item => {
        return item._id === itemId ? { ...item, completed: !item.completed } : item;
      }
      ),
    };

    try {
      const response = await AdminAPI.put(`/update-note/${noteId}`, updatedNote);
      const savedNote = response.data;
      setNotes(notes.map(n => (n._id === noteId ? savedNote : n)));
      toast.success('Task marked successfully.')
    } catch (error) {
      console.error("Failed to toggle list item:", error);
      toast.error('Failed to toggle list item.')
    } finally {
      setUpdatingNoteId(null); // MODIFIED: Clear the ID on completion
    }
  };

  const toggleNotePin = async (noteId, e) => {
    e.stopPropagation();
    const noteToUpdate = notes.find(note => note._id === noteId);
    if (!noteToUpdate) return;

    setUpdatingNoteId(noteId);

    const updatedNote = { ...noteToUpdate, isPinned: !noteToUpdate.isPinned };

    try {
      const response = await AdminAPI.put(`/update-note/${noteId}`, updatedNote);
      const savedNote = response.data;
      setNotes(notes.map(n => (n._id === noteId ? savedNote : n)));
      toast.success('Note pinned successfully.')
    } catch (error) {
      console.error("Failed to update pin status:", error);
      toast.error('Failed to update pin status.')
    } finally {
      setUpdatingNoteId(null); // MODIFIED: Clear the ID on completion
    }
  };

  const getBackgroundStyle = (bgValue) => backgroundColors.find(bg => bg.value === bgValue) ?? backgroundColors[0];
  const getCategoryIcon = (categoryName) => categories.find(c => c.name === categoryName)?.Icon ?? categories[0].Icon;

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
    setActiveFilterDropdown(null);
  };

  const clearFilters = () => {
    setActiveFilters({ category: 'All', label: 'All', people: 'All', date: 'Any time' });
    setActiveFilterDropdown(null);
  };

  const isAnyFilterActive = activeFilters.category !== 'All' || activeFilters.label !== 'All' || activeFilters.people !== 'All' || activeFilters.date !== 'Any time';

  const filteredNotes = notes.filter(note => {
    const { category, label, people, date } = activeFilters;
    const term = searchQuery.toLowerCase();

    if (date !== 'Any time') {
      const noteDate = new Date(note.updatedAt);
      const now = new Date();
      const diffHours = (now - noteDate) / (1000 * 60 * 60);
      if (date === 'Past 24 hours' && diffHours > 24) return false;
      if (date === 'Past 7 days' && diffHours > 24 * 7) return false;
      if (date === 'Past 30 days' && diffHours > 24 * 30) return false;
    }

    if (category !== 'All' && note.category !== category) return false;
    if (label !== 'All' && !note.labels?.includes(label)) return false;
    if (people !== 'All' && !note.people?.includes(people)) return false;

    if (term) {
      return (
        note.title?.toLowerCase().includes(term) ||
        note.content?.toLowerCase().includes(term) ||
        note.labels?.some(l => l.toLowerCase().includes(term)) ||
        note.people?.some(p => p.toLowerCase().includes(term)) ||
        note.category?.toLowerCase().includes(term) ||
        note.listItems?.some(item =>
          item.text?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
        )
      );
    }
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b?.updatedAt ?? 0) - new Date(a?.updatedAt ?? 0);
  });

  const getTimeAgoStyle = (date) => {
    if (!date) return 'text-gray-500';
    const now = new Date();
    const noteDate = new Date(date);
    const diffInHours = Math.floor((now - noteDate) / (1000 * 60 * 60));
    if (diffInHours < 24) {
      return 'text-amber-700';
    }
    return 'text-gray-500';
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const noteDate = new Date(date);
    const diffInSeconds = Math.floor((now - noteDate) / 1000);
    if (diffInSeconds < 60) return 'just now';
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const formatReminderDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Keep</h1>
              <p className="text-gray-500 text-sm">Capture what's on your mind</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div ref={filterContainerRef} className="flex justify-center items-center gap-2 flex-wrap">
              <div className="relative">
                <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'category' ? null : 'category')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${activeFilters.category !== 'All' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white/60 text-gray-700 border-gray-200 hover:bg-white'}`}>
                  {React.createElement(getCategoryIcon(activeFilters.category !== 'All' ? activeFilters.category : 'General'), { className: "w-4 h-4" })}
                  <span>Category: <b>{activeFilters.category}</b></span>
                </button>
                {activeFilterDropdown === 'category' && (
                  <div className="absolute top-full mt-2 right-0 p-2 bg-white rounded-lg shadow-2xl border z-20 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                    {['All', ...categories.map(c => c.name)].map(cat => (
                      <button key={cat} onClick={() => handleFilterChange('category', cat)} className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeFilters.category === cat ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}>
                        {React.createElement(getCategoryIcon(cat === 'All' ? 'General' : cat), { className: "w-4 h-4" })}
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'label' ? null : 'label')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${activeFilters.label !== 'All' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-white/60 text-gray-700 border-gray-200 hover:bg-white'}`}>
                  <Tag className="w-4 h-4" />
                  <span>Label: <b>{activeFilters.label}</b></span>
                </button>
                {activeFilterDropdown === 'label' && (
                  <div className="absolute top-full mt-2 right-0 p-2 bg-white rounded-lg shadow-2xl border z-20 min-w-[200px] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {['All', ...allLabels].map(label => (
                      <button key={label} onClick={() => handleFilterChange('label', label)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeFilters.label === label ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-100'}`}>{label}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'people' ? null : 'people')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${activeFilters.people !== 'All' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-white/60 text-gray-700 border-gray-200 hover:bg-white'}`}>
                  <Users className="w-4 h-4" />
                  <span>People: <b>{activeFilters.people}</b></span>
                </button>
                {activeFilterDropdown === 'people' && (
                  <div className="absolute top-full mt-2 right-0 p-2 bg-white rounded-lg shadow-2xl border z-20 min-w-[200px] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {['All', ...allPeople].map(person => (
                      <button key={person} onClick={() => handleFilterChange('people', person)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeFilters.people === person ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}>{person}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => setActiveFilterDropdown(activeFilterDropdown === 'date' ? null : 'date')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${activeFilters.date !== 'Any time' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-white/60 text-gray-700 border-gray-200 hover:bg-white'}`}>
                  <CalendarDays className="w-4 h-4" />
                  <span>Date: <b>{activeFilters.date}</b></span>
                </button>
                {activeFilterDropdown === 'date' && (
                  <div className="absolute top-full mt-2 right-0 p-2 bg-white rounded-lg shadow-2xl border z-20 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
                    {dateFilterOptions.map(dateOpt => (
                      <button key={dateOpt} onClick={() => handleFilterChange('date', dateOpt)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeFilters.date === dateOpt ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-100'}`}>{dateOpt}</button>
                    ))}
                  </div>
                )}
              </div>
              {isAnyFilterActive && (
                <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors hover:animate-pulse">
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{notes.length} notes</span>
                <span>•</span>
                <span className={`${notes.filter(n => n.isPinned).length > 0 ? 'text-amber-600 font-semibold' : ''}`}>{notes.filter(n => n.isPinned).length} pinned</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 flex justify-center">
          <div
            onClick={handleInputClick}
            className="w-full max-w-xl p-4 cursor-text rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center text-gray-500 text-lg">
              <Plus className="w-5 h-5 mr-3" />
              <span>Take a note...</span>
            </div>
          </div>
        </div>

        {showModal && (
          <>
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`fixed inset-0 z-40 flex justify-center items-start pt-20 p-4 overflow-y-auto transition-opacity duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <div
                ref={containerRef}
                className={`${getBackgroundStyle(currentNote.backgroundColor).class} rounded-2xl shadow-2xl border w-full max-w-2xl transition-all duration-300 ease-in-out ${isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input ref={titleInputRef} type="text" placeholder="Title" value={currentNote.title} onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                      className={`flex-1 text-xl font-semibold border-none outline-none bg-transparent ${getBackgroundStyle(currentNote.backgroundColor).textClass} ${getBackgroundStyle(currentNote.backgroundColor).placeholderClass}`}
                    />
                    <button onClick={togglePin} className={`p-2 rounded-xl transition-all ${currentNote.isPinned ? 'text-yellow-600 bg-yellow-100 shadow-md' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`} title={currentNote.isPinned ? 'Unpin note' : 'Pin note'}><Pin className="w-5 h-5" /></button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <textarea ref={contentInputRef} placeholder="Take a note..." value={currentNote.content} onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                        className={`w-full h-22 border-none outline-none resize-none bg-transparent text-base leading-relaxed ${getBackgroundStyle(currentNote.backgroundColor).textClass} ${getBackgroundStyle(currentNote.backgroundColor).placeholderClass}`}
                      />
                    </div>

                    {(currentNote.listItems?.length > 0) && (
                      <div className="space-y-3 border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2 mb-3"><ListTodo className="w-5 h-5 text-blue-600" /><h4 className="text-sm font-semibold text-gray-700">Checklist Items</h4></div>
                        {currentNote.listItems.map((item) => {
                          return (<div key={item.id} className={`group transition-opacity duration-300 ${item.completed ? 'opacity-60' : 'opacity-100'}`}>
                            <div className="flex items-start gap-3">
                              <button onClick={() => toggleListItem(item._id)} className={`flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all flex-shrink-0 mt-1 ${item.completed ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-md' : 'border-gray-300 hover:border-green-400 hover:shadow-md'}`}>{item.completed && <Check className="w-3 h-3" />}</button>
                              <div className="flex-1 space-y-2">
                                <input type="text" value={item.text} onChange={(e) => updateListItem(item._id, 'text', e.target.value)} className={`w-full text-gray-700 bg-transparent border-none outline-none text-base font-medium ${item.completed ? 'line-through text-gray-400' : ''}`} placeholder="Checkbox item" />
                                <textarea value={item.description} onChange={(e) => updateListItem(item._id, 'description', e.target.value)} className={`w-full text-sm text-gray-600 bg-transparent border-none outline-none resize-none ${item.completed ? 'line-through text-gray-400' : ''}`} placeholder="Add description..." rows="2" />
                              </div>
                              <button onClick={() => removeListItem(item._id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50"><X className="w-4 h-4" /></button>
                            </div>
                          </div>);
                        })}
                      </div>
                    )}

                    {showAddCheckbox && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50/50 border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
                          <div className="w-5 h-5 border-2 border-blue-400 rounded-lg flex-shrink-0"></div>
                          <input ref={newListItemRef} type="text" placeholder="Add a new checkbox item..." value={newListItem} onChange={(e) => setNewListItem(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { addListItem(); } }} className="flex-1 text-gray-700 bg-transparent border-none outline-none font-medium" />
                          {newListItem.trim() && (<button onClick={addListItem} className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100"><Plus className="w-4 h-4" /></button>)}
                        </div>
                      </div>
                    )}
                  </div>

                  {((currentNote.labels?.length > 0) || (currentNote.people?.length > 0) || currentNote.reminder || currentNote.category) && (
                    <div className="flex flex-wrap gap-2 mt-6 items-center">
                      <div className="relative">
                        <button onClick={() => setActiveInput(activeInput === 'category' ? 'category' : 'category')} title="Change category" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-800 font-medium rounded-xl shadow-sm border border-gray-200 hover:bg-gray-200 transition-colors">
                          {React.createElement(getCategoryIcon(currentNote.category), { className: "w-4 h-4" })}
                          <span>{currentNote.category}</span>
                        </button>
                        {activeInput === 'category' && (
                          <div className="absolute top-full mt-2 left-0 p-2 bg-white rounded-2xl shadow-2xl border z-50 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
                            <>
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 px-2">Select Category</h4>
                              <ul className="space-y-1 max-h-40 overflow-y-auto">
                                {categories.map((category) => (
                                  <li key={category.name}>
                                    <button onClick={() => { setCurrentNote({ ...currentNote, category: category.name }); setActiveInput(null); }} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${currentNote.category === category.name ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 text-gray-700'}`}>
                                      <div className="flex items-center gap-3"><category.Icon className="w-4 h-4" /><span>{category.name}</span></div>
                                      {currentNote.category === category.name && <Check className="w-4 h-4 text-blue-600" />}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                              <div className="border-t border-gray-200 mt-2 pt-2">
                                <button onClick={() => { setActiveInput('newCategory'); setTempInputValue(''); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100">
                                  <Plus className="w-4 h-4" /> Create new category
                                </button>
                              </div>
                            </>
                          </div>
                        )}
                        {activeInput === 'newCategory' && (
                          <div className="absolute top-full mt-2 left-0 p-2 bg-white rounded-2xl shadow-2xl border z-50 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 px-1">New Category</h4>
                              <div className="flex items-center gap-2">
                                <input ref={tempInputRef} type="text" placeholder="Category name..." value={tempInputValue} onChange={(e) => setTempInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleInputConfirm()} className="flex-1 outline-none bg-gray-100 rounded-md px-3 py-2 text-sm" />
                                <button onClick={handleInputConfirm} className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200"><Check className="w-4 h-4" /></button>
                                <button onClick={() => { setActiveInput('category'); setTempInputValue(''); }} className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"><X className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {currentNote.labels?.map((label, index) => (
                        <span key={`label-${index}`} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-xl shadow-sm border border-purple-200">
                          <Tag className="w-3 h-3" />
                          {label}
                          <button onClick={() => removeTag('label', label)} className="text-purple-600 hover:text-purple-800 transition-colors"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                      {currentNote.people?.map((person, index) => (
                        <span key={`person-${index}`} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-xl shadow-sm border border-blue-200">
                          <Users className="w-3 h-3" />
                          {person}
                          <button onClick={() => removeTag('people', person)} className="text-blue-600 hover:text-blue-800 transition-colors"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                      {currentNote.reminder && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-orange-800 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl border border-orange-200 shadow-sm">
                          <Bell className="w-3 h-3" />
                          <span>{formatReminderDate(currentNote.reminder)}</span>
                          <button onClick={() => setCurrentNote({ ...currentNote, reminder: '' })} className="text-orange-600 hover:text-orange-800 transition-colors"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button onClick={toggleAddCheckbox} className={`p-3 rounded-xl transition-all ${showAddCheckbox ? 'text-blue-600 bg-blue-100 shadow-md' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`} title={showAddCheckbox ? "Hide checkbox input" : "Add checkboxes"}><ListTodo className="w-5 h-5" /></button>
                      {activeInput === 'label' ? (
                        <div className="relative">
                          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200"><Tag className="w-4 h-4 text-purple-600" /><input ref={tempInputRef} type="text" placeholder="Enter label name" value={tempInputValue} onChange={(e) => setTempInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleInputConfirm()} className="outline-none bg-transparent text-sm w-36" /><button onClick={handleInputConfirm} className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-50"><Check className="w-4 h-4" /></button><button onClick={() => setActiveInput(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"><X className="w-4 h-4" /></button></div>
                          {((filteredLabels?.length > 0) || showCreateNewLabel) && (<div className="absolute bottom-full mb-2 w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 z-10 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200"><ul className="p-2 space-y-1">{showCreateNewLabel && (<li onMouseEnter={() => setHighlightedIndex(0)}><button onClick={handleInputConfirm} className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-green-700 font-medium rounded-lg transition-colors duration-150 ${highlightedIndex === 0 ? 'bg-green-100' : 'hover:bg-green-100'}`}><Plus className="w-4 h-4" /> Create "{tempInputValue}"</button></li>)}{filteredLabels.length > 0 && <h5 className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Existing</h5>}{filteredLabels.map((label, index) => { const itemIndex = showCreateNewLabel ? index + 1 : index; return (<li key={label} onClick={() => handleDropdownSelect('label', label)} onMouseEnter={() => setHighlightedIndex(itemIndex)} className={`px-3 py-2 text-sm text-gray-800 font-medium rounded-lg cursor-pointer transition-colors duration-150 ${highlightedIndex === itemIndex ? 'bg-purple-100 text-purple-800' : 'hover:bg-purple-100 hover:text-purple-800'}`}>{label}</li>) })}{!showCreateNewLabel && filteredLabels.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No matches found</li>}</ul></div>)}
                        </div>
                      ) : (<button onClick={() => setActiveInput('label')} className="p-3 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-all" title="Add label"><Tag className="w-5 h-5" /></button>)}
                      {activeInput === 'people' ? (
                        <div className="relative">
                          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200"><Users className="w-4 h-4 text-blue-600" /><input ref={tempInputRef} type="text" placeholder="Enter email" value={tempInputValue} onChange={(e) => setTempInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleInputConfirm()} className="outline-none bg-transparent text-sm w-36" /><button onClick={handleInputConfirm} className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-50"><Check className="w-4 h-4" /></button><button onClick={() => setActiveInput(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"><X className="w-4 h-4" /></button></div>
                          {((filteredPeople?.length > 0) || showCreateNewPerson) && (<div className="absolute bottom-full mb-2 w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 z-10 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200"><ul className="p-2 space-y-1">{showCreateNewPerson && (<li onMouseEnter={() => setHighlightedIndex(0)}><button onClick={handleInputConfirm} className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-green-700 font-medium rounded-lg transition-colors duration-150 ${highlightedIndex === 0 ? 'bg-green-100' : 'hover:bg-green-100'}`}><Plus className="w-4 h-4" /> Add "{tempInputValue}"</button></li>)}{filteredPeople.length > 0 && <h5 className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Existing</h5>}{filteredPeople.map((person, index) => { const itemIndex = showCreateNewPerson ? index + 1 : index; return (<li key={person} onClick={() => handleDropdownSelect('people', person)} onMouseEnter={() => setHighlightedIndex(itemIndex)} className={`px-3 py-2 text-sm text-gray-800 font-medium rounded-lg cursor-pointer transition-colors duration-150 ${highlightedIndex === itemIndex ? 'bg-blue-100 text-blue-800' : 'hover:bg-blue-100 hover:text-blue-800'}`}>{person}</li>) })}{!showCreateNewPerson && filteredPeople.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No matches found</li>}</ul></div>)}
                        </div>
                      ) : (<button onClick={() => setActiveInput('people')} className="p-3 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Collaborator"><Users className="w-5 h-5" /></button>)}
                      {activeInput === 'reminder' ? (
                        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200"><Bell className="w-4 h-4 text-orange-600" /><input ref={tempInputRef} type="datetime-local" value={tempInputValue} onChange={(e) => setTempInputValue(e.target.value)} className="outline-none bg-transparent text-sm" /><button onClick={handleInputConfirm} className="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-50"><Check className="w-4 h-4" /></button><button onClick={() => setActiveInput(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"><X className="w-4 h-4" /></button></div>
                      ) : (<button onClick={() => { setActiveInput('reminder'); setTempInputValue(currentNote.reminder); }} className="p-3 rounded-xl hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-all" title="Remind me"><Bell className="w-5 h-5" /></button>)}
                      <div className="relative">{activeInput === 'background' && (<div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 p-4 bg-white rounded-2xl shadow-2xl border z-50 min-w-max"><h4 className="text-sm font-medium text-gray-700 mb-3">Background Color</h4><div className="grid grid-cols-6 gap-3">{backgroundColors.map((color) => (<button key={color.value} onClick={() => { setCurrentNote({ ...currentNote, backgroundColor: color.value }); setActiveInput(null); }} className={`w-10 h-10 rounded-xl border-2 ${color.class} transition-all hover:scale-110 hover:shadow-lg ${currentNote.backgroundColor === color.value ? 'border-gray-600 ring-2 ring-gray-300' : 'border-gray-300'}`} title={color.name} />))}</div></div>)}<button onClick={() => setActiveInput(activeInput === 'background' ? null : 'background')} className="p-3 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all" title="Background options"><Palette className="w-5 h-5" /></button></div>
                    </div>
                    <button
                      onClick={handleSaveNote}
                      className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:shadow-md ${hasContent ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200'}`}
                    >
                      {hasContent ? 'Save & Close' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="relative z-0">
          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4">
              {[...Array(10)].map((_, i) => <NoteSkeleton key={i} />)}
            </div>
          ) : sortedNotes.length > 0 ? (
            <div>
              {sortedNotes.some(note => note.isPinned) && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><Pin className="w-5 h-5 text-yellow-600" /> Pinned</h2>
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4">
                    {sortedNotes.filter(note => note.isPinned).map((note) => {
                      const bgStyle = getBackgroundStyle(note.backgroundColor);
                      const isUpdating = updatingNoteId === note._id;
                      return (
                        <div key={note._id}
                          className={`${bgStyle.class} rounded-2xl p-5 mb-4 break-inside-avoid transition-all duration-300 group backdrop-blur-sm border-2 border-yellow-400/80 ${isUpdating ? 'opacity-50 pointer-events-none animate-pulse' : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]'}`}
                          onClick={() => !isUpdating && handleEditNote(note)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            {note.title && (<h3 className={`font-semibold text-lg leading-tight flex-1 ${bgStyle.textClass}`}>{note.title}</h3>)}
                            <div className="flex items-center gap-2 ml-3">
                              <button onClick={(e) => toggleNotePin(note._id, e)} className="opacity-100 text-yellow-600 hover:text-yellow-700 transition-colors p-1 rounded-lg"><Pin className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); confirmNoteDeletion(note._id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>

                          {note.content && (<div className="mb-4"><p className={`text-sm whitespace-pre-wrap leading-relaxed ${bgStyle.textClass}`}>{note.content.length > 250 ? note.content.substring(0, 250) + '...' : note.content}</p></div>)}

                          {note.listItems?.length > 0 && (<div className="mb-4"><div className="flex items-center gap-2 mb-3"><ListTodo className="w-4 h-4 text-blue-600" /><span className="text-sm font-semibold text-gray-700">Checklist</span></div>{note.listItems.slice(0, 8).map((item) => (<div key={item._id} className={`mb-3 transition-opacity duration-300 ${item.completed ? 'opacity-50' : 'opacity-100'}`}><div className="flex items-center gap-3 mb-1"><button onClick={(e) => { e.stopPropagation(); toggleNoteListItem(note._id, item._id); }} className={`flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all flex-shrink-0 ${item.completed ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-md' : 'border-gray-400 hover:border-green-400'}`}>{item.completed && <Check className="w-3 h-3" />}</button><span className={`text-sm font-medium ${item.completed ? 'line-through text-gray-400' : bgStyle.textClass}`}>{item.text}</span></div>{item.description && (<p className={`text-xs ml-8 mt-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>{item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}</p>)}</div>))}{note.listItems.length > 8 && (<p className={`text-xs mt-3 ${bgStyle.textClass} opacity-60 font-medium`}>+{note.listItems.length - 8} more items</p>)}</div>)}

                          {((note.labels?.length > 0) || (note.people?.length > 0) || note.reminder || (note.category && note.category !== 'General')) && (<div className="flex flex-wrap gap-1 mb-4">{note.category && note.category !== 'General' && (<span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg font-medium">{React.createElement(getCategoryIcon(note.category), { className: "w-3 h-3" })}{note.category}</span>)}{note.labels?.slice(0, 3).map((label, index) => (<span key={`label-${index}`} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg font-medium">{label}</span>))}{(note.labels?.length ?? 0) > 3 && (<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">+{note.labels.length - 3}</span>)}{note.people?.slice(0, 2).map((person, index) => (<span key={`person-${index}`} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg font-medium">{person}</span>))}{(note.people?.length ?? 0) > 2 && (<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">+{note.people.length - 2}</span>)}{note.reminder && (<div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-lg"><Bell className="w-3 h-3" /><span className="font-medium">{formatReminderDate(note.reminder)}</span></div>)}</div>)}

                          <div className="flex items-center justify-between text-xs"><span className={`${bgStyle.textClass} ${getTimeAgoStyle(note.updatedAt)} opacity-80 font-medium`}>Edited {formatTimeAgo(note.updatedAt)}</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sortedNotes.some(note => !note.isPinned) && (
                <div>
                  {sortedNotes.some(note => note.isPinned) && (<h2 className="text-lg font-semibold text-gray-700 mb-4">Others</h2>)}
                  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4">
                    {sortedNotes.filter(note => !note.isPinned).map((note) => {
                      const bgStyle = getBackgroundStyle(note.backgroundColor);
                      const isUpdating = updatingNoteId === note._id;
                      return (
                        <div key={note._id}
                          className={`${bgStyle.class} rounded-2xl border-2 p-5 mb-4 break-inside-avoid transition-all duration-300 group backdrop-blur-sm ${isUpdating ? 'opacity-50 pointer-events-none animate-pulse' : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]'}`}
                          onClick={() => !isUpdating && handleEditNote(note)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            {note.title && (<h3 className={`font-semibold text-lg leading-tight flex-1 ${bgStyle.textClass}`}>{note.title}</h3>)}
                            <div className="flex items-center gap-2 ml-3">
                              <button onClick={(e) => toggleNotePin(note._id, e)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-600 transition-all p-1 rounded-lg hover:bg-yellow-50"><Pin className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); confirmNoteDeletion(note._id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>

                          {note.content && (<div className="mb-4"><p className={`text-sm whitespace-pre-wrap leading-relaxed ${bgStyle.textClass}`}>{note.content.length > 250 ? note.content.substring(0, 250) + '...' : note.content}</p></div>)}

                          {note.listItems?.length > 0 && (<div className="mb-4"><div className="flex items-center gap-2 mb-3"><ListTodo className="w-4 h-4 text-blue-600" /><span className="text-sm font-semibold text-gray-700">Checklist</span></div>{note.listItems.slice(0, 8).map((item) => (<div key={item._id} className={`mb-3 transition-opacity duration-300 ${item.completed ? 'opacity-50' : 'opacity-100'}`}><div className="flex items-center gap-3 mb-1"><button onClick={(e) => { e.stopPropagation(); toggleNoteListItem(note._id, item._id); }} className={`flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all flex-shrink-0 ${item.completed ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-md' : 'border-gray-400 hover:border-green-400'}`}>{item.completed && <Check className="w-3 h-3" />}</button><span className={`text-sm font-medium ${item.completed ? 'line-through text-gray-400' : bgStyle.textClass}`}>{item.text}</span></div>{item.description && (<p className={`text-xs ml-8 mt-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>{item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}</p>)}</div>))}{note.listItems.length > 8 && (<p className={`text-xs mt-3 ${bgStyle.textClass} opacity-60 font-medium`}>+{note.listItems.length - 8} more items</p>)}</div>)}

                          {((note.labels?.length > 0) || (note.people?.length > 0) || note.reminder || (note.category && note.category !== 'General')) && (<div className="flex flex-wrap gap-1 mb-4">{note.category && note.category !== 'General' && (<span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg font-medium">{React.createElement(getCategoryIcon(note.category), { className: "w-3 h-3" })}{note.category}</span>)}{note.labels?.slice(0, 3).map((label, index) => (<span key={`label-${index}`} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg font-medium">{label}</span>))}{(note.labels?.length ?? 0) > 3 && (<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">+{note.labels.length - 3}</span>)}{note.people?.slice(0, 2).map((person, index) => (<span key={`person-${index}`} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg font-medium">{person}</span>))}{(note.people?.length ?? 0) > 2 && (<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">+{note.people.length - 2}</span>)}{note.reminder && (<div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-lg"><Bell className="w-3 h-3" /><span className="font-medium">{formatReminderDate(note.reminder)}</span></div>)}</div>)}

                          <div className="flex items-center justify-between text-xs"><span className={`${bgStyle.textClass} ${getTimeAgoStyle(note.updatedAt)} opacity-80 font-medium`}>Edited {formatTimeAgo(note.updatedAt)}</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg">
                {isAnyFilterActive || searchQuery ? (
                  <Filter className="w-20 h-20 text-indigo-400" />
                ) : (
                  <Edit3 className="w-20 h-20 text-blue-400" />
                )}
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">{isAnyFilterActive || searchQuery ? 'No matching notes found' : 'Your notes live here'}</h3>
              <p className="text-gray-500 text-lg">{isAnyFilterActive || searchQuery ? 'Try adjusting your search or filters.' : 'Add a note to get started'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}