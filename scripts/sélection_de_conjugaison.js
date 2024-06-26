import * as Constants from "./constants.js"

const PRACTICE_CONJUGATION_PAGE = "pratique_de_conjugaison.html"

const ENABLED_MARK = "✔"
const DISABLED_MARK = "✕"

let verb_tenses = []
let verb_groups = []


// this will be run when the script is loaded
add_functions_to_page()

function add_functions_to_page() {
    window.init_page = init_page
    window.go_to_conjugation_practice = go_to_conjugation_practice

    window.remove_all_tenses = remove_all_tenses
    window.remove_all_groups = remove_all_groups

    window.include_all_tenses = include_all_tenses
    window.include_all_groups = include_all_groups

    window.toggle_tense = toggle_tense
    window.toggle_group = toggle_group
}

function init_page() {
    try_reload_prev_params()
    update_buttons()
}

function try_reload_prev_params() {

    const searchParams = new URLSearchParams(window.location.search);

    let prev_verb_tenses = []
    let prev_verb_groups = []
    
    if(searchParams.has("temps"))
        prev_verb_tenses = searchParams.get("temps").split(",")

    if(prev_verb_tenses.length > 0)
        verb_tenses = prev_verb_tenses
    else
        include_all_tenses() // if we don't have any previous, include them all by default

    if(searchParams.has("groupes"))
        prev_verb_groups = searchParams.get("groupes").split(",")

    if(prev_verb_groups.length > 0)
        verb_groups = prev_verb_groups
    else
        include_all_groups() // if we don't have any previous, include them all by default
}

function go_to_conjugation_practice() {
    let searchParams = new URLSearchParams("")
    searchParams.set("temps", verb_tenses.join(","))
    searchParams.set("groupes", verb_groups.join(","))

    window.location.href = `${PRACTICE_CONJUGATION_PAGE}?${searchParams.toString()}`
}

function remove_all_tenses() { 
    verb_tenses = []
    update_buttons()
}
function remove_all_groups() { 
    verb_groups = []
    update_buttons()
}

function include_all_tenses() { 
    verb_tenses = Constants.ALL_VERB_TENSES.slice()
    update_buttons()
}
function include_all_groups() { 
    verb_groups = Constants.ALL_VERB_GROUPS.slice()
    // we want to include all groups, except additives and filters, since they will either add nothing or limit some
    verb_groups.splice( verb_groups.indexOf("most_common (additive)"), 1 )
    verb_groups.splice( verb_groups.indexOf("most_common (filter)"), 1 )
    verb_groups.splice( verb_groups.indexOf("etre_and_avoir (additive)"), 1 )
    update_buttons()
}

function toggle_tense(tense) {
    if( verb_tenses.includes(tense) )
        verb_tenses = verb_tenses.filter( value => value != tense )
    else
        verb_tenses.push(tense)
    update_buttons()
}

function toggle_group(group) {
    if( verb_groups.includes(group) )
        verb_groups = verb_groups.filter( value => value != group )
    else
        verb_groups.push(group)
    update_buttons()
}

function are_all_tenses_enabled() {
    for(let i = 0; i < Constants.ALL_VERB_TENSES.length; ++i)
    {
        if( !verb_tenses.includes(Constants.ALL_VERB_TENSES[i]) )
            return false
    }
    return true
}
function are_all_tenses_disabled() {
    return verb_tenses.length <= 0
}

function are_all_groups_enabled() {
    for(let i = 0; i < Constants.ALL_VERB_GROUPS.length; ++i)
    {
        switch( Constants.ALL_VERB_GROUPS[i] ) {
            case "most_common (additive)":
            case "most_common (filter)":
            case "etre_and_avoir (additive)":
                continue
        }

        if( !verb_groups.includes(Constants.ALL_VERB_GROUPS[i]) )
            return false
    }
    return true
}
function are_all_groups_disabled() {
    return verb_groups.length <= 0
}

function set_button_display(element_id = "", button_text = "", enabled = false) {
    /** @type {HTMLElement} */
    let buttonElement = document.getElementById(element_id)

    buttonElement.innerHTML = `${button_text} ${ enabled ? ENABLED_MARK : DISABLED_MARK }`
    if(enabled)
    {
        buttonElement.classList.add("enabled_button")
        buttonElement.classList.remove("disabled_button")
    }
    else
    {
        buttonElement.classList.add("disabled_button")
        buttonElement.classList.remove("enabled_button")
    }
}

function update_buttons() {
    set_button_display("tous_temps", "Tous", are_all_tenses_enabled())
    set_button_display("aucun_temps", "Aucun", are_all_tenses_disabled())

    set_button_display("présent_indicatif", "Présent Indicatif", verb_tenses.includes("présent_indicatif"))
    set_button_display("passé_composé_indicatif", "Passé Composé Indicatif", verb_tenses.includes("passé_composé_indicatif"))
    set_button_display("imparfait_indicatif", "Imparfait Indicatif", verb_tenses.includes("imparfait_indicatif"))
    set_button_display("plus_que_parfait_indicatif", "Plus que Parfait Indicatif", verb_tenses.includes("plus_que_parfait_indicatif"))
    set_button_display("futur_simple_indicatif", "Futur Simple Indicatif", verb_tenses.includes("futur_simple_indicatif"))
    set_button_display("futur_antérieur_indicatif", "Futur Antérieur Indicatif", verb_tenses.includes("futur_antérieur_indicatif"))
    set_button_display("passé_simple_indicatif", "Passé Simple Indicatif", verb_tenses.includes("passé_simple_indicatif"))
    set_button_display("passé_antérieur_indicatif", "Passé Antérieur Indicatif", verb_tenses.includes("passé_antérieur_indicatif"))

    set_button_display("présent_conditionnel", "Présent Conditionnel", verb_tenses.includes("présent_conditionnel"))
    set_button_display("passé_conditionnel", "Passé Conditionnel", verb_tenses.includes("passé_conditionnel"))
    set_button_display("imperatif", "Imperatif", verb_tenses.includes("imperatif"))

    set_button_display("participe_présent", "Participe Présent", verb_tenses.includes("participe_présent"))
    set_button_display("participe_passé", "Participe Passé", verb_tenses.includes("participe_passé"))



    set_button_display("tous_groupes", "Tous", are_all_groups_enabled())
    set_button_display("aucun_groupes", "Aucun", are_all_groups_disabled())

    set_button_display("er_standard", "'er' Standards", verb_groups.includes("er_standard"))
    set_button_display("ir_standard", "'ir' Standards", verb_groups.includes("ir_standard"))
    set_button_display("er_non_standard", "'er' Non Standards", verb_groups.includes("er_non_standard"))
    set_button_display("ir_non_standard", "'ir' Non Standards", verb_groups.includes("ir_non_standard"))
    set_button_display("re_non_standard", "'re' Non Standards", verb_groups.includes("re_non_standard"))

    set_button_display("most_common (additive)", "Les plus Courants (Additif)", verb_groups.includes("most_common (additive)"))
    set_button_display("most_common (filter)", "Les plus Courants (Filtre)", verb_groups.includes("most_common (filter)"))
    set_button_display("etre_and_avoir (additive)", "Être et Avoir (Additif)", verb_groups.includes("etre_and_avoir (additive)"))
}