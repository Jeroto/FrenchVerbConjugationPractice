import * as JsonParser from "./analyseur_de_json.js"
import * as QuestionAndResponse from "./question_et_réponse.js"
import * as Constants from "./constants.js"

const CONJUGATION_PAGE = "./sélection_de_conjugaison.html"



/** @type {import("./analyseur_de_json.js").Verb[]} */
let loaded_json = null

/** @type {String[]} */
let selected_verb_groups = []
/** @type {String[]} */
let selected_verb_tenses = []

/** @type {import("./question_et_réponse.js").Question} */
let cur_question = null

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

function clear_input_box() {
    document.getElementById("answer_input").value = ""
}

function update_ui() {
    document.getElementById("word_display").innerHTML = cur_question.question_string
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
    if(cur_question == null)
        return // no question, nothing to do

    /** @type {String} */
    let current_answer = document.getElementById("answer_input").value

    let is_correct = QuestionAndResponse.check_answer_correct(current_answer, cur_question.correct_answer)
    let cur_answer_no_pronoun = QuestionAndResponse.remove_pronouns(current_answer)

    previous_answer = cur_answer_no_pronoun
    previous_answer_correct = is_correct

    if(is_correct)
        prev_answer_response = `Correct! The ${cur_question.tense.replaceAll("_", " ")} of ${cur_question.question_word_string} is <i>${cur_question.correct_answer}<\i>!`
    else
        prev_answer_response = `Incorrect, the ${cur_question.tense.replaceAll("_", " ")} of ${cur_question.question_word_string} is <i>${cur_question.correct_answer}<\i>. You answered: ${previous_answer}.`
}

function get_next_question() {
    cur_question = QuestionAndResponse.get_next_question(loaded_json, selected_verb_tenses)

    update_ui()
}