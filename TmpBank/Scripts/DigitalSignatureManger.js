console.log("DigitalSig loading...");
var DigitalSignature;
(function (DigitalSignature) {
    let DigitalSignatureStatus;
    (function (DigitalSignatureStatus) {
        DigitalSignatureStatus[DigitalSignatureStatus["WAITING"] = 0] = "WAITING";
        DigitalSignatureStatus[DigitalSignatureStatus["TIMED_OUT"] = 1] = "TIMED_OUT";
        DigitalSignatureStatus[DigitalSignatureStatus["SUCCEEDED"] = 2] = "SUCCEEDED";
        DigitalSignatureStatus[DigitalSignatureStatus["FAILED"] = 3] = "FAILED";
    })(DigitalSignatureStatus || (DigitalSignatureStatus = {}));
    // when switching between different Auth methods what is gonna be the action applied to all inputs provided in inputsNames
    let Action;
    (function (Action) {
        Action[Action["DISABLE"] = 0] = "DISABLE";
        Action[Action["HIDE"] = 1] = "HIDE";
        Action[Action["NONE"] = 2] = "NONE";
    })(Action || (Action = {}));
    class DigitalSignatureManager {
        constructor() {
            this.inputsAndWrappers = {};
            this._isSigMethodSelected = false;
            this._hasInitialized = false;
        }
        static createInstance(wrapperId, interval, action, hasRequiredInput, authMethodsWrapperClasses, inputsWrapperClasses, submitWrapperClass, debugExpectedResult, debugWaitTime) {
            const instance = new DigitalSignatureManager();
            DigitalSignatureManager.wrapperIdCodeToInstance[wrapperId] = instance;
            instance.wrapperId = wrapperId;
            instance.interval = interval;
            instance.action = action;
            instance.hasRequiredInput = hasRequiredInput;
            instance.authMethodsWrapperClasses = authMethodsWrapperClasses;
            instance.inputsWrapperClasses = inputsWrapperClasses;
            instance.submitWrapperClass = submitWrapperClass;
            instance.debugWaitTime = debugWaitTime;
            instance.debugExpectedResult = debugExpectedResult;
        }
        static getInstance(wrapperID) {
            const instance = DigitalSignatureManager.wrapperIdCodeToInstance[wrapperID];
            instance.init();
            return instance;
        }
        init() {
            if (this._hasInitialized) {
                return;
            }
            this._hasInitialized = true;
            this.wrapper = document.querySelector("#" + this.wrapperId);
            this.submitBtn = this.wrapper.querySelector(!this.isClassNameNull(this.submitWrapperClass) ? this.submitWrapperClass + " input" : "[submitview]");
            if (!this.submitBtn) {
                this.wrapper.querySelector(this.submitWrapperClass + " button");
            }
            // setting up html inputs that define the sent data
            const sentRequiredInputClassName = this.inputsWrapperClasses.split(",")[1];
            this.requiredInput = this.hasRequiredInput && this.wrapper.querySelector(!this.isClassNameNull(sentRequiredInputClassName) ? sentRequiredInputClassName + " input" : "[requiredinput]");
            const sentInputViewClassName = this.inputsWrapperClasses.split(",")[0];
            Array.from(this.wrapper.querySelectorAll(!this.isClassNameNull(sentInputViewClassName) ?
                sentInputViewClassName + " input" :
                "[inputview]")).forEach((inputElement) => {
                this.inputsAndWrappers[inputElement.toString()] = { input: inputElement, wrapper: this._getWrapperForElement(inputElement) };
            });
            // setting up html radio button inputs that define the auth method
            const sentTargetAuthMethodClassName = this.authMethodsWrapperClasses.split(",")[0];
            this.targetAuthMethodRb = document.querySelector(!this.isClassNameNull(sentTargetAuthMethodClassName) ?
                sentTargetAuthMethodClassName + " input[type=radio]" :
                "[targetauthmethod]");
            this.digSigAuthMethodsWrapper = this._getWrapperForElement(this.targetAuthMethodRb);
            this.setAuthMethodsSelectedListeners();
            this.setSubmitListener();
        }
        setSubmitListener() {
            const savedOnSubmit = this.submitBtn.onclick;
            this.submitBtn.onclick = null;
            this.submitBtn.addEventListener("click", e => {
                const listeners = this._authManagerListeners;
                const debugExpectedResult = this.debugExpectedResult;
                const requiredInput = this.requiredInput;
                const waitTime = this.debugWaitTime;
                if (this._isSigMethodSelected) {
                    this.disableWrapper();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    $.ajax({
                        url: DigitalSignatureManager.baseApiUrl + "/InitiateDigSigVerification",
                        method: "POST",
                        data: `{ "expectedResult": "${debugExpectedResult}", data: "${requiredInput === null || requiredInput === void 0 ? void 0 : requiredInput.value}", waitTime: ${waitTime} }`,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: (response) => {
                            console.log(response.d);
                            this.requestCode = response.d;
                            this.checkRequestStatus();
                            listeners && typeof listeners.onRequestStarted === 'function' && listeners.onRequestStarted();
                        },
                        error: (errors) => {
                            console.log(errors);
                            this.enableWrapper();
                        },
                        /*               xhrFields: { withCrendtials: true },*/
                    });
                    return false;
                }
            });
            savedOnSubmit && this.submitBtn.addEventListener("click", (e) => {
                savedOnSubmit.call(e);
            });
            //  savedOnSubmit && this.submitBtn.addEventListener("click", savedOnSubmit);
        }
        setOnAuthEventsListener(authEvents) {
            this._authManagerListeners = authEvents;
        }
        setAuthMethodsSelectedListeners() {
            // setting the initial state
            const authMethodClassName = this.authMethodsWrapperClasses.split(",")[0];
            Array.from(this.digSigAuthMethodsWrapper.querySelectorAll(!this.isClassNameNull(authMethodClassName) ?
                authMethodClassName + " input[type=radio]" :
                "[authmethod]")).forEach((element) => {
                if (element.checked) {
                    this.onAuthFieldMethodChanged(this.targetAuthMethodRb, null, element);
                }
            });
            this.digSigAuthMethodsWrapper.addEventListener("change", (e) => { this.onAuthFieldMethodChanged(this.targetAuthMethodRb, e); });
        }
        // for fieldset authmethods html change event
        onAuthFieldMethodChanged(digSigRb, e, selectedElement) {
            this._isSigMethodSelected = digSigRb.checked;
            const element = selectedElement ? selectedElement : e.target;
            if (element instanceof HTMLInputElement && element.type === "radio") {
                this._authManagerListeners && typeof this._authManagerListeners.onAuthMethodChanged === 'function'
                    && this._authManagerListeners.onAuthMethodChanged(element);
                if (this.action != Action.NONE) {
                    if (this.hasRequiredInput) {
                        // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                        // so iterating over inputsnames enables it again
                        if (this.action == Action.DISABLE) {
                            if (this._isSigMethodSelected) {
                                this.requiredInput.removeAttribute("disabled");
                            }
                            else {
                                this.requiredInput.setAttribute("disabled", "true");
                            }
                        }
                        else if (this.action == Action.HIDE) {
                            const elementWrapper = this._getWrapperForElement(this.requiredInput);
                            if (this._isSigMethodSelected) {
                                elementWrapper.classList.remove("display-none");
                            }
                            else {
                                elementWrapper.classList.add("display-none");
                            }
                        }
                    }
                    for (const key in this.inputsAndWrappers) {
                        const inputAndWrapper = this.inputsAndWrappers[key];
                        if (this.action == Action.DISABLE) {
                            if (this._isSigMethodSelected && inputAndWrapper.input !== this.requiredInput) {
                                inputAndWrapper.input.setAttribute("disabled", "true");
                            }
                            else {
                                inputAndWrapper.input.removeAttribute("disabled");
                            }
                        }
                        else if (this.action == Action.HIDE) {
                            if (this._isSigMethodSelected && inputAndWrapper.input !== this.requiredInput) {
                                inputAndWrapper.wrapper.classList.add("display-none");
                            }
                            else {
                                inputAndWrapper.wrapper.classList.remove("display-none");
                            }
                        }
                    }
                }
            }
        }
        // goes up the DOM heierachy till it hits a class with ds-wrapper class or reaches wrapper element
        _getWrapperForElement(element) {
            let result = element;
            while (result && result != this.wrapper && !result.classList.contains("ds-wrapper")) {
                result = result.parentElement;
            }
            if (!result || !result.classList.contains("ds-wrapper")) {
                throw new Error(`'ds-wrapper' class on any of ancestors of this element is expected: ${element}`);
            }
            return result;
        }
        checkRequestStatus() {
            const listeners = this._authManagerListeners;
            $.ajax({
                url: DigitalSignatureManager.baseApiUrl + "/CheckDigSigStatus",
                method: "POST",
                data: `{ "requestCode": ${this.requestCode}}`,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (response) => {
                    if (response.d.Status == DigitalSignatureStatus.SUCCEEDED) {
                        listeners && typeof listeners.onSuccess === 'function' && listeners.onSuccess();
                    }
                    else if (response.d.Status == DigitalSignatureStatus.FAILED || response.d.Status == DigitalSignatureStatus.TIMED_OUT) {
                        listeners && typeof listeners.onFailed === 'function' && listeners.onFailed(response.d.Status);
                        this.enableWrapper();
                    }
                    else {
                        setTimeout(() => { this.checkRequestStatus(); }, this.interval);
                        listeners && typeof listeners.onRetry === 'function' && listeners.onRetry(response.d.Status);
                    }
                },
                error: (errors) => listeners && typeof listeners.onFailed === 'function' && listeners.onFailed(errors),
                //xhrFields: {
                //    withCredentials: true
                //}
            });
        }
        static addDefaultStyle() {
            const styleNode = document.createElement("style");
            styleNode.textContent = "";
            document.head.appendChild(styleNode);
        }
        static isFirstInstance() {
            return Object.keys(DigitalSignatureManager.wrapperIdCodeToInstance).length == 0;
        }
        isSigMethodSelected() {
            return this._isSigMethodSelected;
        }
        disableWrapper() {
            this.submitBtn.setAttribute("disabled", "true");
            this.wrapper.style.opacity = "0.3";
        }
        enableWrapper() {
            this.submitBtn.removeAttribute("disabled");
            this.wrapper.style.opacity = "1";
        }
        isClassNameNull(className) {
            return className === ".-null-";
        }
    }
    DigitalSignatureManager.baseApiUrl = "http://localhost:5288/DigitalSigService.asmx";
    DigitalSignatureManager.wrapperIdCodeToInstance = {};
    DigitalSignature.DigitalSignatureManager = DigitalSignatureManager;
})(DigitalSignature || (DigitalSignature = {}));
if (DigitalSignature.DigitalSignatureManager.isFirstInstance()) {
    console.log("adding default DigitalSignature control styles");
    DigitalSignature.DigitalSignatureManager.addDefaultStyle();
}
//# sourceMappingURL=DigitalSignatureManger.js.map