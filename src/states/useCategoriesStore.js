import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useCategoriesStore = create(
  devtools(
    (set) => ({
      categories: [],
      isLoading: false,
      error: null,
      selectedCategory: null,

      setCategories: (categories) => set({ categories }),
      
      addCategory: (newCategory) => 
        set((state) => ({
          categories: Array.isArray(state.categories) 
            ? [newCategory, ...state.categories]
            : [newCategory]
        })),
      
      updateCategory: (updatedCategory) =>
        set((state) => ({
          categories: state.categories.map((category) =>
            category._id === updatedCategory._id ? updatedCategory : category
          ),
          selectedCategory: updatedCategory._id === state.selectedCategory?._id 
            ? updatedCategory 
            : state.selectedCategory
        })),
      
      deleteCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.filter((category) => category._id !== categoryId),
          selectedCategory: state.selectedCategory?._id === categoryId 
            ? null 
            : state.selectedCategory
        })),
      
      setSelectedCategory: (category) => 
        set({ selectedCategory: category }),
      
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setError: (error) => 
        set({ error }),
    }),
    {
      name: 'categories-store'
    }
  )
);

export default useCategoriesStore; 