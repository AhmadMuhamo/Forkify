/** Search URL = http://food2fork.com/api/search
    key: 3beec7bb88fc6188295a798927278c06
    q: (optional) Search Query (Ingredients should be separated by commas). If this is omitted top rated recipes will be returned.
    sort: (optional) How the results should be sorted. See Below for details.
    page: (optional) Used to get additional results
    Get Recipe URL = http://food2fork.com/api/get
    key: API Key
    rId: Id of desired recipe as returned by Search Query */
console.log('App Started!');

import Search from './models/Search';
import {elements, viewLoader, removeLoader} from './views/base';
import * as searchView from './views/search_view';

/** Global state of the app
 * - Search Object
 * - Current recipe Object
 * - Shopping list Object
 * - Liked recipes
 */
const state = {};

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

        /** Search for the recipes */
        await state.search.getResults();

        /** Display results on the UI */
        removeLoader();
        searchView.renderResults(state.search.result);
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