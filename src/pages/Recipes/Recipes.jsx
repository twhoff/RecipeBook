import React, { Component } from 'react';
import PropTypes from 'prop-types'

// Localisation
import { strings } from './resources'
import { string } from '../../utils/Utils'

// Context
import { AppContext } from '../App'

// Components
import RecipeCard from './components/RecipeCard'

// Styles
import css from './styles/Recipes.scss'

class RecipesWrapper extends Component {
    constructor(props) {
        super(props)

        this.setFavourites = this.setFavourites.bind(this)

        this.state = {
            favourites: this.props.favourites
        }

    }

    componentWillReceiveProps(nextProps) {
        if (this.props != nextProps) {
            this.setState({
                favourites: nextProps.favourites
            })
        }
    }

    setFavourites(favourites) {
        this.setState({ favourites })
    }

    render() {
        const {
            recipes
        } = this.props
        return (
            <div className="Recipes cont c-c s-hf">
                <h1 className="headline t-c">{string(strings, 'RECIPES_HEADLINE')}</h1>
                <p className="subHeadline t-c">{string(strings, 'RECIPES_SUB_HEADLINE')}</p>
                {!recipes.length && <div className="loadingRecipes t-c">{string(strings, 'RECIPES_LOADING_LABEL')}</div>}
                <div className="g recipeGrid">
                    {(recipes) && recipes.map(
                        (recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} favourites={this.state.favourites} setFavourites={this.setFavourites} />
                        ))}
                </div>
            </div>
        );
    }
}

RecipesWrapper.propTypes = {
    recipes: PropTypes.array.isRequired,
    favourites: PropTypes.array.isRequired
}

const Recipes = props => (
    <AppContext.Consumer>
        {({ user, recipes }) => {
            return (<RecipesWrapper
                recipes={recipes}
                favourites={(user.favourites) ? user.favourites : []}
                {...props}
            />
            )
        }}
    </AppContext.Consumer>
)

export default Recipes;