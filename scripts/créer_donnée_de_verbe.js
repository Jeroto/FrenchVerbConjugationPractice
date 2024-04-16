/**
 * @typedef { "NONE" | "Présent" | "Passé composé" | "Imparfait" | "Plus-que-parfait" | "Futur simple" | "Futur antérieur" | "Passé simple" | "Passé antérieur" | "Passé" } Tenses
 * @typedef { "Indicatif" | "Subjonctif" | "Conditionnel" | "Imperatif" } Moods
 */

function init_page() {
}

function try_create_and_copy_json() {
    //NOTE: this does not work due to the site not being secure enough, and I cannot be asked to deal wth it right now
    let built_verb_data = try_create_json()

    navigator.clipboard.writeText( stringify_json( built_verb_data ) ).then(
        () => { console.log("Async: Copying to clipboard successful!") },
        (err) => { console.error("Async: Copying to clipboard failed!", err) },
    )
}

/**
 * 
 * @returns {import("./analyseur_de_json").Verb}
 */
function try_create_json() {
    /** @type {String} */
    let input_text = document.getElementById("verbix_input").value

    input_text = format_text(input_text)

    document.getElementById("verbix_input").value = input_text
    
    /** @type {import("./analyseur_de_json").Verb} */
    let built_verb_data = { }
    built_verb_data.infinitif = null
    built_verb_data.anglais = null
    built_verb_data.standard = null
    built_verb_data.participe_présent = null
    built_verb_data.participe_passé = null
    built_verb_data.tenses = {}


    built_verb_data.infinitif = try_get_infinitive(input_text)

    built_verb_data.participe_présent = try_get_participle(input_text, "Participe présent: ")
    built_verb_data.participe_passé = try_get_participle(input_text, "Participe passé ")

    built_verb_data.standard = document.getElementById("standard").checked == true

    if( document.getElementById("anglais").value != "" )
        built_verb_data.anglais = document.getElementById("anglais").value

    let new_tense_obj = null
    new_tense_obj = create_tense_object(input_text, "Présent", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["présent_indicatif"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Passé composé", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["passé_composé_indicatif"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Imparfait", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["imparfait_indicatif"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Plus-que-parfait", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["plus_que_parfait_indicatif"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Futur simple", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["futur_simple_indicatif"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Futur antérieur", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["futur_antérieur_indicatif"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Passé simple", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["passé_simple_indicatif"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Passé antérieur", "Indicatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["passé_antérieur_indicatif"] = new_tense_obj


    new_tense_obj = create_tense_object(input_text, "Présent", "Conditionnel")
    if(new_tense_obj != null)
        built_verb_data.tenses["présent_conditionnel"] = new_tense_obj

    new_tense_obj = create_tense_object(input_text, "Passé", "Conditionnel")
    if(new_tense_obj != null)
        built_verb_data.tenses["passé_conditionnel"] = new_tense_obj


    new_tense_obj = create_tense_object(input_text, "NONE", "Imperatif")
    if(new_tense_obj != null)
        built_verb_data.tenses["imperatif"] = new_tense_obj

    output_json_obj(built_verb_data)

    return built_verb_data
}

function stringify_json(built_verb_data) {
    let json_text = JSON.stringify( built_verb_data, undefined, 1 )
    json_text = json_text.replace("\n", " ")
    return json_text
}

/**
 * 
 * @param {import("./analyseur_de_json").Verb} built_verb_data 
 */
function output_json_obj(built_verb_data) {
    document.getElementById("json_output").innerText = stringify_json( built_verb_data )
}

function format_text(input_text) {
    /** @type {String} */
    let newText = input_text

    newText = newText.replaceAll("je\t", "").replaceAll("j'", "")
    newText = newText.replaceAll("tu\t", "")
    newText = newText.replaceAll("il;elle;on\t", "")
    newText = newText.replaceAll("nous\t", "")
    newText = newText.replaceAll("vous\t", "")
    newText = newText.replaceAll("ils;elles\t", "")
    newText = newText.replaceAll("\t", " ")
    newText = newText.replaceAll("\n ", "\n")

    let first_slash_index = newText.indexOf("/")
    let next_slash_index = newText.indexOf("/", first_slash_index + 1)

    while(first_slash_index > -1 && next_slash_index > -1)
    {
        newText = newText.slice(0, first_slash_index) + newText.slice(next_slash_index + 1)

        first_slash_index = newText.indexOf("/")
        next_slash_index = newText.indexOf("/", first_slash_index + 1)
    }

    return newText
}

/**
     * Use "(TEXT)" at the start of a title to ensure we find the index of that first
 * @param {String} input_text 
 * @param {Tenses} tense_title_text 
 * @param {Moods} mood_title_text
 * @returns {Record<String, String> | null}
 */
function create_tense_object(input_text, tense_title_text, mood_title_text) {
    let mood_start_index = input_text.indexOf(mood_title_text)

    if(mood_start_index == -1)
    {
        mood_start_index = 0
        console.warn(`Could not find mood "${mood_title_text}" start index, defaulting to 0.`)
    }

    let tense_start_index = mood_start_index

    // if we have a title to search for, serach for it
    // the only case we should NOT have a title is for the Imperative mood
    if(tense_title_text != "NONE")
        tense_start_index = input_text.indexOf(tense_title_text, mood_start_index)

    if(tense_start_index == -1)
    {
        console.warn(`Could not find tense "${tense_title_text}" start index, cancelling operation.`)
        return null
    }

    let entry_count = 6
    let entry_layout = [
        {pronoun: "je", index: 0},
        {pronoun: "tu", index: 1},
        {pronoun: "il", index: 2}, {pronoun: "elle", index: 2},
        {pronoun: "nous", index: 3},
        {pronoun: "vous", index: 4},
        {pronoun: "ils", index: 5}, {pronoun: "elles", index: 5},
    ]

    if(mood_title_text == "Imperatif")
    {
        entry_count = 3
        entry_layout = [
            {pronoun: "tu", index: 0},
            {pronoun: "nous", index: 1},
            {pronoun: "vous", index: 2},
        ]
    }

    // if this verb is impersonal, we only want the third-person (il/elle) form.
    if( document.getElementById("impersonal").checked == true )
    {
        if(mood_title_text == "Imperatif")
        {
            console.log("Imperative mood cannot exist for this verb as it is impersonal.")
            return null
        }

        entry_layout = [
        {pronoun: "il", index: 2},
        {pronoun: "elle", index: 2},
        ]
    }

    let cur_index = tense_start_index
    for(let i = 0; i < entry_count + 1; ++i) {
        cur_index = input_text.indexOf("\n", cur_index + 1)
    }

    let entry_string_section = input_text.slice(tense_start_index, cur_index)

    let entry_array = entry_string_section.split("\n")
    if(entry_array[0] == tense_title_text)
        entry_array.shift() // remove the first element if it's the title
    if(entry_array[0] == mood_title_text)
        entry_array.shift() // remove the first element if it's the mood

    if(entry_array.length < entry_count)
    {
        console.warn(`Entry array not as long as expected entry count. Not adding ${tense_title_text} ${mood_title_text}.`)
        return null
    }

    let tense_obj_out = { }

    for(let i = 0; i < entry_layout.length; ++i)
    {
        tense_obj_out[ entry_layout[i].pronoun ] = entry_array[ entry_layout[i].index ].trim()
    }

    return tense_obj_out
}

/**
 * 
 * @param {String} input_text 
 * @param {String} search_text 
 */
function try_get_participle(input_text, search_text) {
    let participle_index = input_text.indexOf(search_text)

    if(participle_index == -1)
        return null // was not found

    participle_index += search_text.length


    let end_index = input_text.indexOf("\n", participle_index)

    if(end_index == -1)
        end_index = undefined // if we didn't find a newline, just go to end

    return input_text.slice(participle_index, end_index).trim()
}

/**
 * Currently almost same as try_get_participle()
 * @param {String} input_text 
 */
function try_get_infinitive(input_text) {
    const SEARCH_TEXT = "Infinitif: "
    let infinitive_index = input_text.indexOf(SEARCH_TEXT)

    if(infinitive_index == -1)
        return null // was not found

        infinitive_index += SEARCH_TEXT.length


    let end_index = input_text.indexOf("\n", infinitive_index)

    if(end_index == -1)
        end_index = undefined // if we didn't find a newline, just go to end

    return input_text.slice(infinitive_index, end_index).trim()
}