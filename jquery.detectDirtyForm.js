/*!
 @pluginName Detect Dirty Form
 @type jQuery Plugin
 @version v1.0.0
 @author Daniel Pons Betrián
 @github github.com/danielsif227/jquery.detectDirtyForm
 */

//ToDo --: Pass parameter with id of submit button of form; by default id='Guardar'.
//ToDo --: Pass parameter to force submit button always active.
//ToDo --: Activate submit button when deleting or adding new rows in a dynamic table inside the form (event DOM MODIFIED).
//ToDo --: Pass parameter with the alert text to supoort internationalization.

// Simple way to hash a string: http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
var getHashCode = function (str) {
    var hash = 0, i, chr, len;
    if (str.length === 0)
        return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

/*
 * Activate or deactivate the submit button of the form depending on the dirty state of form
 * @param {type} theForm The form to be detected as dirty
 * @returns {undefined}
 */
function toggleDirty(theForm) {

    //Ensure the text area of tinyMCE components store the edited content in the WYSIWIG editor
    tinyMCE.triggerSave();

    //Debug Log
    //console.log('TOGGLE DIRTY: ' + getHashCode($(theForm).serialize()));

    //Enable submit button if there are changes in the form
    if ($(theForm).data('serialize') !== getHashCode($(theForm).serialize())) {
        $(theForm).find("input[id='Guardar']").prop('disabled', false);
        $(theForm).find("input[id='Guardar']").removeClass('deshabilitado');
    }
    //Disable submit button if there are no changes in the form
    else {
        $(theForm).find("input[id='Guardar']").prop('disabled', true);
        $(theForm).find("input[id='Guardar']").addClass('deshabilitado');
    }

}

(function ($, window, document, undefined) {

    //Function to enable submit button. This is useful in case submit button must be enabled even if the form is not modified
    $.fn.enableSubmitButton = function () {
        $(this).find("input[id='Guardar']").prop('disabled', false);
        $(this).find("input[id='Guardar']").removeClass('deshabilitado');
    }

    //Enable dirty form detection
    $.fn.detectDirtyForm = function () {

        //Public methods
        this.initialize = function () {

            //Store initial state of the form
            $(this).data('serialize', getHashCode($(this).serialize()));

            //Debug Log
            //console.log('INI: ' + $(this).data('serialize'));

            //Disable submit button
            $(this).find("input[id='Guardar']").prop('disabled', true);
            $(this).find("input[id='Guardar']").addClass('deshabilitado');

            //Store that there is no clic on Save Button
            $(this).data('clicOnSave', 0);

            return this;
        };

        //Store if submit button have been clicked
        this.on("click", "input[id='Guardar']", function (event) {

            //Get the form that is being submitted
            var theForm = $(this).closest('form');

            //Store 1 to flag the click
            $(theForm).data('clicOnSave', 1);
        });

        //If the modified form differs from its initial state, submit button will be enabled
        //If the modified form is the same as its initial state, submit button will be disabled again
        this.on('change keyup keydown', 'input, textarea, select', function (event) {

            //Get the form that is being modified
            var theForm = $(this).closest('form');

            //Enable or Disable submit button
            toggleDirty(theForm);
        });

        //Enable submit button when clicking on items with setDirtyForm class
        this.on("click", ".setDirtyForm", function (event) {

            //Get the form that is being modified
            var theForm = $(this).closest('form');

            //Enable submit button
            $(theForm).find("input[id='Guardar']").prop('disabled', false);
            $(theForm).find("input[id='Guardar']").removeClass('deshabilitado');
        });

        //Event when leaving the page
        $(window).on('beforeunload', function (event) {

            //At the begining, it is supposed that there ara no differences
            var differs = false;

            //Ensure the text area of tinyMCE components store the edited content in the WYSIWIG editor
            tinyMCE.triggerSave();

            //For each form in the web page
            $('form').each(function () {
                //Only check if the form is dirty in case the serialized value has been stored
                if ($(this).data('serialize') !== null) {
                    //Do not check dirty form in case of click on submit button
                    if ($(this).data('clicOnSave') === 0) {
                        //Alert before exit in case there are changes
                        if ($(this).data('serialize') !== getHashCode($(this).serialize())) {
                            //There are changes in the form
                            differs = true;
                            //Stop iterating
                            return false;
                        }
                    }
                }
            });
            //If there are changes, show alert
            if (differs) {
                return 'Hay cambios sin guardar! Estás seguro que deseas salir?';
            }
        });

        return this.initialize();
    }

}(jQuery, window, document));