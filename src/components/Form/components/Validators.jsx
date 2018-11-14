// Config
import config from '../../../config'

// Form validation functions
export const validators = {
    // Validate email format
    validEmailFormat: (value) => (value !== '' && /.+@.+\..+/.test(value)),

    // Valdiate the field is not empty or false
    required: (value) => (value !== '' && value !== false),

    // Validate the password is acceptably strong
    strongPassword: (value) => {
        const {passwordMinLength} = config
        var strong = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^\\w\\d\\s])(?=.{${passwordMinLength},})|((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))(?=.{16,})|(?=.{32,})`);
        var medium = new RegExp(`^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{${passwordMinLength},})|(?=.{16,})`);

        if (strong.test(value)) {
            return 2
        } else if (medium.test(value)) {
            return 1
        } else {
            return 0
        }
    },

    minLength: (value, {minLength}) => {
        return (value && value.length >= minLength)
    },

    number: (value) => (/^\d+$/.test(value))
}

// Default validator function
// This utility function plugs into a component and can be called using the components
// this scope by importing the validate function and using like so:
//  validate.call(this)
export function validate() {
    // If no validators were specified, there is no validation - return
    if (!this.props.validators) return true

    // Don't validate if the component hasn't been touched by the user yet
    if (!this.state.touched) return false

    let errors = []
    let isValidValue = true

    Object.keys(this.props.validators).map((validator) => {
        let message, options
        if (this.props.validators[validator].message !== undefined) {
            let {
                message: Message,
                ...Options
            } = this.props.validators[validator]
            message = Message
            options = Options
        } else {
            message = this.props.validators[validator]
            options = {}
        }
        isValidValue = validators[validator](this.state.value, options)
        if (!isValidValue) {
            errors.push(message)
            isValidValue = false
        }
    })

    // Set calling component state
    this.setState({
        isValid: isValidValue,
        errors: [...errors]
    }, () => {
        // If caller defines a setClasses method, call it
        if (this.setClasses) {
            this.setClasses()
        }
    })

    return isValidValue
}
