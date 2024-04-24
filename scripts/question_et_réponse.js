import * as Constants from "./constants.js"

/**
 * @typedef {Object} Question
 * @property {String} verb
 * @property {String} tense
 * @property {String} person
 * @property {String} correct_answer
 * @property {String} question_word_string
 * @property {String} question_string
 */

/**
 * 
 * @param {import("./analyseur_de_json").Verb[]} loaded_json 
 * @param {String[]} selected_verb_tenses 
 * @returns {Question}
 */
export function get_next_question(loaded_json, selected_verb_tenses) {
    
    /** @type {import("./analyseur_de_json").Verb} */
    let question_verb = get_rand_from_array(loaded_json)
    /** @type {String} */
    let question_tense = undefined
    /** @type {String} */
    let question_person = undefined
    /** @type {String} */
    let correct_answer = undefined
    /** @type {String} */
    let question_word_string = undefined
    /** @type {String} */
    let question_string = undefined

    // make sure we have a valid tense for this verb
    do 
    {
        if( selected_verb_tenses.includes("all") )
            question_tense = get_rand_from_array(Constants.ALL_VERB_TENSES)
        else
            question_tense = get_rand_from_array(selected_verb_tenses)

        if(question_tense.includes("participe"))
        {
            if(question_verb[question_tense] == null)
            {
                question_tense = "error"
                continue // if this specific participle doesn't exist on the verb, we get a new tense
            }
        }
    }
    while ( question_verb.temps[question_tense] == null && !question_tense.includes("participe") )


    if(question_tense == "participe_présent")
    {
        correct_answer = question_verb.participe_présent
        question_word_string = `"<b>${question_verb.infinitif}</b>"`
    }
    else if(question_tense == "participe_passé")
    {
        correct_answer = question_verb.participe_passé
        question_word_string = `"<b>${question_verb.infinitif}</b>"`
    }
    else 
    {
        let tense_person_keys = Object.keys(question_verb.temps[question_tense])
        question_person = get_rand_from_array( tense_person_keys )

        correct_answer = question_verb.temps[question_tense][question_person]

        question_word_string= `<b>${question_person}</b> "<b>${question_verb.infinitif}</b>"`
    }

    if(correct_answer == null)
        console.log("correct answer is null")

    question_string = `Enter the <u>${ question_tense.replaceAll("_", " ") }</u> for ${question_word_string} (${question_verb.anglais})`

    /** @type {Question} */
    let question_obj = {
        verb: question_verb,
        tense: question_tense,
        correct_answer: correct_answer,
        question_word_string: question_word_string,
        question_string: question_string,
        person: question_person
    }

    return question_obj
}

/**
 * 
 * @param {String} current_answer 
 * @param {String} correct_answer 
 * @returns {Boolean}
 */
export function check_answer_correct(current_answer, correct_answer) {
    let is_correct = false

    // if there are multiple forms which are correct, they are split by /
    /** @type {String[]} */
    let correct_answer_forms = correct_answer.split("/")

    // all the possible correct answers are stored in here, with letters in parenthesis being optional
    /** @type {String[]} */
    let all_correct_answers = []

    for(let i = 0; i < correct_answer_forms.length; ++i) {
        if( correct_answer_forms[i].endsWith("(e)(s)") ) {
            all_correct_answers.push( correct_answer_forms[i].replace("(e)(s)", "") )
            all_correct_answers.push( correct_answer_forms[i].replace("(e)(s)", "e") )
            all_correct_answers.push( correct_answer_forms[i].replace("(e)(s)", "s") )
            all_correct_answers.push( correct_answer_forms[i].replace("(e)(s)", "es") )
        }
        else if( correct_answer_forms[i].includes("(e)") ) {
            all_correct_answers.push( correct_answer_forms[i].replace("(e)", "") )
            all_correct_answers.push( correct_answer_forms[i].replace("(e)", "e") )
        }
        else if( correct_answer_forms[i].endsWith("(s)") ) {
            all_correct_answers.push( correct_answer_forms[i].replace("(s)", "") )
            all_correct_answers.push( correct_answer_forms[i].replace("(s)", "s") )
        }
        else
            all_correct_answers.push( correct_answer_forms[i] )
    }

    // now check all correct answers against the user input
    let simplified_cur_answer = simplify_string( remove_pronouns(current_answer) )

    for(let i = 0; i < all_correct_answers.length; ++i) {
        //console.log(`Comparing ${simplified_cur_answer} to ${simplify_string( all_correct_answers[i] )}`)
        if( simplified_cur_answer == simplify_string( all_correct_answers[i] ) )
        {
            is_correct = true
            break
        }
    }

    return is_correct
}

export function remove_pronouns(text)
{
    let no_pronouns = text

    for(let i = 0; i < Constants.PRONOUNS.length; ++i)
    {
        // remove a possible pronoun from the start of the answer
        if( text.toLowerCase().startsWith(Constants.PRONOUNS[i]) ) {
            no_pronouns = no_pronouns.slice(Constants.PRONOUNS[i].length)
            break
        }
    }

    return no_pronouns
}

/**
 * Simplifies a text string by making it fully lowercase, removing spaces and other punctuation marks, and removing all accents from letters. 
 * 
 * This is really handy for cleaning up strings to make sure they're as simple to search with as possible. 
 * @param {String} text - The string to modify.
 * @returns {String} A simplified version of the text.
 */
export function simplify_string(text)
{
    let modified = String(text)

    modified = modified.toLowerCase()
    modified = remove_strings(modified, [" ", "_", "-", ",", ".", "(", ")"])
    modified = remove_accents(modified)
    return modified
}
/**
 * Removes several strings of text from a main string.
 * @param {String} text - The string to modify.
 * @param {String[]} toRemove - An array of strings to remove from the provided text. 
 * @returns {String} The modified text.
 */
export function remove_strings(text, toRemove)
{
    for(let i = 0; i < toRemove.length; ++i)
        text = text.replaceAll(toRemove[i], "")
    return text
}
/**
 * Removes any accents/diacritical marks from a text string. This is to simplify it for things such as searching and command running. 
 * @param {String} text - The string to modify.
 * @returns {String} A modified text without diacritical marks on Latin script characters.
 */
export function remove_accents(text)
{
    // This regex hell should in theory remove all accents.
    // This seems to not break `Abugida` scripts like Korean, Thai, Devanagari, and similar that use diacriticals to build their characters.
    let modified = text.normalize("NFD").replace(/[\u0300-\u036f]/g, '')
    modified = modified.normalize() // make sure it's in an okay format after this
    return modified
}

function get_rand_from_array(array) {
    return array[ Math.floor(Math.random() * array.length) ]
}