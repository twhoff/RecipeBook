import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Config
import config from '../../../config'

// Resources
import { images } from '../resources'

// Components
import { Card } from '../../../components'

// Images
const {
    Favourite
} = images

class RecipeCard extends Component {
    constructor(props) {
        super(props)

        this.toggleFavourite = this.toggleFavourite.bind(this)

        this.state = {
            favourite: props.favourites.includes(props.recipe.id)
        }

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.favourites != null && 
            nextProps.favourites.includes(this.props.recipe.id)) {
            this.setState({ favourite: true })
        }
    }

    toggleFavourite(e) {
        e.preventDefault()

        const {
            recipe
        } = this.props

        // Optimistically mark recipe as favourite
        this.setState({ favourite: !this.state.favourite })
        
        // Save to the server
        fetch(`${config.apiUrl}/togglefavourite`, {
            method: 'POST',
            body: JSON.stringify({
                id: recipe.id,
            }),
            credentials: 'include'
        }).then((response) => {
            return response.json()
        }).then((data) => {
            if (data.status) {
                this.props.setFavourites(data.user.favourites)
            }
        }).catch((error) => console.log(error))
    }

    render() {
        const {
            recipe
        } = this.props

        const favouriteClasses = ['favouriteIcon', (this.state.favourite) ? 'selected' : '']
        const calories = (typeof recipe.nutrition !== 'undefined')
            ? recipe.nutrition.filter((item) => item.type === "57b42a48b7e8697d4b305304")[0]
            : 'N/A'

        return (
            <div className="c c-1-2-m c-1-4-l">
                <Card className="primaryCard recipeCard">
                    <a href={recipe.cardLink}>
                        <div className="imageContainer">
                            {/* 0,0 in image link represents width,height = default - too big for thumbs
                                replace and set widths to 2x container width for hdpi
                             */}
                            <img className="recipeImage" src={recipe.imageLink.replace('0,0', '540,0')} alt={recipe.name} />
                            <Favourite onClick={this.toggleFavourite} className={favouriteClasses.join(' ')} />
                        </div>
                        <div className="g recipeCardGrid">
                            <h4 className="c heading">{recipe.name}</h4>
                            <div className="c subHeading">{recipe.headline}</div>
                            
                            <div className="c footer">
                            <div className="g d">
                                <div className="c-auto">{calories.amount} {calories.unit}</div>
                                {(recipe.averageRating > 0) && <div className="c-auto">{recipe.averageRating} / 5</div>}
                            </div>
                            </div>
                        </div>
                        
                    </a>
                </Card>
            </div>
        );
    }
}

RecipeCard.propTypes = {
    setFavourites: PropTypes.func.isRequired,
    favourites: PropTypes.array.isRequired,
    recipe: PropTypes.object.isRequired
}

export default RecipeCard;