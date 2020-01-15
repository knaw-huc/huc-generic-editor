"use strict"
interface json {
    id: string;
    content: [content];
    record: [];
}

interface content {
    ID: string;
    level: number;
    type: string;
    attributes: {
        CardinalityMin: string;
        CardinalityMax: string;
        name: string;
        ValueScheme: string;
        Multilingual: string;
        label: string;
        attributeList: [{
            Required: string;
            name: string;
            values: [];
        }];
        Required: string;
    }
}

interface JQuery {
    devbridgeAutocomplete(a: {
        serviceUrl: string;
        dataType: string;
        paramName: string
    })
        : any;
}
class FormBuilder {
    profileID: string = '';
    ccfOptions: any;

    objectLevel: number = 1;
    objectDisplay: boolean = true;
    validationProfiles: { [key: string]: content } = {};
    inputOK: boolean = true;
    isUploading: boolean = false;
    errorSpace: any;
    cloneBuffer: any;
    panelError: any;
    recordEdit: boolean = false;
    languages: string[] = ['aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az', 'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs', 'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy', 'da', 'de', 'dv', 'dz', 'ee', 'el', 'en', 'eo', 'es', 'et', 'eu', 'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy', 'ga', 'gd', 'gl', 'gn', 'gu', 'gv', 'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz', 'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu', 'ja', 'jv', 'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky', 'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv', 'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny', 'oc', 'oj', 'om', 'or', 'os', 'pa', 'pi', 'pl', 'ps', 'pt', 'qu', 'rm', 'rn', 'ro', 'ru', 'rw', 'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'wo', 'xh', 'yi', 'yo', 'za', 'zh', 'zu'];
    controlHash: string[] = []; // ?? is it string?

    constructor(obj: json, ccfOptions: any) {
        this.profileID = obj.id;
        this.ccfOptions = ccfOptions;

        this.parse(obj.content);
        this.createButtons();
        createAutoCompletes();
        if (obj.record !== undefined) {
            fillValues(obj.record);
            $(".disabledElement").attr("class", "element");
            $(".disabledComponent").addClass("component").removeClass("disabledComponent");
            $(".optionalCompBtn").click();
        }
        // console.log(this.validationProfiles);
    }
    parse(o: any, componentID?: string) {
        if (o.hasOwnProperty('type')) {
            switch (o.type) {
                case 'Element':
                    this.handleElement(o, componentID);
                    break;
                case 'Component':
                    this.handleComponent(o, componentID);
                    this.parse(o.content, o.ID);
                    break;
                default:
                    alert('Error: property type not defined');
                    break;
            }
        } else {
            for (let key in o) {
                let type = typeof o[key];
                if (type === 'object') {
                    this.parse(o[key], componentID);
                }
            }
        }
    }
    handleElement(element: any, componentID?: string) {
        let ccfOptions = this.ccfOptions;
        let html = document.createElement('div');
        if (this.objectDisplay) {
            html.setAttribute('class', 'element');
        } else {
            html.setAttribute('class', 'disabledElement');
        }
        html.setAttribute('data-name', element.attributes.name);
        html.setAttribute('data-order', element.attributes.initialOrder);
        let label = document.createElement('div');
        label.setAttribute('class', 'label');
        if (element.attributes.CardinalityMin > 0) { // Required element
            label.innerHTML = element.attributes.label + ' *';
        } else {
            label.innerHTML = element.attributes.label;
        }
        if (element.attributes.ValueScheme === 'date') {
            label.innerHTML = label.innerHTML + ' (' + this.ccfOptions.alert.date_string + ')';
        }
        let input = document.createElement('div');
        input.setAttribute('class', 'control');
        let control = this.createControl(element); // ann. subfunction
        input.appendChild(control);
        if (element.attributes.Multilingual === 'true') {
            let dropdown = document.createElement('select');
            dropdown.setAttribute('class', 'language_dd');
            dropdown.setAttribute('id', 'lang_' + element.ID);
            let option = document.createElement('option');
            option.setAttribute('value', 'none');
            option.innerHTML = '--';
            dropdown.appendChild(option);
            for (let key in this.languages) {
                let option = document.createElement('option');
                option.setAttribute('value', this.languages[key]);
                option.innerHTML = this.languages[key];
                dropdown.appendChild(option);
            }
            $(dropdown).val(this.ccfOptions.language);
            input.appendChild(dropdown);
        }
        if (element.attributes.attributeList !== undefined) {
            for (let key in element.attributes.attributeList) {
                let attr_field: any;
                switch (element.attributes.attributeList[key].ValueScheme) {
                    case 'string':
                        attr_field = document.createElement('input');
                        attr_field.setAttribute('type', 'text');
                        attr_field.setAttribute('id', 'attr_' + element.attributes.attributeList[key].name + '_' + element.ID);
                        attr_field.setAttribute('data-attribute_name', element.attributes.attributeList[key].name)
                        attr_field.setAttribute('placeholder', element.attributes.attributeList[key].name);
                        attr_field.setAttribute("class", "element_attribute");
                        break;
                    // New Feature in development MvdP 
                    case 'dropDown':
                        // console.log(element.attributes.attributeList[key].values);
                        attr_field = document.createElement('select');
                        // attr_field.setAttribute('type', 'text');
                        attr_field.setAttribute('id', 'attr_' + element.attributes.attributeList[key].name + '_' + element.ID);
                        attr_field.setAttribute('data-attribute_name', element.attributes.attributeList[key].name)
                        // attr_field.setAttribute('placeholder', element.attributes.attributeList[key].name); // niet nodig denk ik
                        attr_field.setAttribute("class", "element_attribute");

                        let option = document.createElement('option');
                        for (let k in element.attributes.attributeList[key].values) {
                            let option = document.createElement('option');
                            option.setAttribute('value', element.attributes.attributeList[key].values[k]);
                            option.innerHTML = element.attributes.attributeList[key].values[k];
                            attr_field.appendChild(option);
                        }
                        break;
                }
                input.appendChild(attr_field);
            }
        }
        if (element.attributes.duplicate !== undefined) {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button');
            btn.setAttribute('value', '+');
            btn.setAttribute('class', 'btn');
            btn.setAttribute('data-source', element.ID);
            btn.onclick =
                function (e) {
                    // let clone = new Clone();
                    let next = Clone.clonePostfix++; // Static variable in Clone class
                    // let next = clone.nextClonePostfix();
                    console.log('next:', next)
                    let that = $(this);
                    let tempID: any;
                    e.preventDefault();
                    let clonedElement = that.parent().clone();
                    clonedElement.attr('class', 'clone');
                    clonedElement.find(".btn").each(
                        function () {
                            $(this).attr('value', '-');
                            $(this).on("click", function (e) {
                                e.preventDefault();
                                const that = $(this);
                                that.parent().remove();
                            });
                        });
                    clonedElement.find("#" + that.attr('data-source')).each(
                        function () {
                            let id = $(this).attr('id');
                            $(this).val("");
                            tempID = id + '_' + next;
                            $(this).attr('id', tempID);
                        });
                    clonedElement.find(".errorMsg").each(
                        function () {
                            let id = $(this).attr('id');
                            $(this).attr('id', id + '_' + next);
                            $(this).html("");
                        });
                    clonedElement.find(".language_dd").each(
                        function () {
                            $(this).attr('id', 'lang_' + tempID);
                            $(this).val(ccfOptions.language); // ccfOptions top of the function
                        });
                    clonedElement.find(".element_attribute").each(
                        function () {
                            $(this).attr('id', "attr_" + $(this).attr("data-attribute_name") + "_" + tempID);
                            $(this).val("");
                        });
                    clonedElement.insertAfter(that.parent() as any); // ugly fix 
                    createAutoCompletes();
                };
            input.appendChild(btn);
        }
        html.appendChild(label);
        let Msg = document.createElement('div');
        Msg.setAttribute("id", "errorMsg_" + element.ID);
        Msg.setAttribute('class', 'errorMsg');
        input.appendChild(Msg);
        html.appendChild(input);
        if (element.attributes.hide === 'yes') {
            $(html).addClass("hidden_element");
        }
        $("#" + componentID).append(html);
        this.validationProfiles[element.ID] = element; // complete element added to the validationstack. 
        // TODO maybe subtle addition of relevant validation rules (MvdP)
        // console.log('valprofile: ', element.ID, element);
    }
    handleComponent(component: any, componentID?: string) {
        let html = document.createElement('div');
        if (this.objectDisplay || Number(component.level) <= Number(this.objectLevel)) {
            html.setAttribute('class', 'component');
        } else {
            html.setAttribute('class', 'disabledComponent');
        }
        html.setAttribute('id', component.ID);
        html.setAttribute('data-name', component.attributes.name);
        html.setAttribute('data-order', component.attributes.initialOrder);
        let header = document.createElement('div');
        header.setAttribute('class', 'componentHeader');
        header.innerHTML = component.attributes.label;
        if (component.attributes.CardinalityMin === '0') {
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button');
            btn.setAttribute('value', "✓");
            btn.setAttribute('class', 'optionalCompBtn');
            $(btn).on("click", showComponentFields);
            header.appendChild(btn);
            if (this.objectDisplay) {
                this.objectDisplay = false;
                this.objectLevel = component.level;
            }

        } else {
            this.objectDisplay = true;
        }

        if (component.attributes.CardinalityMax !== '1') {
            //header.innerHTML = component.attributes.label;
            let btn = document.createElement('input');
            btn.setAttribute('type', 'button');
            btn.setAttribute('value', '+');
            btn.setAttribute('class', 'compBtn');
            btn.setAttribute('data-source', component.ID);
            if (component.attributes.resource !== undefined || component.attributes.CardinalityMin === '0') {
                $(btn).hide();
            }
            btn.onclick = function (e) {
                let next = Clone.clonePostfix++;
                let that = $(this);
                e.preventDefault();
                let clonedComponent = that.parent().parent().clone();
                clonedComponent.addClass("clonedComponent");
                clonedComponent.attr("id", clonedComponent.attr("id") + '_' + next);
                clonedComponent.find(".compBtn").each(
                    function () {
                        $(this).attr('value', '-');
                        $(this).on("click", function (e) {
                            e.preventDefault();
                            let that = $(this);
                            that.parent().parent().remove();
                        });
                    });
                clonedComponent.find(".clone").each(
                    function () {
                        $(this).remove();
                    });
                clonedComponent.find(".errorMsg").each(
                    function () {
                        $(this).html('');
                        let id = $(this).attr('id');
                        $(this).attr('id', id + '_' + next);
                    });
                clonedComponent.find(".input_element").each(function () {
                    let id = $(this).attr("id");
                    $(this).attr('id', id + '_' + next);
                    $(this).val("");
                });
                clonedComponent.find(".uploader").each(function () {
                    let id = $(this).attr("id");
                    $(this).attr('id', id + '_' + next);
                    $(this).val("");
                    $(this).show();
                    $(this).on("change", function () {
                        addUploadTrigger(this);
                    });
                });
                clonedComponent.find(".headerMsg").remove();
                clonedComponent.find(".optionalCompBtn").remove();
                clonedComponent.attr("data-filename", null);
                //that.parent().parent().parent().append(clonedComponent);
                clonedComponent.insertAfter(that.parent().parent() as any);
                addAutoComplete(clonedComponent);
            };
            header.appendChild(btn);
        }
        if (component.attributes.resource !== undefined) {
            let form = document.createElement('form');
            form.setAttribute("method", "post");
            form.setAttribute("class", "fileForm");
            let fileSelector = document.createElement('input');
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
            let resetUpload = document.createElement('input');
            resetUpload.setAttribute("type", "reset");
            resetUpload.setAttribute("target", component.ID);
            resetUpload.setAttribute("value", "x");
            resetUpload.setAttribute("class", "resetUploadBtn");
            resetUpload.onclick = function () {
                let target = $(this).attr("target");
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
    }
    createControl(element: any) {
        let type = typeof element.attributes.ValueScheme;
        let control: any;
        if (type === "object") { // DEPRECATED? MvdP
            control = this.setValueSchemeElement(element.attributes.ValueScheme[0], element.ID);
        } else {
            switch (element.attributes.ValueScheme) {
                case 'boolean':
                    control = document.createElement('select');
                    control.setAttribute('id', element.ID);
                    control.setAttribute('data-reset-value', '');
                    let option = document.createElement('option');
                    option.setAttribute("value", '');
                    option.innerHTML = '--';
                    control.appendChild(option);
                    option = document.createElement('option');
                    option.setAttribute("value", "true");
                    option.innerHTML = 'Ja';
                    control.appendChild(option);
                    option = document.createElement('option');
                    option.setAttribute("value", "false");
                    option.innerHTML = 'Nee';
                    control.appendChild(option);
                    break;
                case 'string':
                case 'decimal':
                    control = this.createTextInputField(element);
                    break;
                default:
                    control = document.createElement('input');
                    control.setAttribute('id', element.ID);
                    control.setAttribute('type', 'text');
                    control.setAttribute('data-reset-value', 'line');
                    if (element.attributes.autoValue === undefined) {
                        control.setAttribute('value', "");
                    } else {
                        control.setAttribute('value', element.attributes.autoValue.value);
                    }

            }
        }
        control.setAttribute('data-validation-profile', element.ID);
        //control.setAttribute('data-order', element.attributes.initialOrder);
        $(control).addClass("input_element");
        return control;
    }
    setValueSchemeElement(element: any, id: string) { // DEPRECATED? cwr
        let control = document.createElement('select');
        control.setAttribute('id', id);
        let option = document.createElement('option');
        option.setAttribute("value", '');
        option.innerHTML = '--';
        control.appendChild(option);
        for (let key in element) {
            let option = document.createElement('option');
            option.setAttribute("value", element[key].value);
            if (element[key].label === undefined) {
                option.innerHTML = element[key].value;
            } else {
                option.innerHTML = element[key].label;
            }

            control.appendChild(option);
        }
        return control;
    }
    createTextInputField(element: any) {
        let type: string;
        if (element.attributes.inputField === undefined) {
            type = '';
        } else {
            type = element.attributes.inputField;
        }
        let control: any;
        switch (type) {
            case 'multiple':
                control = document.createElement('textarea');
                control.setAttribute('rows', this.setInputFieldHeigth(element.attributes.heigth));
                control.setAttribute('cols', this.setInputFieldWidth(element.attributes.width));
                control.setAttribute('data-reset-value', 'area');
                control.setAttribute('id', element.ID);
                break;
            case 'single':
            default:
                control = document.createElement('input');
                control.setAttribute('type', 'text');
                control.setAttribute('size', this.setInputFieldWidth(element.attributes.width));
                control.setAttribute('data-reset-value', 'line');
                if (element.attributes.autoValue === undefined) {
                    control.setAttribute('value', "");
                } else {
                    control.setAttribute('value', element.attributes.autoValue.value);
                }
                control.setAttribute('id', element.ID);
                if (element.attributes.autoCompleteURI !== undefined) {
                    control.setAttribute("data-auto", "yes");
                }
                break;
        }

        return control;
    }
    setInputFieldWidth(value: number) {
        if (value === undefined) {
            return 50;
        } else {
            return value;
        }
    }
    setInputFieldHeigth(value: number) {
        if (value === undefined) {
            return 8;
        } else {
            return value;
        }
    }
    createResourcePanel() {
        let resourceFrame = document.createElement('div');
        resourceFrame.setAttribute('id', 'resourceFrame');
        resourceFrame.setAttribute('class', 'component');
        let header = document.createElement('div');
        header.setAttribute('class', 'componentHeader');
        header.innerHTML = 'Bestanden';
        let btn = document.createElement('input');
        btn.setAttribute('type', 'button');
        btn.setAttribute('value', '+');
        btn.setAttribute('class', 'compBtn');
        btn.setAttribute('id', 'resourceBtn');
        btn.onclick = function (e) {
            let that = $(this);
            e.preventDefault();
            let list = that.parent().parent();
            let input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('class', 'filename');
            input.setAttribute("id", "resList");
            input.setAttribute('multiple', "");
            list.append(input);
        };
        header.appendChild(btn);
        resourceFrame.appendChild(header);
        $("#ccform").append(resourceFrame);
    }
    createButtons() {
        let buttonFrame = document.createElement('div');
        buttonFrame.setAttribute('id', 'btnFrame');
        let control = document.createElement('input');
        control.setAttribute('type', 'button');
        control.setAttribute('value', this.ccfOptions.submitButton.label);
        control.setAttribute('id', 'OKbtn');
        control.onclick = () =>
            this.validate();
        ;
        buttonFrame.appendChild(control);
        control = document.createElement('input');
        control.setAttribute('type', 'button');
        control.setAttribute('value', this.ccfOptions.saveButton.label);
        control.setAttribute('id', 'saveBtn');
        control.onclick = () => {
            this.sendForm();
        };
        buttonFrame.appendChild(control);
        if (this.ccfOptions.resetButton !== null && this.ccfOptions.resetButton !== undefined) {
            control = document.createElement('input');
            control.setAttribute('type', 'button');
            control.setAttribute('value', this.ccfOptions.resetButton.label);
            control.setAttribute('id', 'resetBtn');
            control.onclick = function () {
                history.back();
            };
            buttonFrame.appendChild(control);
        }
        this.errorSpace = document.createElement('div'); // global  errorSpace
        this.errorSpace.setAttribute("id", "errorSpace");
        buttonFrame.appendChild(this.errorSpace);
        $("#ccform").append(buttonFrame);
    }
    validate(): void {
        $("#errorSpace").html("");
        // properties objects/variables errorSpace, panelError, inputOK, validationProfiles, defined on top of the class

        this.panelError = document.createElement("div");
        this.inputOK = true;

        for (let key in this.validationProfiles) {
            // console.log(key);
            switch (getInputType($("#" + key))) { // user-function
                case "input":
                    this.validateInput(key);
                    break;
                case "textarea":
                    this.validateTextArea(key);
                    break;
                case "select":
                    this.validateSelect(key);
                    break;
                default:
                    alert("Error: unknown input type!");
                    this.inputOK = false;
                    break;
            }
            //validateAttributes(key);
        }
        if (this.inputOK) {
            //console.log(validationProfiles);
            this.sendForm();
        } else {
            $("#errorSpace").append(this.errorSpace);
        }
    }
    validateInput(key: string) {

        // console.log(validationProfiles);
        // console.log('key:', key, typeof(key));
        // https://learn.jquery.com/using-jquery-core/iterating/
        // this confusion cause change to arrow function necessary for this.validationProfiles
        // but for Jquery you need the this inside the each loop, but you can give it a name in the call, make it explicit
        // the hiss is a substitute for the JQuery this

        // Maybe OTHER SOLUTION let validationProfiles = this.validationProfiles; // No this.inputOK needs to be set and needs than a reference to this

        $("[data-validation-profile=" + key + "]").each((index, hiss) => {
            console.log('kv', key);
            if (this.validationProfiles[key].attributes.CardinalityMin === '1' && (<HTMLInputElement>hiss).value === "" && $(this).parent().parent().attr("class") !== 'disabledElement' && $(this).parent().parent().parent().attr("class") !== 'disabledComponent') {
                // console.log('required')
                this.inputOK = false;
                $("#errorMsg_" + hiss.id).html(this.ccfOptions.alert.mandatory_field);
                let error = document.createElement('p');
                $(error).html(this.validationProfiles[key].attributes.label + this.ccfOptions.alert.mandatory_field_box);
                $(this.errorSpace).append(error);
            } else {
                $("#errorMsg_" + hiss.id).html("");
            }
            if (this.validationProfiles[key].attributes.ValueScheme === 'date' && (<HTMLInputElement>hiss).value !== "") { // don't know the interface 
                let str = (<HTMLInputElement>hiss).value;
                if (!isValidDate(str)) {
                    this.inputOK = false;
                    $("#errorMsg_" + hiss.id).html(this.ccfOptions.alert.no_valid_date);
                    let error = document.createElement('p');
                    $(error).html(this.validationProfiles[key].attributes.label + this.ccfOptions.alert.no_valid_date_box);
                    $(this.errorSpace).append(error);
                }
            }
            if (this.validationProfiles[key].attributes.ValueScheme === 'int' && (<HTMLInputElement>hiss).value !== "") {
                let str = (<HTMLInputElement>hiss).value;
                if (!isInteger(Number(str))) { // added Number cast, cwr
                    this.inputOK = false;
                    $("#errorMsg_" + hiss.id).html(this.ccfOptions.alert.int_field);
                    let error = document.createElement('p');
                    $(error).html(this.validationProfiles[key].attributes.label + this.ccfOptions.alert.int_field_box);
                    $(this.errorSpace).append(error);
                }
            }
            // Improved validation for attributes (MvdP)
            if (this.validationProfiles[key].attributes.attributeList !== undefined) {
                if ((<HTMLInputElement>hiss).value !== "") {
                    let attribute_errorMsg = '';
                    for (let att in this.validationProfiles[key].attributes.attributeList) {
                        // console.log('att', att, validationProfiles[key].attributes.attributeList );
                        // console.log(validationProfiles[key].attributes.attributeList[att].Required );
                        if (this.validationProfiles[key].attributes.attributeList[att].Required === 'true' && $("#attr_" + this.validationProfiles[key].attributes.attributeList[att].name + "_" + hiss.id).val() === "") {
                            this.inputOK = false;
                            let attribute_errorMsg_template = this.ccfOptions.alert.attr_not_empty_field;
                            attribute_errorMsg = ' ' + attribute_errorMsg_template.replace("$attributename", this.validationProfiles[key].attributes.attributeList[att].name);
                            $("#errorMsg_" + hiss.id).append(attribute_errorMsg);
                            $(this.errorSpace).append(attribute_errorMsg);

                        }
                    }
                }
            }
        });

    }

    validateTextArea(key: string) {
        $("[data-validation-profile=" + key + "]").each((index, hiss) => {
            if (this.validationProfiles[key].attributes.CardinalityMin === '1' && (<HTMLInputElement>hiss).value === "" && $(this).parent().parent().attr("class") !== 'disabledElement' && $(this).parent().parent().parent().attr("class") !== 'disabledComponent') {
                this.inputOK = false;
                $("#errorMsg_" + hiss.id).html(this.ccfOptions.alert.mandatory_field);
                let error = document.createElement('p');
                $(error).html(this.validationProfiles[key].attributes.label + this.ccfOptions.alert.mandatory_field_box);
                $(this.errorSpace).append(error);
            } else {
                $("#errorMsg_" + hiss.id).html("");
            }
            if (this.validationProfiles[key].attributes.attributeList !== undefined) {
                if ((<HTMLInputElement>hiss).value !== "") {
                    for (let att in this.validationProfiles[key].attributes.attributeList) {
                        // console.log(validationProfiles[key].attributes.attributeList[att].Required);
                        if (this.validationProfiles[key].attributes.attributeList[att].Required) {
                            this.inputOK = false;
                            $("#errorMsg_" + hiss.id).html(this.ccfOptions.alert.attr_not_empty_field);
                        }
                    }
                }
            }
        });
    }

    validateSelect(key: string) {
        $("[data-validation-profile=" + key + "]").each((index, hiss) => {
            if (this.validationProfiles[key].attributes.CardinalityMin === '1' && (hiss as HTMLSelectElement).selectedIndex === 0 && $(this).parent().parent().attr("class") !== 'disabledElement' && $(this).parent().parent().parent().attr("class") !== 'disabledComponent') {
                this.inputOK = false;
                $("#errorMsg_" + hiss.id).html(this.ccfOptions.alert.mandatory_field);
                let error = document.createElement('p');
                $(error).html(this.validationProfiles[key].attributes.label + this.ccfOptions.alert.mandatory_field_box);
                $(this.errorSpace).append(error);
            } else {
                $("#errorMsg_" + hiss.id).html("");
            }
            if (this.validationProfiles[key].attributes.attributeList !== undefined) {
                if ((hiss as HTMLInputElement).value !== "") {
                    for (let att in this.validationProfiles[key].attributes.attributeList) {
                        // console.log(validationProfiles[key].attributes.attributeList[att].Required);
                        if (this.validationProfiles[key].attributes.attributeList[att].Required) {
                            this.inputOK = false;
                            $("#errorMsg_" + hiss.id).html(this.ccfOptions.alert.attr_not_empty_field);
                        }
                    }
                }
            }
        });
    }

    sendForm(): void { // create a form not an action
        let ccfOptions = this.ccfOptions;
        let profileID = this.profileID;
        let formValues: any[] = [];
        $(".clonedComponent").each(function () {
            $(this).attr("class", "component");
        });
        $(".hidden_element").each(function () {
            $(this).removeClass("hidden_element");
        });
        $("#ccform").children().each(function () {
            if ($(this).attr("class") === "component") {
                let element = <any>{}; // TODO must neater, interface for this element?
                element.name = $(this).attr("data-name");
                element.type = 'component';
                element.sortOrder = 0;
                element.content = parseComponent(this);
                formValues.push(element);
            }
        });
        let ret = JSON.stringify(formValues);
        let form = document.createElement('form');
        $(form).attr('id', 'ccSendForm');
        $(form).attr('method', 'post');
        $(form).attr('action', ccfOptions.saveButton.actionURI);
        let inputField = document.createElement('input');
        $(inputField).attr('type', 'hidden');
        $(inputField).attr('name', 'ccData');
        $(inputField).val(ret);
        $(form).append(inputField);
        inputField = document.createElement('input');
        $(inputField).attr('type', 'hidden');
        $(inputField).attr('name', 'ccProfileID');
        $(inputField).val(profileID); //??? cwr casting to string is possible but TypeScript wonders if it's sensible
        $(form).append(inputField);
        $("#ccform").append(form);
        $("#OKbtn").remove();
        $("#ccSendForm").submit();
    }



}

class Clone {
    static clonePostfix: number = 1;
}

// let clone = {
//     clonePostfix: 0,
//     nextClonePostfix: function () {
//         this.clonePostfix++;
//         return this.clonePostfix;
//     }
// };


function showComponentFields(this: any): void {
    let that = $(this);
    let comp = that.parent().parent();
    let header = that.parent();
    that.attr('value', "✗");
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

function checkResourceFilter(sel: any, filter: any) {
    if (sel !== 'all') {
        $(sel).attr('accept', filter);
    }
}

function hideComponentFields(this: any) {
    let that = $(this);
    let comp = that.parent().parent();
    let header = that.parent();
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

function createAutoCompletes() {
    $("input[data-auto='yes']").each(function () {
        $(this).devbridgeAutocomplete({
            serviceUrl: server + 'proxy.php',
            dataType: 'text',
            paramName: 'q'
        });
    });
}

function addAutoComplete(clonedComponent: JQuery<GlobalEventHandlers> | JQuery<any>): void { // zal wel

    clonedComponent.find("input[data-auto='yes']").each(function () {
        $(this).devbridgeAutocomplete({
            serviceUrl: server + 'proxy.php',
            dataType: 'text',
            paramName: 'q'
        });
    });
}

function addUploadTrigger(obj: any) {
    let that = $(obj);
    that.parent().parent().find(".headerMsg").remove();
    let msg = document.createElement('div');
    msg.setAttribute("id", "msg" + that.attr("id"));
    msg.setAttribute("class", "headerMsg");
    msg.innerHTML = 'Uploading...';
    //console.log(ccfOptions.uploadButton.actionURI);
    that.parent().parent().append(msg);
    let formdata = new FormData();
    if ($(obj).prop('files').length > 0) {
        let file = $(obj).prop('files')[0];
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
                console.log(result);
                that.parent().parent().find(".headerMsg").html('ERROR!');
            }
        });
    }
}


;



function fillValues(record: any): void { // stays outside gives default values 
    let obj = record[2].value;
    // console.log(obj);
    parseRecord(obj.value, null); // stays outsides

    if (record[3] !== undefined) { // ?? What happens here 
        setfiles(record[3]); // stays outsides
    }

}

function setfiles(files: any) {
    for (let key in files) {
        $(".fileForm").eq(Number(key)).each( // cast to number Check with Rob
            function () {
                $(this).parent().parent().attr("data-filename", files[key].file);
                let msg = document.createElement('div');
                msg.setAttribute("id", "msg" + $(this).attr("id"));
                msg.setAttribute("class", "headerMsg");
                msg.innerHTML = files[key].file;
                $(this).parent().append(msg);
                $(this).find(".resetUploadBtn").show();
                $(this).find("[id^=files_]").hide();
            })
    }
}

function parseComponent(component: any) { // called from function sendform also recursive
    let retStruct: any[] = []; // TODO make more specific
    $(component).children().each(function () {
        let element = <any>{}; // TODO interface

        if ($(this).attr("class") === "component") {
            element.name = $(this).attr("data-name");
            element.type = 'component';
            element.sortOrder = $(this).attr("data-order");
            if ($(this).attr("data-filename") !== undefined) {
                element.file = $(this).attr("data-filename");
            }
            element.content = parseComponent(this);
            retStruct.push(element);
        } else {
            if ($(this).attr("class") === "element") {
                element = {};
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
    return retStruct;
}

function parseElement(element: any) { // called from parseComponent function
    let retVal: any[] = []; // TODO make more specific
    $(element).find(".input_element").each(function () {
        if ($(this).is("input") || $(this).is("select") || $(this).is("textarea")) {
            let unit = <any>{};
            unit.value = $(this).val();
            if (unit.value !== "") {
                unit.attributes = {};
                let id = $(this).attr("id");
                unit.attributes.lang = $("#lang_" + id).val();
                $(this).parent().find("input[id^='attr_']").each(function () {
                    let x: string = $(this).attr("data-attribute_name") as string; // work-around undefined can't be a index
                    unit.attributes[x] = $(this).val();
                });
                retVal.push(unit);
            }
        }
    });
    if (Object.keys(retVal).length > 0) {
        return retVal;
    }
    else {
        return "";
    }
}

function parseRecord(obj: any, set: JQuery<any> | null) { // don't get the JQuery<any> syntax yet
    // console.log(obj);
    let nameStack = <any>{};
    for (let key in obj) {

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
                let newSet;
                if (set === null) {
                    newSet = $("div[data-name='" + obj[key].name + "']").eq(nameStack[obj[key].name] - 1);
                } else {
                    newSet = $(set).find("div[data-name='" + obj[key].name + "']").eq(nameStack[obj[key].name] - 1);
                }

                //                if (obj[key].attributes !== undefined) {
                //                    if (obj[key].attributes.ref !== undefined) {
                //                        let ref = obj[key].attributes.ref;
                //                        $("div[data-name='" + obj[key].name + "']").
                //                    }
                //                    console.log(uploads[ref]);
                //            }
                parseRecord(obj[key].value, newSet);
            } else {
                if (nameStack[obj[key].name] > 1) {
                    duplicateField(obj[key], set);
                } else {
                    let name = obj[key].name;
                    $(set).find("div[data-name='" + name + "']").find(".input_element").first().val(obj[key].value);
                    let language = getLanguage(obj[key]);
                    if (language !== 0) {
                        $(set).find("div[data-name='" + name + "']").find(".language_dd").first().val(language);
                    }
                    if (obj[key].attributes !== undefined) {
                        for (let attr_key in obj[key].attributes) {
                            if (attr_key !== 'xml:lang') {
                                $(set).find("div[data-name='" + name + "']").find("input[data-attribute_name='" + attr_key + "']").first().val(obj[key].attributes[attr_key]);
                            }
                        }
                    }
                }
            }
        }
    }
}


function getLanguage(obj: { attributes: { [x: string]: any; } | undefined; }) {
    if (obj.attributes !== undefined) {
        for (let key in obj.attributes) {
            if (key === 'xml:lang') {
                return obj.attributes[key];
            }
        }
    }
    return 0;
}

function duplicateField(obj: { name: any; value: string | number | string[] | ((this: any, index: number, value: string) => string); attributes: { [x: string]: string | number | string[] | ((this: any, index: number, value: string) => string); }; }, set: any) {
    let next = Clone.clonePostfix++;
    let language = getLanguage(obj);
    let tempID: string | number | ((this: any, index: number, attr: string) => string | number | void | undefined) | null;
    let name = obj.name;
    let btn = $(set).find("div[data-name='" + name + "']").find(".btn").first();
    let clonedElement = $(set).find("div[data-name='" + name + "']").find(".control").first().clone();
    clonedElement.attr('class', 'clone');
    clonedElement.find(".btn").each(
        function () {
            $(this).attr('value', '-');
            $(this).on("click", function (e) {
                e.preventDefault();
                const that = $(this);
                that.parent().remove();
            });
        });
    clonedElement.find("[id^=" + btn.attr('data-source') + "]").each(
        function () {
            let id = $(this).attr('data-validation-profile');
            $(this).val(obj.value);
            tempID = id + '_' + next;
            console.log(tempID);
            $(this).attr('id', tempID);
        });
    clonedElement.find(".errorMsg").each(
        function () {
            let id = $(this).attr('id');
            $(this).attr('id', id + '_' + next);
            $(this).html("");
        });
    clonedElement.find(".language_dd").each(
        function () {
            $(this).attr('id', 'lang_' + tempID);
            $(this).val(language);
        });
    clonedElement.find(".element_attribute").each(
        function () {
            $(this).attr('id', "attr_" + $(this).attr("data-attribute_name") + "_" + tempID);
            let x: string = $(this).attr("data-attribute_name") as string;
            $(this).val(obj.attributes[x]);
            //$(this).val("");
            console.log(obj);
        });

    clonedElement.insertAfter(btn.parent());
    createAutoCompletes();
}

function duplicateComponent(obj: { name: string; }, set: any) {
    let next = Clone.clonePostfix++;
    let clonedComponent = $(set).find("div[data-name='" + obj.name + "']").first().clone();
    clonedComponent.addClass("clonedComponent");
    clonedComponent.attr("id", clonedComponent.attr("id") + '_' + next);
    clonedComponent.find(".compBtn").each(
        function () {
            $(this).attr('value', '-');
            $(this).on("click", function (e) {
                e.preventDefault();
                const that = $(this);
                that.parent().parent().remove();
            });
        });
    clonedComponent.find(".clone").each(
        function () {
            $(this).remove();
        });
    clonedComponent.find(".errorMsg").each(
        function () {
            $(this).html('');
            let id = $(this).attr('id');
            $(this).attr('id', id + '_' + next);
        });
    clonedComponent.find(".input_element").each(function () {
        let id = $(this).attr("id");
        $(this).attr('id', id + '_' + next);
        $(this).val("");
    });
    clonedComponent.find(".uploader").each(function () {
        let id = $(this).attr("id");
        $(this).attr('id', id + '_' + next);
        $(this).val("");
        $(this).on("change", function () {
            addUploadTrigger(this);
        });
    });

    //    clonedComponent.find("input[type='reset']").each(function () {
    //       let target = $(this).attr('target');
    //       console.log(target);
    //       $(this).attr('target', target + '_' + next);
    //    });
    clonedComponent.find(".optionalCompBtn").each(function () {
        $(this).attr('value', "✗");
        $(this).on("click", showComponentFields);
    });
    clonedComponent.attr("data-filename", null);
    $(set).append(clonedComponent);
    addAutoComplete(clonedComponent);
}





function isInteger(x: number): boolean {
    return (Number(x) !== NaN) && (x % 1 === 0);
}

function isValidDate(dateString: string): boolean | string { // codesmell: different kind of returns possibles
    let regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx))
        return false;  // Invalid format
    let d = new Date(dateString);
    if (isNaN(d.getTime()))
        return false; // Invalid date
    return d.toISOString().slice(0, 10) === dateString;
}



function getInputType(element: JQuery<HTMLElement>) {
    if (element.is("input")) { // .is is a jQuery method https://api.jquery.com/is/

        // console.log('elementtest', element, )
        return "input";
    } else {
        if (element.is('textarea')) {
            return "textarea";
        }
        else {
            if (element.is("select")) {
                return "select";
            }
            else {
                return "onbekend";
            }
        }
    }
}