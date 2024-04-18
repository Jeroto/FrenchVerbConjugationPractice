const JSON_VERBS_PATH = "../données/verbes.json"

const MOST_COMMON_VERBS = [
"accepter", "acheter", "aller", "annuler", "apporter",
"apprendre", "avoir", "boire", "casser", "changer",
"compter", "conduire", "contenir", "couper", "croire",
"danser", "demander", "dessiner", "devenir", "devoir",
"donner", "écouter", "emmener", "être", "expliquer",
"faire","falloir", "jeter", "laver", "manger",
"mettre", "oublier", "parler", "partir",  "passer", 
"peigner", "pouvoir", "prendre", "prêter", "remplir",
"réparer", "savoir", "sortir", "terminer", "tomber",
"trouver", "venir", "voir", "voler", "vouloir",
]




/**
 * @typedef {Object} Verb
 * @property {String} infinitif
 * @property {String} anglais
 * @property {Boolean} standard
 * @property {String} participe_présent
 * @property {String} participe_passé
 * 
 * @property {Record<String, Record<String, String>>} tenses
 */

/**
 * 
 * @returns {Verb[]}
 */
export async function get_verb_json() {
    let response = await fetch(JSON_VERBS_PATH)
    
    if(!response.ok) {
        throw new Error(`Could not get JSON file! Status: ${response.status}`)
    }

    let parsed_json = await response.json()

    return parsed_json
}

/**
 * 
 * @param {Verb[]} verb_json 
 * @param {String[]} tenses 
 * @param {String[]} groups 
 * @returns {Verb[]}
 */
export function filter_verbs(verb_json, tenses = ["all"], groups = ["all"]) {

    let i
    for(i = verb_json.length - 1; i >= 0; --i) {


        // if this verb isn't in the group, remove it and go to the next
        if(!does_verb_match_group_filters(verb_json[i], groups)) {
            verb_json.splice(i, 1)
            continue
        }

        verb_json[i] = filter_verb_tenses(verb_json[i], tenses)
    }

    return verb_json
}

/**
 * 
 * @param {Verb} verb 
 * @param {String[]} groups 
 * @returns {Boolean}
 */
function does_verb_match_group_filters(verb, groups = ["all"]) {

    if (groups.includes("all"))
            return true // no need to check all groups if all are included

    for(let g = 0; g < groups.length; ++g)
    {
        // if we filter to only most common of the groups, if this verb isn't in there, we immediately ignore it
        if( groups.includes("most_common (filter)") && !MOST_COMMON_VERBS.includes(verb.infinitif) )
        {
            return false
        }

        switch(groups[g]) {
            case "most_common (additive)":
                if( MOST_COMMON_VERBS.includes(verb.infinitif) )
                    return true
                break

            case "er_all":
                if( verb.infinitif.endsWith("er") ) 
                    return true
                break
            case "er_standard":
                if( verb.infinitif.endsWith("er") && verb.standard ) 
                    return true
                break
            case "er_non_standard":
                if( verb.infinitif.endsWith("er") && !verb.standard ) 
                    return true
                break

            case "ir_all":
                if( verb.infinitif.endsWith("ir") ) 
                    return true
                break
            case "ir_standard":
                if( verb.infinitif.endsWith("ir") && verb.standard ) 
                    return true
                break
            case "ir_non_standard":
                if( verb.infinitif.endsWith("ir") && !verb.standard ) 
                    return true
                break

            case "re_all":
                if( verb.infinitif.endsWith("re") ) 
                    return true
                break
            case "re_standard":
                if( verb.infinitif.endsWith("re") && verb.standard ) 
                    return true
                break
            case "re_non_standard":
                if( verb.infinitif.endsWith("re") && !verb.standard ) 
                    return true
                break
        }
    }

    // didn't match any filters
    return false
}

/**
 * 
 * @param {Verb} verb 
 * @param {String[]} tenses 
 * @returns {Verb}
 */
function filter_verb_tenses(verb, tenses = ["all"]) {

    if (tenses.includes("all"))
            return verb // no need to check all tenses if all are included

    /** @type {Record<string, string>} */
    let rebuilt_tenses = {
    }

    for(let t = 0; t < tenses.length; ++t)
    {
        switch(tenses[t]) {
            case "présent_indicatif":
                rebuilt_tenses["présent_indicatif"] = verb.temps["présent_indicatif"]
                break
            case "passé_composé_indicatif":
                rebuilt_tenses["passé_composé_indicatif"] = verb.temps["passé_composé_indicatif"]
                break
            case "imparfait_indicatif":
                rebuilt_tenses["imparfait_indicatif"] = verb.temps["imparfait_indicatif"]
                break
            case "plus_que_parfait_indicatif":
                rebuilt_tenses["plus_que_parfait_indicatif"] = verb.temps["plus_que_parfait_indicatif"]
                break
            case "futur_simple_indicatif":
                rebuilt_tenses["futur_simple_indicatif"] = verb.temps["futur_simple_indicatif"]
                break
            case "futur_antérieur_indicatif":
                rebuilt_tenses["futur_antérieur_indicatif"] = verb.temps["futur_antérieur_indicatif"]
                break
            case "passé_simple_indicatif":
                rebuilt_tenses["passé_simple_indicatif"] = verb.temps["passé_simple_indicatif"]
                break
            case "passé_antérieur_indicatif":
                rebuilt_tenses["passé_antérieur_indicatif"] = verb.temps["passé_antérieur_indicatif"]
                break

            case "présent_conditionnel":
                rebuilt_tenses["présent_conditionnel"] = verb.temps["présent_conditionnel"]
                break
            case "passé_conditionnel":
                rebuilt_tenses["passé_conditionnel"] = verb.temps["passé_conditionnel"]
                break

            case "imperatif":
                rebuilt_tenses["imperatif"] = verb.temps["imperatif"]
                break
        }
    }

    verb.temps = rebuilt_tenses

    return verb
}

