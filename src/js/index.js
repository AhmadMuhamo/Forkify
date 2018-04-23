import Search from './models/Search';
import {elements, viewLoader, removeLoader} from './views/base';
import * as searchView from './views/search_view';
import * as recipeView from './views/recipe_view';
import Recipe from './models/Recipe';

console.log('App Started!');

/** Global state of the app
 * - Search Object
 * - Current recipe Object
 * - Shopping list Object
 * - Liked recipes
 */
const state = {};

/**
 * Search Controller
 */
const searchControl = async() => {
    /** Get query from the view */
    const query = searchView.getInput();

    if (query) {
        /** Create new search Object and add it to global state */
        state.search = new Search(query);

        /** Prepare UI for results */
        searchView.clearInput();
        searchView.clearResults();
        viewLoader(elements.searchResults);

        try {
            /** Search for the recipes */
            await state.search.getResults();
    
            /** Display results on the UI */
            removeLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            console.log(error);
            alert('Something wrong with the search...');
            removeLoader();
        }
    }
};

elements.searchFrom.addEventListener('submit', e => {
    e.preventDefault();
    searchControl();
});

elements.searchResultPages.addEventListener('click', e => {
    const btn = e.target.closest('button');

    if (btn) {
        const page = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();        
        searchView.renderResults(state.search.result, page);        
    }
});

/**
 * Recipe Controller
 */
const recipeControl = async () => {
    /** Get Recipe ID from the URL */
    const id = parseInt(window.location.hash.replace('#',''),10);

    if (id) {
        /** Prepare UI for changes */
        recipeView.clearRecipe();
        viewLoader(elements.recipe);

        /** Highlight selected search item */
        if (state.search) searchView.highlightSelected(id);

        /** Create new Recipe Object */
        state.recipe = new Recipe(id);

        try {
            /** Get Recipe data and parde ingredients*/
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
    
            /** Calculate Time and Servings */
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            /** Render Recipe */
            removeLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (error) {
            console.log(error);
            alert('Error processing Recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, recipeControl));

/** Handling Recipe button clicks */
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsUI(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');        
        recipeView.updateServingsUI(state.recipe);        
    }
    console.log(state.recipe);
});