import * as JsonParser from "./analyseur_de_json.js"

const CONJUGATION_PAGE = "./conjugaison.html"

const PRONOUNS = [
    "je" , "j'",
    "tu ",
    "il ", "elle ",
    "nous ",
    "vous ",
    "ils ", "elles "
]

/** @type {import("./analyseur_de_json.js").Verb[]} */
let loaded_json = null

/** @type {String[]} */
let selected_verb_groups = []
/** @type {String[]} */
let selected_verb_tenses = []

/** @type {import("./analyseur_de_json.js").Verb} */
let question_verb = null
/** @type {String} */
let question_tense = "NONE"
/** @type {String} */
let correct_answer = "NONE"
/** @type {String} */
let question_word_string = "NONE"
/** @type {Strng} */
let question_string = "No word to display."


/** @type {Strng} */
let previous_answer = null
/** @type {String} */
let prev_answer_response = ""
/** @type {Boolean} */
let previous_answer_correct = true


// this will be run when the script is loaded
add_functions_to_page()

async function init_page() {
    document.getElementById("answer_input").addEventListener("keydown", try_submit_answer)

    await parse_and_filter_json()
    get_next_question()
}

function go_back_to_conjugation_page() {
    window.location.href = `${CONJUGATION_PAGE}${window.location.search}`
}

async function parse_and_filter_json() {

    loaded_json = await JsonParser.get_verb_json()

    const searchParams = new URLSearchParams(window.location.search);

    selected_verb_tenses = searchParams.get("temps").split(",")
    selected_verb_groups = searchParams.get("groupes").split(",")

    //JsonParser.debug_print_verb_counts(loaded_json)

    loaded_json = JsonParser.filter_verbs(loaded_json, selected_verb_tenses, selected_verb_groups)
    return loaded_json
}

function add_functions_to_page() {
    window.init_page = init_page
    window.go_back_to_conjugation_page = go_back_to_conjugation_page
}

function get_rand_from_array(array) {
    return array[ Math.floor(Math.random() * array.length) ]
}

function get_next_question() {
    question_verb = get_rand_from_array(loaded_json)

    // make sure we have a valid tense for this verb
    do 
    {
        question_tense = get_rand_from_array(selected_verb_tenses)
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
        let person_key = get_rand_from_array( tense_person_keys )

        correct_answer = question_verb.temps[question_tense][person_key]

        question_word_string= `<b>${person_key}</b> "<b>${question_verb.infinitif}</b>"`
    }

    question_string = `Enter the <u>${ question_tense.replaceAll("_", " ") }</u> for ${question_word_string} (${question_verb.anglais})`

    update_ui()
}

function clear_input_box() {
    document.getElementById("answer_input").value = ""
}

function update_ui() {
    document.getElementById("word_display").innerHTML = question_string
    document.getElementById("answer_response_display").innerHTML = prev_answer_response
    document.getElementById("answer_response_display").className = previous_answer_correct ? "correct_answer" : "incorrect_answer"
    clear_input_box()
}
    

function try_submit_answer(key_event) {
    if(key_event.key != "Enter")
        return

    if(document.getElementById("answer_input").value == "")
        return // if the field is empty, don't consider it an answer

    check_answer_correct()

    get_next_question()
}

function check_answer_correct() {
    /** @type {String} */
    let current_answer = document.getElementById("answer_input").value
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
    let cur_answer_no_pronoun = current_answer

    for(let i = 0; i < PRONOUNS.length; ++i)
    {
        // remove a possible pronoun from the start of the answer
        if( current_answer.toLowerCase().startsWith(PRONOUNS[i]) ) {
            cur_answer_no_pronoun = cur_answer_no_pronoun.slice(PRONOUNS[i].length)
            break
        }
    }

    let simplified_cur_answer = simplify_string(cur_answer_no_pronoun)

    for(let i = 0; i < all_correct_answers.length; ++i) {
        //console.log(`Comparing ${simplified_cur_answer} to ${simplify_string( all_correct_answers[i] )}`)
        if( simplified_cur_answer == simplify_string( all_correct_answers[i] ) )
        {
            is_correct = true
            break
        }
    }

    previous_answer = cur_answer_no_pronoun
    previous_answer_correct = is_correct

    if(is_correct)
        prev_answer_response = `Correct! The ${question_tense.replaceAll("_", " ")} of ${question_word_string} is <i>${correct_answer}<\i>!`
    else
        prev_answer_response = `Incorrect, the ${question_tense.replaceAll("_", " ")} of ${question_word_string} is <i>${correct_answer}<\i>. You answered: ${previous_answer}.`
}

/**
 * Simplifies a text string by making it fully lowercase, removing spaces and other punctuation marks, and removing all accents from letters. 
 * 
 * This is really handy for cleaning up strings to make sure they're as simple to search with as possible. 
 * @param {String} text - The string to modify.
 * @returns {String} A simplified version of the text.
 */
function simplify_string(text)
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
function remove_strings(text, toRemove)
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
function remove_accents(text)
{
    // This regex hell should in theory remove all accents.
    // This seems to not break `Abugida` scripts like Korean, Thai, Devanagari, and similar that use diacriticals to build their characters.
    let modified = text.normalize("NFD").replace(/[\u0300-\u036f]/g, '')
    modified = modified.normalize() // make sure it's in an okay format after this
    return modified
}