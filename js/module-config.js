/**
 * BloomLead Module Registry
 * -------------------------
 * Single source of truth for the six webinar modules. Every place that needs
 * module metadata (order email body, order subject line, webhook module_type)
 * reads from here instead of hard-coding Module 1.
 *
 * How pages use it:
 *   1. Load this file BEFORE js/email-handler.js.
 *   2. Declare which module the page represents:  window.BLOOMLEAD_ACTIVE_MODULE = 2;
 *   The email handler then resolves the active module via getBloomLeadModule().
 *
 * Adding a new module (3–6) later:
 *   - Flip its `released` flag to true and fill in the real `date`.
 *   - Create the module page and set window.BLOOMLEAD_ACTIVE_MODULE to its number.
 * Nothing else needs to change — the email flow is fully data-driven.
 *
 * `date`      : display string in Finnish format (d.m.yyyy), or null when the
 *               release date is not decided yet.
 * `released`  : true = orderable now. false = upcoming, shown but not orderable.
 * `typeLabel` : exact value sent to the lead webhook as `module_type`.
 */
(function () {
    'use strict';

    // Shared pricing — identical across every single module.
    var PRICE_INDIVIDUAL = '125 € sis.alv';
    var PRICE_COMPANY = '125 € + alv';

    window.BLOOMLEAD_MODULES = {
        1: {
            number: 1,
            title: 'Projektin taustoitus ja määrittely & Johtaja luo suunnan',
            date: '6.2.2026',
            released: true,
            priceIndividual: PRICE_INDIVIDUAL,
            priceCompany: PRICE_COMPANY,
            typeLabel: 'Module 1 - Projektin taustoitus ja määrittely & Johtaja luo suunnan'
        },
        2: {
            number: 2,
            title: 'Projektin suunnittelu & Johtaja rakentaa perustan',
            date: '7.7.2026',
            released: true,
            priceIndividual: PRICE_INDIVIDUAL,
            priceCompany: PRICE_COMPANY,
            typeLabel: 'Module 2 - Projektin suunnittelu & Johtaja rakentaa perustan'
        },
        // Modules 3–6 are upcoming. Dates and orderability are intentionally not
        // set yet ("not now"); fill `date` and flip `released` to true on launch.
        3: {
            number: 3,
            title: 'Projektin toteutus & Johtaja ohjaa arkea',
            date: null,
            released: false,
            priceIndividual: PRICE_INDIVIDUAL,
            priceCompany: PRICE_COMPANY,
            typeLabel: 'Module 3 - Projektin toteutus & Johtaja ohjaa arkea'
        },
        4: {
            number: 4,
            title: 'Projektin GO LIVE, seuranta & Johtaja kannattelee muutoksessa',
            date: null,
            released: false,
            priceIndividual: PRICE_INDIVIDUAL,
            priceCompany: PRICE_COMPANY,
            typeLabel: 'Module 4 - Projektin GO LIVE, seuranta & Johtaja kannattelee muutoksessa'
        },
        5: {
            number: 5,
            title: 'Projektin kehitysvaiheen päättäminen, siirto eteenpäin & Johtaja päättää viisaasti',
            date: null,
            released: false,
            priceIndividual: PRICE_INDIVIDUAL,
            priceCompany: PRICE_COMPANY,
            typeLabel: 'Module 5 - Projektin kehitysvaiheen päättäminen, siirto eteenpäin & Johtaja päättää viisaasti'
        },
        6: {
            number: 6,
            title: 'Projektin hyötyjen (ROI) validointi, seuranta ja jatkuva kehittäminen & Johtaja kasvaa jatkuvasti',
            date: null,
            released: false,
            priceIndividual: PRICE_INDIVIDUAL,
            priceCompany: PRICE_COMPANY,
            typeLabel: 'Module 6 - Projektin hyötyjen (ROI) validointi, seuranta ja jatkuva kehittäminen & Johtaja kasvaa jatkuvasti'
        }
    };

    /**
     * Resolve the module the current page represents.
     * Precedence:
     *   1. window.BLOOMLEAD_ACTIVE_MODULE (module number set by the page)
     *   2. window.BLOOMLEAD_MODULE_DATA   (legacy inline object — backward compat)
     *   3. Module 1 (safe default)
     */
    window.getBloomLeadModule = function () {
        var modules = window.BLOOMLEAD_MODULES || {};
        var active = window.BLOOMLEAD_ACTIVE_MODULE;

        if (active && modules[active]) {
            return modules[active];
        }
        if (window.BLOOMLEAD_MODULE_DATA) {
            return window.BLOOMLEAD_MODULE_DATA;
        }
        return modules[1] || null;
    };
})();
