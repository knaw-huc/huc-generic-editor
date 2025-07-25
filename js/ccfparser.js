var objectDisplay = true;
var objectLevel = 1;
var validationProfiles = {};
var inputOK = true;
var isUploading = false;
var cloneBuffer;
var panelError;
var recordEdit = false;
var datePickerFormat = "yy-mm-dd";
var yearRange = '1900:2040'
var ccfTrackedFunctions = [];


function validateTracker() {
    if (ccfTrackedFunctions.length > 0) {
        for (var key in ccfTrackedFunctions) {
            ccfTrackedFunctions[key]();
        }
    }
}

var formBuilder = {
    profileID: null,
    recordFile: null,
    start: function (obj) {
        this.profileID = obj.id;
        this.parse(obj.content, obj.ID, false);
        this.createButtons();
        createAutoCompletes();
        if (obj.record !== undefined) {
            fillValues(obj.record);
            $(".tempOptionalCompBtn").click().removeClass('tempOptionalCompBtn');
        }
    },
    parse: function (o, componentID, isOptional) {
        if (o.hasOwnProperty('type')) {
            switch (o.type) {
                case 'Element':
                    this.handleElement(o, componentID, isOptional);
                    break;
                case 'Component':
                    var parentIsOptional = this.handleComponent(o, componentID, isOptional);
                    this.parse(o.content, o.ID, parentIsOptional);
                    objectDisplay = true;
                    break;
                default:
                    Alert('Error: property type not defined');
                    break;
            }
        } else {
            for (var key in o) {
                var type = typeof o[key];
                if (type === 'object') {
                    this.parse(o[key], componentID, isOptional);
                }
            }
        }
    },
    handleElement: function (element, componentID, parentIsOptional) {
        html = document.createElement('div');
        if (!parentIsOptional) {
            html.setAttribute('class', 'element');
        } else {
            html.setAttribute('class', 'disabledElement');
        }
        html.setAttribute('data-name', element.attributes.name);
        html.setAttribute('data-order', element.attributes.initialOrder);
        label = document.createElement('div');
        label.setAttribute('class', 'label');
        if (element.attributes.CardinalityMin > 0) {
            label.innerHTML = element.attributes.label + ' *';
        } else {
            label.innerHTML = element.attributes.label;
        }
        if (element.attributes.ValueScheme === 'date') {
            label.innerHTML = label.innerHTML + ' (' + ccfOptions.alert.date_string + ')';
        }
        input = document.createElement('div');
        input.setAttribute('class', 'control');
        control = this.createControl(element);
        input.appendChild(control);
        if (element.attributes.Multilingual === 'true') {
            var dropdown = document.createElement('select');
            dropdown.setAttribute('class', 'language_dd');
            dropdown.setAttribute('id', 'lang_' + element.ID);
            var option = document.createElement('option');
            option.setAttribute('value', 'none');
            option.innerHTML = '--';
            dropdown.appendChild(option);
            for (var key in this.languages) {
                var option = document.createElement('option');
                option.setAttribute('value', this.languages[key]);
                option.innerHTML = this.languages[key];
                dropdown.appendChild(option);
            }
            $(dropdown).val(this.def_language);
            input.appendChild(dropdown);
        }
        if (element.attributes.autoCompleteURI !== undefined) {
            var uri = document.createElement('input');
            uri.setAttribute('class', 'uri_dd');
            uri.setAttribute('id', 'uri_' + element.ID);
            $(uri).val('none');
            input.appendChild(uri);
        }
        if (element.attributes.attributeList !== undefined) {
            for (var key in element.attributes.attributeList) {
                switch (element.attributes.attributeList[key].ValueScheme) {
                    case 'string':
                        var attr_field = document.createElement('input');
                        attr_field.setAttribute('type', 'text');
                        attr_field.setAttribute('id', 'attr_' + element.attributes.attributeList[key].name + '_' + element.ID);
                        attr_field.setAttribute('data-attribute_name', element.attributes.attributeList[key].name)
                        attr_field.setAttribute('placeholder', element.attributes.attributeList[key].name);
                        attr_field.setAttribute("class", "element_attribute");
                        if ((element.attributes.readonly !== undefined && element.attributes.readonly === "yes")) {
                            attr_field.setAttribute('readonly', true);
                        }
                        //if ((element.attributes.once !== undefined && element.attributes.once === "yes")) {
                            //MENZO:  on change, when !='' make it readonly
                        //    attr_field.setAttribute('readonly', true);
                        //}
                }
                input.appendChild(attr_field);
            }
        }
        if (element.attributes.duplicate !== undefined) {
            var btn = document.createElement('input');
            btn.setAttribute('type', 'button');
            btn.setAttribute('value', '+');
            btn.setAttribute('title', 'Add element');
            btn.setAttribute('class', 'btn');
            btn.setAttribute('data-source', element.ID);
            $(btn).on("click", function () {
                cloneElement(btn)
            });
            input.appendChild(btn);
        }
        html.appendChild(label);
        // Add explanation
        if (element.attributes.explanation !== undefined) {
            explanation = document.createElement('div');
            explanation.innerHTML = element.attributes.explanation;
            explanation.setAttribute("class", "formExplanation");
            html.appendChild(explanation);
        }
        var Msg = document.createElement('div');
        Msg.setAttribute("id", "errorMsg_" + element.ID);
        Msg.setAttribute('class', 'errorMsg');
        input.appendChild(Msg);
        html.appendChild(input);
        if (element.attributes.hide === 'yes') {
            $(html).addClass("blocked_element");
        }
        $("#" + componentID).append(html);
        validationProfiles[element.ID] = element;
        if (element.attributes.ValueScheme === 'date') {
            $("#" + element.ID).datepicker({
                changeMonth: true,
                changeYear: true,
                yearRange: yearRange,
                dateFormat: datePickerFormat
            });
        }
    },
    handleComponent: function (component, componentID, parentIsOptional) {
        var optionalParent = false;
        html = document.createElement('div');
        //if (objectDisplay || (Number(component.level) <= Number(objectLevel))) {
        if (!parentIsOptional) {
            html.setAttribute('class', 'component');
        } else {
            html.setAttribute('class', 'disabledComponent');
        }
        html.setAttribute('id', component.ID);
        html.setAttribute('data-name', component.attributes.name);
        html.setAttribute('data-order', component.attributes.initialOrder);
        header = document.createElement('div');
        header.setAttribute('class', 'componentHeader');
        $(header).addClass('compLevel' + component.level);
        //header.innerHTML = component.attributes.label;

        if (Number(component.level) > 1) {
            var span = document.createElement("span");
            span.innerHTML = "▼ ";
            span.setAttribute("title", "Hide block content")
            span.setAttribute("class", "collapser");
            $(span).on("click", thisShowHideComponent);
            header.appendChild(span);
        }
        var span = document.createElement("span");
        span.innerHTML = component.attributes.label;
        header.appendChild(span);


        if (component.attributes.CardinalityMin === '0') {
            var btn = document.createElement('input');
            btn.setAttribute('type', 'button');
            btn.setAttribute('value', "✓");
            btn.setAttribute('title', 'Enable block');
            btn.setAttribute('class', 'optionalCompBtn');
            $(btn).on("click", showComponentFields);
            header.appendChild(btn);
            if (objectDisplay) {
                objectDisplay = false;
                objectLevel = component.level;
            }
            optionalParent = true;
        } else {
            objectDisplay = true;
            optionalParent = false;
        }


        if (component.attributes.CardinalityMax !== '1') {
            //header.innerHTML = component.attributes.label;
            var btn = document.createElement('input');
            btn.setAttribute('type', 'button');
            btn.setAttribute('value', '+');
            btn.setAttribute('title', 'Add block');
            btn.setAttribute('class', 'compBtn');
            btn.setAttribute('data-source', component.ID);
            if (component.attributes.resource !== undefined || component.attributes.CardinalityMin === '0') {
                $(btn).hide();
            }
            btn.onclick = cloneComponent;

            header.appendChild(btn);
        }
        if (component.attributes.resource !== undefined) {
            var form = document.createElement('form');
            form.setAttribute("method", "post");
            form.setAttribute("class", "fileForm");
            var fileSelector = document.createElement('input');
            fileSelector.setAttribute('type', 'file');
            fileSelector.setAttribute('id', 'files_' + component.ID);
            fileSelector.setAttribute("class", "uploader");
            checkResourceFilter(fileSelector, component.attributes.resource);
            if (component.attributes.CardinalityMin === '0') {
                $(fileSelector).hide();
            }
            fileSelector.onchange = function () {
                addUploadTrigger(this);
            };
            form.appendChild(fileSelector);
            var resetUpload = document.createElement('input');
            resetUpload.setAttribute("type", "reset");
            resetUpload.setAttribute("target", component.ID);
            resetUpload.setAttribute("value", "x");
            resetUpload.setAttribute("class", "resetUploadBtn");
            resetUpload.onclick = function () {
                var target = $(this).attr("target");
                $("#files_" + target).show();
                $("#" + target).find(".headerMsg").remove();
                $("#" + target).removeAttr("data-filename");
                $(this).hide();
            }
            $(resetUpload).hide();
            form.appendChild(resetUpload);
            header.appendChild(form);
        }
        html.appendChild(header);
        if (componentID === undefined) {
            $("#ccform").append(html);
        } else {
            $("#" + componentID).append(html);
        }
        return optionalParent;
    },
    createControl: function (element) {
        var type = typeof element.attributes.ValueScheme;
        if (type === "object") {
            control = this.setValueSchemeElement(element.attributes.ValueScheme[0], element.ID);
            if (element.attributes !== undefined && element.attributes.readonly !== undefined && element.attributes.readonly === "yes") {
                control.setAttribute("disabled", true);
            }
        } else {
            switch (element.attributes.ValueScheme) {
                case 'boolean':
                    var control = document.createElement('select');
                    control.setAttribute('id', element.ID);
                    control.setAttribute('data-reset-value', '');
                    var option = document.createElement('option');
                    option.setAttribute("value", '');
                    option.innerHTML = '--';
                    control.appendChild(option);
                    var option = document.createElement('option');
                    option.setAttribute("value", "true");
                    option.innerHTML = 'Ja';
                    control.appendChild(option);
                    var option = document.createElement('option');
                    option.setAttribute("value", "false");
                    option.innerHTML = 'Nee';
                    control.appendChild(option);
                    break;
                case 'string':
                case 'anyURI':
                case 'decimal':
                    var control = this.createTextInputField(element);
                    break;
                default:
                    var control = document.createElement('input');
                    control.setAttribute('id', element.ID);
                    control.setAttribute('type', 'text');
                    control.setAttribute('data-reset-value', 'line');
                    if (element.attributes.autoValue === undefined) {
                        control.setAttribute('value', "");
                    } else {
                        control.setAttribute('value', element.attributes.autoValue);
                    }

            }
        }
        if (element.attributes.class !== undefined) {
            control.setAttribute('data-class', element.attributes.class);
        }
        control.setAttribute('data-validation-profile', element.ID);
        //control.setAttribute('data-order', element.attributes.initialOrder);
        $(control).addClass("input_element");
        return control;
    },
    setValueSchemeElement: function (element, id) {
        var control = document.createElement('select');
        control.setAttribute('id', id);
        var option = document.createElement('option');
        option.setAttribute("value", '');
        option.innerHTML = '--';
        control.appendChild(option);
        for (var key in element) {
            var option = document.createElement('option');
            option.setAttribute("value", element[key].value);
            if (element[key].label === undefined) {
                option.innerHTML = element[key].value;
            } else {
                option.innerHTML = element[key].label;
            }

            control.appendChild(option);
        }

        return control;
    },
    createTextInputField: function (element) {
        if (element.attributes.inputField === undefined) {
            var type = '';
        } else {
            var type = element.attributes.inputField;
        }
        switch (type) {
            case 'multiple':
                var control = document.createElement('textarea');
                control.setAttribute('rows', this.setInputFieldHeigth(element.attributes.heigth));
                control.setAttribute('cols', this.setInputFieldWidth(element.attributes.width));
                control.setAttribute('data-reset-value', 'area');
                control.setAttribute('id', element.ID);
                break;
            case 'single':
            case 'anyURI':
            default:
                var control = document.createElement('input');
                control.setAttribute('type', 'text');
                control.setAttribute('size', this.setInputFieldWidth(element.attributes.width));
                control.setAttribute('data-reset-value', 'line');
                if (element.attributes.autoValue === undefined) {
                    control.setAttribute('value', "");
                } else {
                    control.setAttribute('value', element.attributes.autoValue);
                }
                control.setAttribute('id', element.ID);
                if (element.attributes.autoCompleteURI !== undefined) {
                    control.setAttribute("data-auto", "yes");
                    control.setAttribute("data-uri", element.attributes.autoCompleteURI);
                }
                break;
        }
        if (element.attributes !== undefined && element.attributes.readonly !== undefined && element.attributes.readonly === "yes") {
            control.setAttribute("readonly", true);
        }


        return control;
    },
    setInputFieldWidth: function (value) {
        if (value === undefined) {
            return 50;
        } else {
            return value;
        }
    },
    setInputFieldHeigth: function (value) {
        if (value === undefined) {
            return 8;
        } else {
            return value;
        }
    },
    createResourcePanel: function () {
        var resourceFrame = document.createElement('div');
        resourceFrame.setAttribute('id', 'resourceFrame');
        resourceFrame.setAttribute('class', 'component');
        header = document.createElement('div');
        header.setAttribute('class', 'componentHeader');
        header.innerHTML = 'Bestanden';
        var btn = document.createElement('input');
        btn.setAttribute('type', 'button');
        btn.setAttribute('value', '+');
        btn.setAttribute('class', 'compBtn');
        btn.setAttribute('id', 'resourceBtn');
        btn.onclick = function (e) {
            var that = $(this);
            e.preventDefault();
            var list = that.parent().parent();
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('class', 'filename');
            input.setAttribute("id", "resList");
            input.setAttribute('multiple', "");
            list.append(input);
        };
        header.appendChild(btn);
        resourceFrame.appendChild(header);
        $("#ccform").append(resourceFrame);
    },
    createButtons: function () {
        var buttonFrame = document.createElement('div');
        buttonFrame.setAttribute('id', 'btnFrame');

        var control = document.createElement('input');
        control.setAttribute('type', 'button');
        control.setAttribute('value', ccfOptions.submitButton.label);
        control.setAttribute('id', 'OKbtn');
        if (ccfOptions.submitButton.actionURI === ccfOptions.saveButton.actionURI) {
            control.onclick = function () {
                validate();
            };
        } else {
            control.onclick = function () {
                window.location.assign(ccfOptions.submitButton.actionURI);
            };

        }

        buttonFrame.appendChild(control);

        var control = document.createElement('input');
        control.setAttribute('type', 'button');
        control.setAttribute('value', ccfOptions.saveButton.label);
        control.setAttribute('id', 'saveBtn');
        control.onclick = function () {
            sendForm();
        };
        buttonFrame.appendChild(control);

        if (ccfOptions.resetButton !== null && ccfOptions.resetButton !== undefined) {
            var control = document.createElement('input');
            control.setAttribute('type', 'button');
            control.setAttribute('value', ccfOptions.resetButton.label);
            control.setAttribute('id', 'resetBtn');
            control.onclick = function () {
                window.location.assign(ccfOptions.resetButton.actionURI);
            };
            buttonFrame.appendChild(control);
        }

        var viewSpace = document.createElement('div');
        $(viewSpace).addClass("viewSpace");
        var action = document.createElement('span');
        $(action).addClass("expandAction");
        $(action).html("Collapse all");
        action.onclick = function () {
            collapseAll();
        }
        viewSpace.appendChild(action);
        var action = document.createElement('span');
        $(action).addClass("expandAction");
        $(action).html("Expand all");
        action.onclick = function () {
            expandAll();
        }
        viewSpace.appendChild(action);
        buttonFrame.appendChild(viewSpace);
        var errorSpace = document.createElement('div');
        errorSpace.setAttribute("id", "errorSpace");
        buttonFrame.appendChild(errorSpace);
        $("#ccform").append(buttonFrame);
    },
    languages: ['aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az', 'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs', 'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'dv', 'dz', 'ee', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy', 'ga', 'gd', 'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky', 'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv', 'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps', 'pt', 'qu', 'rm', 'rn', 'ro', 'ru', 'rw', 'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zh', 'zu'],
    //languages: ['ara', 'eng', 'fra', 'fry', 'gla', 'deu', 'grc', 'heb', 'isl', 'gle', 'ita', 'lat', 'yid', 'gml', 'mis', 'nld', 'oci', 'pro', 'spa', 'und'],
    controlHash: [],
    def_language: 'en'
};

var clone = {
    clonePostfix: 0,
    nextClonePostfix: function () {
        this.clonePostfix++;
        return this.clonePostfix;
    }
};

//TODO Use this id's instead of the clone object id's after cloning
function create_local_id() {
    const randomness = Math.random().toString(36).substr(2);
    const dateString = Date.now().toString(36);
    return dateString + '-' + randomness;
};

function cloneElement(obj) {
    var next = clone.nextClonePostfix();
    var that = $(obj);
    var tempID;
    clonedElement = that.parent().clone();
    clonedElement.attr('class', 'clone');
    clonedElement.find(".btn").each(
        function () {
            $(this).attr('value', '-');
            $(this).attr('title', 'Remove element');
            $(this).on("click", function (e) {
                e.preventDefault();
                var that = $(this);
                that.parent().remove();
            });
        });
    clonedElement.find("#" + that.attr('data-source')).each(
        function () {
            var id = $(this).attr('id');
            $(this).val("");
            tempID = id + '_' + next;
            $(this).attr('id', tempID);
        });
    clonedElement.find(".input_element").each(
        function () {
            $(this).attr("id", $(this).attr("data-validation-profile") + "_" + next);
            $(this).val("");
        });
    clonedElement.find(".errorMsg").each(
        function () {
            var id = $(this).attr('id');
            $(this).attr('id', "errorMsg_" + $(this).parent().children(':nth-child(1)').attr("data-validation-profile") + '_' + next);
            $(this).html("");
            // console.log("MENZO@ce["+$(this).attr('id')+"]");
        });
    clonedElement.find(".language_dd").each(
        function () {
            $(this).attr('id', 'lang_' + $(this).parent().children(':nth-child(1)').attr("data-validation-profile") + '_' + next);
            $(this).val(formBuilder.def_language);
        });
    clonedElement.find(".uri_dd").each(
        function () {
            $(this).attr('id', 'uri_' + $(this).parent().children(':nth-child(1)').attr("data-validation-profile") + '_' + next);
            $(this).val("none");
            // console.log("MENZO@ce["+$(this).attr('id')+"]");
        });
    clonedElement.find(".element_attribute").each(
        function () {
            $(this).attr('id', "attr_" + $(this).attr("data-attribute_name") + "_" + $(this).parent().children(':nth-child(1)').attr("data-validation-profile"));
            $(this).val("");
        });
    clonedElement.insertAfter(that.parent());
    createAutoCompletes();
    validateTracker();
};

function cloneComponent(e) {
    var next = clone.nextClonePostfix();
    var that = $(this);
    var tmpID;
    e.preventDefault();
    clonedComponent = that.parent().parent().clone();
    tmpID = clonedComponent.attr("id");
    clonedComponent.addClass("clonedComponent");
    clonedComponent.attr("id", clonedComponent.attr("id") + '_' + next);
    clonedComponent.find(".clone").each(
        function () {
            $(this).remove();
        });

    clonedComponent.find(".clonedComponent").each(
        function () {
            $(this).remove();
        });
    clonedComponent.find(".compBtn").each(
        function () {
            if ($(this).is($(this).parent().parent().parent().children().find(".compBtn").eq(1))) {
                this.onclick = cloneComponent;
            } else {
                $(this).attr('value', '-');
                $(this).attr('title', 'Delete block');
                $(this).on("click", function (e) {
                    e.preventDefault();
                    var that = $(this);
                    that.parent().parent().remove();
                });
            }
        });

    clonedComponent.find(".component").each(function () {
        $(this).attr("id", $(this).attr("id") + '_' + next.toString());
    })
    clonedComponent.find(".input_element").each(function () {
        var new_id = $(this).attr("data-validation-profile") + '_' + next.toString();
        $(this).attr('id', new_id);
        $(this).val("");
        if (validationProfiles[$(this).attr("data-validation-profile")].attributes.ValueScheme === 'date') {
            $(this).removeClass('hasDatepicker').removeData('datepicker').unbind()
                .datepicker({
                    changeMonth: true,
                    changeYear: true,
                    yearRange: yearRange,
                    dateFormat: datePickerFormat
                });
        }
    });
    clonedComponent.find(".errorMsg").each(
        function () {
            $(this).html('');
            $(this).attr('id', "errorMsg_" + $(this).parent().children(":nth-child(1)").attr("data-validation-profile") + '_' + next.toString());
            // console.log("MENZO@cc["+$(this).attr('id')+"]");
        });
    clonedComponent.find(".btn").each(function () {
        $(this).on("click", function () {
            cloneElement(this)
        });
    });

    clonedComponent.find(".collapser").each(function () {
        $(this).on("click", function () {
            showHideComponent(this)
        });
    });
    clonedComponent.find(".expander").each(function () {
        $(this).on("click", function () {
            showHideComponent(this)
        });
    });


    clonedComponent.find(".language_dd").each(function () {
        $(this).attr('id', 'lang_' + $(this).parent().children(":nth-child(1)").attr("data-validation-profile") + '_' + next.toString());
        $(this).val(this.def_language);
    });
    clonedComponent.find(".uri_dd").each(function () {
        $(this).attr('id', 'uri_' + $(this).parent().children(":nth-child(1)").attr("data-validation-profile") + '_' + next.toString());
        $(this).val('none');
        // console.log("MENZO@cc["+$(this).attr('id')+"]");
    });
    clonedComponent.find(".uploader").each(function () {
        $(this).attr('id', 'upload_' + $(this).parent().children(":nth-child(1)").attr("data-validation-profile") + '_' + next.toString());
        $(this).val("");
        $(this).show();
        $(this).on("change", function () {
            addUploadTrigger(this);
        });
    });
    clonedComponent.find(".headerMsg").remove();
    clonedComponent.find(".optionalCompBtn").remove();
    clonedComponent.attr("data-filename", null);
    //list = $('[id^=' + tmpID + '_]');
    list = that.parent().parent().parent().find('[id^=' + tmpID + '_]');
    if (list.length) {
        clonedComponent.insertAfter(list.last());
    } else {
        clonedComponent.insertAfter(that.parent().parent());
    }
    console.log(list);
    //that.parent().parent().parent().append(clonedComponent);
    addAutoComplete(clonedComponent);
    validateTracker()
};


function collapseAll() {
    $(".collapser").click();
}

function expandAll() {
    $(".expander").click();
}

function showHideComponent(obj) {
    var that = $(obj);
    if ($(that).hasClass("expander")) {
        $(that).addClass('collapser').removeClass('expander');
        $(that).html("▼ ");
        expandComponent(that);
    } else {
        $(that).addClass('expander').removeClass('collapser');
        $(that).html("▶ ");
        collapseComponent(that);
    }
}

function thisShowHideComponent() {
    var that = $(this);
    showHideComponent(that);
}

function showComponentFields() {
    var that = $(this);
    var comp = that.parent().parent();
    var header = that.parent();
    that.attr('value', "✗");
    that.attr('title', 'Disable block')
    $(comp).children().each(function () {
        switch ($(this).attr("class")) {
            case 'disabledComponent':
                $(this).addClass("component").removeClass("disabledComponent");
                break;
            case 'disabledElement':
                $(this).addClass("element").removeClass("disabledElement");
                break;
        }
    });
    header.find(".compBtn").show();
    header.find(".uploader").show();
    $(this).on("click", hideComponentFields);
}

function checkResourceFilter(sel, filter) {
    if (sel !== 'all') {
        $(sel).attr('accept', filter);
    }
}

function hideComponentFields() {
    var that = $(this);
    var comp = that.parent().parent();
    var header = that.parent();
    $(comp).children().each(function () {
        switch ($(this).attr("class")) {
            case 'component':
                $(this).attr("class", "disabledComponent");
                break;
            case 'element':
                $(this).attr("class", "disabledElement");
                break;
        }
    });
    //comp.attr("data-filename",null);
    //header.find(".fileForm").reset();
    //comp.siblings(".clonedComponent").remove();
    header.find(".compBtn").hide();
    header.find(".uploader").hide();
    $(this).attr("value", "✓");
    $(this).on("click", showComponentFields);
}

function collapseComponent(obj) {
    var comp = obj.parent().parent();
    $(obj).attr("title", "Show block contents");
    $(comp).children().each(function () {
        if ($(this).hasClass('element') || $(this).hasClass('component')) {
            $(this).addClass('isCollapsed');
        }
    });
}

function expandComponent(obj) {
    var comp = obj.parent().parent();
    $(obj).attr("title", "Hide block contents");
    $(comp).children().each(function () {
        if ($(this).hasClass('isCollapsed')) {
            $(this).removeClass('isCollapsed');
        }
    });
}

function createAutoCompletes() {
    $("input[data-auto='yes']").each(function () {
        $(this).devbridgeAutocomplete({
            serviceUrl: $(this).attr("data-uri"),
            dataType: 'text',
            paramName: 'q',
            noCache: true, 
            onSearchStart: function(params) {
                var comp = $(this).parent().parent();
                var id = "uri_"+$(this).attr("id");
                var uri = comp.find("[id="+id+"]");
                $(uri).val("none");
            },
            onSelect: function (suggestion) {
                var comp = $(this).parent().parent();

                var id = "uri_"+$(this).attr("id");
                var uri = comp.find("[id="+id+"]");
                $(uri).val(suggestion.data.uri);
            }
        });
    });
}

function addAutoComplete(clonedComponent) {
    clonedComponent.find("input[data-auto='yes']").each(function () {
        $(this).devbridgeAutocomplete({
            serviceUrl: $(this).attr("data-uri"),
            dataType: 'text',
            paramName: 'q',
            noCache: true, 
            onSearchStart: function(params) {
                var comp = $(this).parent().parent();
                var id = "uri_"+$(this).attr("id");
                var uri = comp.find("[id="+id+"]");
                $(uri).val("none");
            },
            onSelect: function (suggestion) {
                var comp = $(this).parent().parent();
                var id = "uri_" + $(this).attr("id");
                var uri = comp.find("[id=" + id + "]");
                $(uri).val(suggestion.data.uri);
            }
        });
    });
}

function addUploadTrigger(obj) {
    var that = $(obj);
    that.parent().parent().find(".headerMsg").remove();
    var msg = document.createElement('div');
    msg.setAttribute("id", "msg" + that.attr("id"));
    msg.setAttribute("class", "headerMsg");
    msg.innerHTML = 'Uploading...';
    that.parent().parent().append(msg);
    var formdata = new FormData();
    if ($(obj).prop('files').length > 0) {
        file = $(obj).prop('files')[0];
        formdata.append("file", file);
        $.ajax({
            url: ccfOptions.uploadButton.actionURI,
            type: "POST",
            data: formdata,
            processData: false,
            contentType: false,
            success: function (result) {
                that.parent().parent().parent().attr("data-filename", file.name);
                that.parent().parent().find(".headerMsg").html(file.name);
                that.parent().parent().find(".resetUploadBtn").show();
                that.hide();
            },
            error: function (result) {
                that.parent().parent().find(".headerMsg").html('ERROR!');
            }
        });
    }
}

function validate() {
    expandAll();
    $("#errorSpace").html("");
    panelError = document.createElement("div");
    inputOK = true;
    for (var key in validationProfiles) {
        switch (getInputType($("#" + key))) {
            case "input":
                validateInput(key);
                break;
            case "textarea":
                validateTextArea(key);
                break;
            case "select":
                validateSelect(key);
                break;
            default:
                alert("Error: unknown input type!");
                inputOK = false;
                break;
        }
        //validateAttributes(key);
    }
    if (inputOK) {
        sendForm();
    } else {
        $("#errorSpace").append(errorSpace);
    }
}
;

function sendForm() {
    expandAll();
    var formValues = [];
    $(".clonedComponent").each(function () {
        $(this).attr("class", "component");
    });
    $(".hidden_element").each(function () {
        $(this).removeClass("hidden_element");
    });
    $("#ccform").children().each(function () {
        if ($(this).attr("class") === "component") {
            var element = {};
            element.name = $(this).attr("data-name");
            element.type = 'component';
            element.sortOrder = 0;
            element.content = parseComponent(this);
            formValues.push(element);
        }
    });
    var ret = JSON.stringify(formValues);
    var form = document.createElement('form');
    $(form).attr('id', 'ccSendForm');
    $(form).attr('method', 'post');
    $(form).attr('action', ccfOptions.saveButton.actionURI);
    var inputField = document.createElement('input');
    $(inputField).attr('type', 'hidden');
    $(inputField).attr('name', 'ccData');
    $(inputField).val(ret);
    $(form).append(inputField);
    var inputField = document.createElement('input');
    $(inputField).attr('type', 'hidden');
    $(inputField).attr('name', 'ccProfileID');
    $(inputField).val(formBuilder.profileID);
    $(form).append(inputField);
    var inputField = document.createElement('input');
    $(inputField).attr('type', 'hidden');
    $(inputField).attr('name', 'ccRecordFile');
    $(inputField).val(formBuilder.recordFile);
    $(form).append(inputField);
    $("#ccform").append(form);
    //$("#OKbtn").remove();
    $("#ccSendForm").submit();
}

function fillValues(record) {
    obj = record[2].value;
    parseRecord(obj, null);
    if (record[3] !== undefined) {
        setfiles(record[3]);
    }
}

function isParentComponentOptional(comp) {
    $(comp).parent().children(0).children().each(function () {
        if ($(this).hasClass("optionalCompBtn")) {
            return true;
        }
    })
    return false;
}

function setfiles(files) {
    for (var key in files) {
        $(".fileForm").eq(key).each(
            function () {
                $(this).parent().parent().attr("data-filename", files[key].file);
                var msg = document.createElement('div');
                msg.setAttribute("id", "msg" + $(this).attr("id"));
                msg.setAttribute("class", "headerMsg");
                msg.innerHTML = files[key].file;
                $(this).parent().append(msg);
                $(this).find(".resetUploadBtn").show();
                $(this).find("[id^=files_]").hide();
            })
    }
}

function parseComponent(component) {
    var retStruct = [];
    $(component).children().each(function () {
        if ($(this).attr("class") === "component") {
            var element = {};
            element.name = $(this).attr("data-name");
            element.type = 'component';
            element.sortOrder = $(this).attr("data-order");
            if ($(this).attr("data-filename") !== undefined) {
                element.file = $(this).attr("data-filename");
            }
            element.content = parseComponent(this);

            if (element.content.length > 0) {
                retStruct.push(element);
            }

        } else {
            if ($(this).attr("class") === "element") {
                var element = {};
                element.name = $(this).attr("data-name");
                element.type = 'element';
                element.sortOrder = $(this).attr("data-order");
                element.content = parseElement(this);
                if (element.content !== "") {
                    retStruct.push(element);
                }

            }
        }
    });
    //retStruct);
    return retStruct;
}

function parseElement(element) {
    var retVal = [];
    $(element).find(".input_element").each(function () {
        if ($(this).is("input") || $(this).is("select") || $(this).is("textarea")) {
            var unit = {};
            unit.value = $(this).val();
            if (unit.value !== "") {
                unit.attributes = {};
                var id = $(this).attr("id");
                unit.attributes.lang = $("#lang_" + id).val();
                var uri = $("#uri_" + id).val();
                if (uri !== "none")
                    unit.attributes.uri = $("#uri_" + id).val();
                $(this).parent().find("input[id^='attr_']").each(function () {
                    unit.attributes[$(this).attr("data-attribute_name")] = $(this).val();
                });
                retVal.push(unit);
            }
        }
    });
    if (Object.keys(retVal).length > 0) {
        return retVal;
    } else {
        return "";
    }
}

function parseRecord(obj, set) {
    var nameStack = {};
    for (var key in obj) {
        if (obj[key] !== null) {
            if (nameStack[obj[key].name] === undefined) {
                nameStack[obj[key].name] = 1;
            } else {
                nameStack[obj[key].name]++;
            }
            if (obj[key].type === 'component') {
                if (nameStack[obj[key].name] > 1) {
                    duplicateComponent(obj[key], set);
                }
                if (set === null) {
                    var newSet = $("div[data-name='" + obj[key].name + "']").eq(nameStack[obj[key].name] - 1);
                } else {
                    var newSet = $(set).children("div[data-name='" + obj[key].name + "']").eq(nameStack[obj[key].name] - 1);
                }
                parseRecord(obj[key].value, newSet);
            } else {
                if (nameStack[obj[key].name] > 1) {
                    duplicateField(obj[key], set);
                } else {
                    var name = obj[key].name;
                    //$(set).find("div[data-name='" + name + "']").find(".input_element").first().val(obj[key].value);
                    var el = $(set).find("div[data-name='" + name + "']").find(".input_element").first();
                    $(el).val(obj[key].value);
                    while ($(el).length > 0)  {
                        $(el).parent().parent().parent().children().first().children().each(function () {
                            if ($(this).hasClass("optionalCompBtn")) {
                                if (!$(this).hasClass("tempOptionalCompBtn")) {
                                    $(this).addClass("tempOptionalCompBtn");
                                }
                            }
                        })
                        el = el.parent();
                    }


                    var language = getLanguage(obj[key]);
                    if (language !== 0) {
                        $(set).find("div[data-name='" + name + "']").find(".language_dd").first().val(language);
                    }
                    var uri = getUri(obj[key]);
                    if (uri !== 'none') {
                        $(set).find("div[data-name='" + name + "']").find(".uri_dd").first().val(uri);
                    }
                    if (obj[key].attributes !== undefined) {
                        for (var attr_key in obj[key].attributes) {
                            if((attr_key !== 'xml:lang') && (attr_key !== 'uri')) {
                                $(set).find("div[data-name='" + name + "']").find("input[data-attribute_name='" + attr_key + "']").first().val(obj[key].attributes[attr_key]);
                            }
                        }
                    }
                }
            }
        }
    }
}


function getLanguage(obj) {
    if (obj.attributes !== undefined) {
        for (var key in obj.attributes) {
            if (key === 'xml:lang') {
                return obj.attributes[key];
            }
        }
    }
    return 0;
}

function getUri(obj) {
    if (obj.attributes !== undefined) {
        for (var key in obj.attributes) {
            if (key === 'uri') {
                return obj.attributes[key];
            }
        }
    }
    return "none";
}

function duplicateField(obj, set) {
    // console.log("MENZO@df["+obj.name+"]");
    var next = clone.nextClonePostfix();
    var language = getLanguage(obj);
    var uri = getUri(obj);
    var tempID;
    var name = obj.name;
    var btn = $(set).find("div[data-name='" + name + "']").find(".btn").first();
    clonedElement = $(set).find("div[data-name='" + name + "']").find(".control").first().clone();
    clonedElement.attr('class', 'clone');
    clonedElement.find(".btn").each(
        function () {
            $(this).attr('value', '-');
            $(this).on("click", function (e) {
                e.preventDefault();
                var that = $(this);
                that.parent().remove();
            });
        });
    clonedElement.find("[id^=" + btn.attr('data-source') + "]").each(
        function () {
            var id = $(this).attr('data-validation-profile');
            $(this).val(obj.value);
            tempID = id + '_' + next;
            $(this).attr('id', tempID);
        });
    clonedElement.find(".errorMsg").each(
        function () {
            var id = $(this).attr('id');
            $(this).attr('id', id + '_' + next);
            $(this).html("");
            //console.log("MENZO@df["+$(this).attr('id')+"]");
        });
    clonedElement.find(".language_dd").each(
            function () {
                $(this).attr('id', 'lang_' + tempID);
                $(this).val(language);
            });
    clonedElement.find(".uri_dd").each(
            function () {
                $(this).attr('id', 'uri_' + tempID);
                $(this).val(uri);
                // console.log("MENZO@df["+$(this).attr('id')+"]");
            });
    clonedElement.find(".element_attribute").each(
        function () {
            $(this).attr('id', "attr_" + $(this).attr("data-attribute_name") + "_" + tempID);
            $(this).val(obj.attributes[$(this).attr("data-attribute_name")]);
        });

    clonedElement.insertAfter(btn.parent());
    createAutoCompletes();
}

function duplicateComponent(obj, set) {
    var next = clone.nextClonePostfix();
    $(set).find("div[data-name='" + obj.name + "']").first().className = "component";
    clonedComponent = $(set).find("div[data-name='" + obj.name + "']").first().clone();
    var cloned_id = clonedComponent.attr('id');
    clonedComponent.attr("class", "component clonedComponent");
    clonedComponent.attr("id", clonedComponent.attr("id") + '_' + next);
    // console.log("MENZO@dc["+obj.name+"]["+clonedComponent.attr('id')+"]");
    clonedComponent.find(".compBtn").each(
        function () {

            if ($(this).is($(this).parent().parent().parent().children().find(".compBtn").eq(1)))
            {
                $(this).attr('value', '+');
                //$(this).on("click", function (e) {
                    //e.preventDefault();
                    //var that = $(this);
                    //that.parent().parent().on("click", cloneComponent) ;
                    this.onclick = cloneComponent;
                //});
            } else {
                $(this).attr('value', '-');
                $(this).on("click", function (e) {
                    e.preventDefault();
                    var that = $(this);
                    that.parent().parent().remove();
                });
            }

        });
    clonedComponent.find(".clone").each(
        function () {
            $(this).remove();
        });

    clonedComponent.find(".clonedComponent").each(
        function () {
            $(this).remove();
        });

    clonedComponent.find(".component").each(function () {
        var id = $(this).attr("id");
        $(this).attr('id', id + '_' + next);
    })

    clonedComponent.find(".errorMsg").each(
        function () {
            $(this).html('');
            var id = $(this).attr('id');
            $(this).attr('id', id + '_' + next);
            // console.log("MENZO@dc["+$(this).attr('id')+"]");
        });

    clonedComponent.find(".lang_dd").each(
        function () {
            $(this).val(formBuilder.def_language);
            var id = $(this).attr('id');
            $(this).attr('id', id + '_' + next);
            // console.log("MENZO@dc["+$(this).attr('id')+"]");
        });

    clonedComponent.find(".uri_dd").each(
        function () {
            $(this).val('none');
            var id = $(this).attr('id');
            $(this).attr('id', id + '_' + next);
            // console.log("MENZO@dc["+$(this).attr('id')+"]");
        });

    clonedComponent.find(".input_element").each(function () {
        var id = $(this).attr("id");
        $(this).attr('id', id + '_' + next);
        $(this).val("");
        if (validationProfiles[$(this).attr("data-validation-profile")].attributes.ValueScheme === 'date') {
            $(this).removeClass('hasDatepicker').removeData('datepicker').unbind()
                .datepicker({
                    changeMonth: true,
                    changeYear: true,
                    yearRange: yearRange,
                    dateFormat: datePickerFormat
                });
        }
    });
    clonedComponent.find(".btn").each(function () {
        if ($(this).attr("value") === "+") {
            $(this).on("click", function () {
                cloneElement(this);
            })
        }
    })
    clonedComponent.find(".collapser").each(function () {
        $(this).on("click", function () {
            showHideComponent(this)
        });
    });
    clonedComponent.find(".expander").each(function () {
        $(this).on("click", function () {
            showHideComponent(this)
        });
    });
    clonedComponent.find(".uploader").each(function () {
        var id = $(this).attr("id");
        $(this).attr('id', id + '_' + next);
        $(this).val("");
        $(this).on("change", function () {
            addUploadTrigger(this);
        });
    });



    clonedComponent.find(".optionalCompBtn").each(function () {
        $(this).attr('value', "✓");
        $(this).on("click", showComponentFields);
    });
    clonedComponent.attr("data-filename", null);
    var tmpID = clonedComponent.attr('id');
    var list = $(set).find('[id^=' + cloned_id + '_' + ']');
    if (list.length) {
        clonedComponent.insertAfter(list.last());
    } else {
        clonedComponent.insertAfter($("#" + cloned_id));
    }

    addAutoComplete(clonedComponent);

}



function validateInput(key) {
    $("[data-validation-profile=" + key + "]").each(function () {
        if (validationProfiles[key].attributes.CardinalityMin === '1' && this.value === "" && $(this).parent().parent().attr("class") !== 'disabledElement' && $(this).parent().parent().parent().attr("class") !== 'disabledComponent') {
            inputOK = false;
            $("#errorMsg_" + this.id).html(ccfOptions.alert.mandatory_field);
            var error = document.createElement('p');
            $(error).html(validationProfiles[key].attributes.label + ccfOptions.alert.mandatory_field_box);
            $(errorSpace).append(error);
        } else {
            $("#errorMsg_" + this.id).html("");
        }
        if (validationProfiles[key].attributes.ValueScheme === 'date' && this.value !== "") {
            var str = this.value;
            if (!isValidDate(str)) {
                inputOK = false;
                $("#errorMsg_" + this.id).html(ccfOptions.alert.no_valid_date);
                var error = document.createElement('p');
                $(error).html(validationProfiles[key].attributes.label + ccfOptions.alert.no_valid_date_box);
                $(errorSpace).append(error);
            }
        }
        if (validationProfiles[key].attributes.ValueScheme === 'int' && this.value !== "") {
            var str = this.value;
            if (!isInteger(str)) {
                inputOK = false;
                $("#errorMsg_" + this.id).html(ccfOptions.alert.int_field);
                var error = document.createElement('p');
                $(error).html(validationProfiles[key].attributes.label + ccfOptions.alert.int_field_box);
                $(errorSpace).append(error);
            }
        }
        if (validationProfiles[key].attributes.attributeList !== undefined) {
            if (this.value !== "") {
                for (var att in validationProfiles[key].attributes.attributeList) {
                    if (validationProfiles[key].attributes.attributeList[att].Required === 'true' && $("#attr_" + validationProfiles[key].attributes.attributeList[att].name + "_" + this.id).val() === "") {
                        inputOK = false;
                        $("#errorMsg_" + this.id).html(ccfOptions.alert.attr_not_empty_field);
                    }
                }
            }
        }
    });

}


function isInteger(x) {
    return (Number(x) !== NaN) && (x % 1 === 0);
}

function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx))
        return false;  // Invalid format
    var d = new Date(dateString);
    if (Number.isNaN(d.getTime()))
        return false; // Invalid date
    return d.toISOString().slice(0, 10) === dateString;
}

function validateTextArea(key) {
    $("[data-validation-profile=" + key + "]").each(function () {
        if (validationProfiles[key].attributes.CardinalityMin === '1' && this.value === "" && $(this).parent().parent().attr("class") !== 'disabledElement' && $(this).parent().parent().parent().attr("class") !== 'disabledComponent') {
            inputOK = false;
            $("#errorMsg_" + this.id).html(ccfOptions.alert.mandatory_field);
            var error = document.createElement('p');
            $(error).html(validationProfiles[key].attributes.label + ccfOptions.alert.mandatory_field_box);
            $(errorSpace).append(error);
        } else {
            $("#errorMsg_" + this.id).html("");
        }
        if (validationProfiles[key].attributes.attributeList !== undefined) {
            if (this.value !== "") {
                for (var att in validationProfiles[key].attributes.attributeList) {
                    if (validationProfiles[key].attributes.attributeList[att].Required) {
                        inputOK = false;
                        $("#errorMsg_" + this.id).html(ccfOptions.alert.attr_not_empty_field);
                    }
                }
            }
        }
    });
}

function validateSelect(key) {
    $("[data-validation-profile=" + key + "]").each(function () {
        if (validationProfiles[key].attributes.CardinalityMin === '1' && this.selectedIndex === 0 && $(this).parent().parent().attr("class") !== 'disabledElement' && $(this).parent().parent().parent().attr("class") !== 'disabledComponent') {
            inputOK = false;
            $("#errorMsg_" + this.id).html(ccfOptions.alert.mandatory_field);
            var error = document.createElement('p');
            $(error).html(validationProfiles[key].attributes.label + ccfOptions.alert.mandatory_field_box);
            $(errorSpace).append(error);
        } else {
            $("#errorMsg_" + this.id).html("");
        }
        if (validationProfiles[key].attributes.attributeList !== undefined) {
            if (this.value !== "") {
                for (var att in validationProfiles[key].attributes.attributeList) {
                    if (validationProfiles[key].attributes.attributeList[att].Required) {
                        inputOK = false;
                        $("#errorMsg_" + this.id).html(ccfOptions.alert.attr_not_empty_field);
                    }
                }
            }
        }
    });
}

function getInputType(element) {
    if (element.is("input")) {
        return "input";
    } else {
        if (element.is('textarea')) {
            return "textarea";
        } else {
            if (element.is("select")) {
                return "select";
            } else {
                return "onbekend";
            }
        }
    }
}





