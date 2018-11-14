import globalStrings from '../strings/strings.json'
import localStrings from './strings/strings.json'
import formStrings from '../../components/Form/strings/strings.json'

const strings = {...globalStrings,...localStrings, ...formStrings}

export {
    strings
}