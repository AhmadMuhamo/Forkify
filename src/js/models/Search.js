import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        const apiKey = '3beec7bb88fc6188295a798927278c06';
        const apiDev = 'https://cors-anywhere.herokuapp.com/http://food2fork.com/api/search';
        const apiURL = 'http://food2fork.com/api/search';

        try {
            const res = await axios(`${apiDev}?key=${apiKey}&q=${this.query}`);
            this.result = res.data.recipes;
        } catch (error) {
            console.log(error);
        }

    }
}