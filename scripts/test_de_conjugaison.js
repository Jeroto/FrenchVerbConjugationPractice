import * as JsonParser from "./analyseur_de_json.js"
import * as QuestionAndResponse from "./question_et_réponse.js"
import * as Constants from "./constants.js"

const CONJUGATION_PAGE = "./conjugaison.html"

const MIN_QUESTIONS = 1

/** @type {import("./analyseur_de_json.js").Verb[]} */
let loaded_json = null

/** @type {import("./question_et_réponse.js").Question} */
let cur_question = null

let correct_responses = []
let incorrect_responses = []

let maximum_possible_questions = 100
let question_limit = 100


// this will be run when the script is loaded
add_functions_to_page()

async function init_page() {
    loaded_json = await JsonParser.get_verb_json()
    maximum_possible_questions = count_max_possible_questions()

    document.getElementById("answer_input").addEventListener("keydown", try_submit_answer)

    document.getElementById("test_setup_max_questions").addEventListener("input", limit_question_count)
    
    document.getElementById("test_setup_max_questions").min = MIN_QUESTIONS
    document.getElementById("test_setup_max_questions").max = maximum_possible_questions

    limit_question_count()
}

function count_max_possible_questions() {
    let verb_count = loaded_json.length
    let cur_verb = null
    let i = 0, t = 0, p = 0
    let total = 0
    let tense_keys = null
    let person_keys = null
    
    for(i = 0; i < verb_count; ++i)
    {
        cur_verb = loaded_json[i]
        if(cur_verb.participe_présent != null)
            total++
        if(cur_verb.participe_passé != null)
            total++

        tense_keys = Object.keys( cur_verb.temps )
        for(t = 0; t < tense_keys.length; ++t)
        {
            person_keys = Object.keys( cur_verb.temps[tense_keys[t]] )

            for(p = 0; p < person_keys.length; ++p)
            {
                total++
            }
        }
    }

    return total
}

async function parse_and_filter_json() {

    loaded_json = await JsonParser.get_verb_json()

    // no filters for testing currently
    
    return loaded_json
}

function add_functions_to_page() {
    window.init_page = init_page
    window.start_test = start_test
    window.finish_test = finish_test
}

function clear_input_box() {
    document.getElementById("answer_input").value = ""
}

function update_ui() {
    document.getElementById("word_display").innerHTML = cur_question.question_string
    
    clear_input_box()
}

function limit_question_count(input_event) {
    let question_count_box = document.getElementById("test_setup_max_questions")
    
    if(question_count_box.value < MIN_QUESTIONS)
        question_count_box.value = MIN_QUESTIONS
    else if(question_count_box.value > maximum_possible_questions)
        question_count_box.value = maximum_possible_questions

    question_limit = question_count_box.value
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

    if(is_correct)
        correct_responses.push( `${cur_question.tense.replaceAll("_", " ")} of ${cur_question.question_word_string} is <i>${cur_question.correct_answer}<\i>.` )
    else
        incorrect_responses.push( `${cur_question.tense.replaceAll("_", " ")} of ${cur_question.question_word_string} is <i>${cur_question.correct_answer}<\i>. You answered: ${cur_answer_no_pronoun}.` )


    if ( loaded_json.length == 0 || (correct_responses.length + incorrect_responses.length) >= question_limit )
    {
        finish_test()
        return
    }
}

function get_next_question() {
    if(loaded_json.length == 0 )
    {
        cur_question = null
        return // no possible question, nothing to do
    }

    cur_question = QuestionAndResponse.get_next_question(loaded_json, ["all"])

    /** @type {import("./analyseur_de_json.js").Verb} */
    let cur_verb = cur_question.verb
    
    // remove the particple, or specific person from a tense
    if(cur_question.tense == "participe_présent")
    {
        cur_verb.participe_présent = null
    }
    else if(cur_question.tense == "participe_passé") 
    {
        cur_verb.participe_passé = null
    }
    else
    {
        delete cur_verb.temps[ cur_question.tense ][ cur_question.person ]

        if( Object.keys( cur_verb.temps[ cur_question.tense ] ).length == 0 )
        {
            delete cur_verb.temps[ cur_question.tense ]
        }
    }

    // if all these are true, we have asked every question for the verb
    if( cur_verb.participe_présent == null && cur_verb.participe_passé == null && Object.keys(cur_verb.temps).length == 0 )
    {
        let verb_index = loaded_json.indexOf(cur_verb)
        loaded_json.splice(verb_index)
    }

    update_ui()
}

function finish_test() {
    loaded_json = [] // force empty to end test
    cur_question = null

    document.getElementById("word_display").innerHTML = "Test is finished!"

    let total_questions = correct_responses.length + incorrect_responses.length

    if(total_questions > 0)
    {
        let percentage = (correct_responses.length / total_questions) * 100

        document.getElementById("percentage_score").innerHTML = `Le Résultat: ${percentage.toFixed(2)}% (${correct_responses.length} / ${total_questions})`
    
        if(percentage > 50)
            document.getElementById("percentage_score").className = "correct_answer"
        else
            document.getElementById("percentage_score").className = "incorrect_answer"

        document.getElementById("correct_responses_display").innerHTML = "Bonnes Réponses:<br><br>" + correct_responses.join("<br>")
        document.getElementById("incorrect_responses_display").innerHTML = "Incorrectes Réponses:<br><br>" + incorrect_responses.join("<br>")
    }

    hide_test_ui()
    reveal_test_setup_ui()
}

async function start_test() {
    await parse_and_filter_json()
    get_next_question()

    hide_test_setup_ui()
    reveal_test_ui()

    correct_responses = []
    incorrect_responses = []

    document.getElementById("correct_responses_display").innerHTML = ""
    document.getElementById("incorrect_responses_display").innerHTML = ""
    document.getElementById("percentage_score").innerHTML = ""
}

function reveal_test_ui() {
    document.getElementById("main_test_controls").classList.remove("hidden")
    document.getElementById("finish_test_button").classList.remove("hidden")
}
function hide_test_ui() {
    document.getElementById("main_test_controls").classList.add("hidden")
    document.getElementById("finish_test_button").classList.add("hidden")
}

function reveal_test_setup_ui() {
    document.getElementById("test_setup_controls").classList.remove("hidden")
}
function hide_test_setup_ui() {
    document.getElementById("test_setup_controls").classList.add("hidden")
}