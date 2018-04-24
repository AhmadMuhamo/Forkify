import Search from './models/Search';
import Recipe from './models/Recipe';
import Like from './models/Likes';
import ShoppingList from './models/ShoppingList';
import {elements, viewLoader, removeLoader} from './views/base';
import * as searchView from './views/search_view';
import * as recipeView from './views/recipe_view';
import * as shoppingListView from './views/shopping_list_view';
import * as likesView from './views/likes_view';
import Likes from './models/Likes';

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
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch (error) {
            console.log(error);
            alert('Error processing Recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, recipeControl));

/** 
 * Shopping List Controller
 */
const shoppingListController = () => {
    /** Create a new shopping list if there is none yet */
    if (!state.shoppingList) state.shoppingList = new ShoppingList();

    /** Add each ingredient to the list and UI*/
    state.recipe.ingredients.forEach( ing => {
        const item = state.shoppingList.addItem(ing.count, ing.unit, ing.ingredient);
        shoppingListView.renderItem(item);
    });
};

/** Handling add and delete shopping list item events */
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    /** Handle the delete */
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.shoppingList.deleteItem(id);
        shoppingListView.deleteItem(id);
    } else if (e.target.matches('.shopping_count-value')) {
        const val = parseFloat(e.target.value);
        state.shoppingList.updateCount(id, val);
    }
});

/**
 * Likes Controller
 */
const likesController = () => {
    if (!state.likes) state.likes = new Likes;
    const recipeID = state.recipe.id;

    if (!state.likes.isLiked(recipeID)) {
        /** Add like to the state Object */
        const newLike = state.likes.addLike(recipeID, state.recipe.title, state.recipe.author, state.recipe.image);

        /** Toggle the like button */
        likesView.toggleLikeBtn(true);

        /** Add like to the UI list */
        likesView.renderLike(newLike);

    } else {
        /** Remove like from the state Object */
        state.likes.deleteLike(recipeID);

        /** Toggle the like button */
        likesView.toggleLikeBtn(false);

        /** Remove like from the UI list */
        likesView.deleteLike(recipeID);
        
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

window.addEventListener('load', () => {
    state.likes = new Likes;

    /** Restore likes from localStorage */
    state.likes.readStorage();

    /** Toggle like menu button */
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    /** Render the existing likes */
    state.likes.likes.forEach(like => likesView.renderLike(like));
})

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
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        shoppingListController();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        likesController();
    }
});