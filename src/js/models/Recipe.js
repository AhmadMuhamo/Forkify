import axios from 'axios';
import * as config from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`${config.recipeApiDev}?key=${config.apiKey}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.image = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            console.log(error);
            alert('Something went wrong :\ try again later');
        }
    }

    calcTime() {
        /**
         * Assuming that we need 15 minutes for each 3 ingredients
         */
        const noOfIngredients = this.ingredients.length;
        const periods = Math.ceil(noOfIngredients / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const longUnits = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const shortUnits = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];

        const units = [...shortUnits, 'kg', 'gm']
        const newIngredients = this.ingredients.map( ing => {
            /** Uniform units */
            let ingredient = ing.toLowerCase();
            longUnits.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, shortUnits[i]);
            });

            /** Remove parentheses */
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            /** Parse ingredients into count, unit and ingredient */
            const ingArr = ingredient.split(' ');
            const unitIndex = ingArr.findIndex( el => units.includes(el));

            let ingObj;
            if (unitIndex > -1) {
                const arrCount = ingArr.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(ingArr[0].replace('-','+'));
                } else {
                    count = eval(ingArr.slice(0, unitIndex).join('+'));
                }
                ingObj = {
                    count,
                    unit: ingArr[unitIndex],
                    ingredient: ingArr.slice(unitIndex + 1).join(' ')
                }
            } else if (parseInt(ingArr[0], 10)) {
                /** if there's no unit, but first element is a number */
                ingObj = {
                    count: parseInt(ingArr[0], 10),
                    unit: '',
                    ingredient: ingArr.slice(1).join(' ')
                }
            } else {
                ingObj = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return ingObj;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        /** Servings */
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        /** Ingredients */
        this.ingredients.forEach( ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}