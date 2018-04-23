import axios from 'axios';
import * as config from '../config';
export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {
            const res = await axios(`${config.searchApiDev}?key=${config.apiKey}&q=${this.query}`);
            this.result = res.data.recipes;
        } catch (error) {
            console.log(error);
            alert('Something went wrong :\ Try again later');            
        }

    }
}