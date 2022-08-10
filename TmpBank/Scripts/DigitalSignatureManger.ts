console.log("DigitalSig loading...");



namespace DigitalSignature {

    interface IAuthManagerEvents {
        onSuccess();
        onFailed(status: DigitalSignatureStatus);
        onRetry(status: DigitalSignatureStatus);
        onRequestStarted();
        onAuthMethodChanged(selectedAuthMethodInput: HTMLInputElement);
    }

    enum DigitalSignatureStatus {
        WAITING = 0,
        TIMED_OUT,
        SUCCEEDED,
        FAILED,
    }


    // when switching between different Auth methods what is gonna be the action applied to all inputs provided in inputsNames
    enum Action {
        DISABLE = 0,
        HIDE,
        NONE
    }
    type InputAndWrapper = {
        input: HTMLInputElement
        wrapper: HTMLElement
    }

    export class DigitalSignatureManager {

        private wrapper: HTMLDivElement;
        private submitBtn: HTMLInputElement;
        private targetAuthMethodRb: HTMLInputElement;
        private requiredInput: HTMLInputElement;
        private digSigAuthMethodsWrapper: HTMLElement;
        private inputsAndWrappers: { [key: string]: InputAndWrapper } = {};


        private requestCode: number;
        private action: Action;
        private wrapperId: string;
        private submitBtnId: string;
        private interval: number;
        private hasRequiredInput: boolean;
        private debugWaitTime?: number;
        private debugExpectedResult?: DigitalSignatureStatus;

        private static baseApiUrl = "http://localhost:5288/DigitalSigService.asmx";
        private static wrapperIdCodeToInstance: { [key: string]: DigitalSignatureManager } = {};

        private _isSigMethodSelected = false;
        private _hasInitialized = false;

        private _authManagerListeners: IAuthManagerEvents;

        public static createInstance(
            wrapperId: string,
            submitBtnId: string,
            interval: number,
            action: Action,
            hasRequiredInput: boolean,
            debugExpectedResult?: DigitalSignatureStatus,
            debugWaitTime?: number) {
            const instance = new DigitalSignatureManager();
            DigitalSignatureManager.wrapperIdCodeToInstance[wrapperId] = instance;
            instance.wrapperId = wrapperId
            instance.action = action;
            instance.submitBtnId = submitBtnId;
            instance.hasRequiredInput = hasRequiredInput;
            instance.interval = interval;
            instance.debugWaitTime = debugWaitTime;
            instance.debugExpectedResult = debugExpectedResult;
        }


        public static getInstance(wrapperID: string): DigitalSignatureManager {
            const instance = DigitalSignatureManager.wrapperIdCodeToInstance[wrapperID];
            instance.init();
            return instance;
        }

        private init() {
            if (this._hasInitialized) {
                return
            }
            this._hasInitialized = true;
            this.wrapper = document.querySelector("#" + this.wrapperId) as HTMLDivElement;
            this.submitBtn = this.wrapper.querySelector("#" + this.submitBtnId) as HTMLInputElement;

            // setting up html inputs that define the sent data
            this.requiredInput = this.hasRequiredInput && this.wrapper.querySelector(
                "[requiredinput]"
            ) as HTMLInputElement;
            this.wrapper.querySelectorAll("[inputview]").forEach((inputElement: HTMLInputElement) => {
                this.inputsAndWrappers[inputElement.getAttribute("name")] = { input: inputElement, wrapper: this._getWrapperForElement(inputElement) };
            });

            // setting up html radio button inputs that define the auth method
            this.targetAuthMethodRb = document.querySelector(`[targetauthmethod]`)
            this.digSigAuthMethodsWrapper = this._getWrapperForElement(this.targetAuthMethodRb) as HTMLElement;
            this.setAuthMethodsSelectedListeners();

            this.setSubmitListener();
        }

        private setSubmitListener() {
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
                        data: `{ "expectedResult": "${debugExpectedResult}", data: "${requiredInput?.value}", waitTime: ${waitTime} }`,
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

        public setOnAuthEventsListener(authEvents: IAuthManagerEvents) {
            this._authManagerListeners = authEvents;
        }

        private setAuthMethodsSelectedListeners() {
            // setting the inital state
            (this.digSigAuthMethodsWrapper.querySelectorAll("input[type = radio]") as NodeListOf<HTMLInputElement>).forEach((element) => {
                if (element.checked) {
                    this.onAuthFieldMethodChanged(this.targetAuthMethodRb, null, element);
                }
            })

            this.digSigAuthMethodsWrapper.addEventListener("change", (e) => { this.onAuthFieldMethodChanged(this.targetAuthMethodRb, e) });
        }

        // for fieldset authmethods html change event
        private onAuthFieldMethodChanged(digSigRb: HTMLInputElement, e?: Event, selectedElement?: HTMLInputElement) {
            this._isSigMethodSelected = digSigRb.checked;
            const element = selectedElement ? selectedElement : e.target as HTMLElement
            if (element instanceof HTMLInputElement && (element as HTMLInputElement).type === "radio") {
                this._authManagerListeners && typeof this._authManagerListeners.onAuthMethodChanged === 'function'
                    && this._authManagerListeners.onAuthMethodChanged(element);

                if (this.action != Action.NONE) {


                    if (this.hasRequiredInput) {
                        // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                        // so iterating over inputsnames enables it again
                        if (this.action == Action.DISABLE) {
                            if (this._isSigMethodSelected) {
                                this.requiredInput.removeAttribute("disabled");
                            } else {
                                this.requiredInput.setAttribute("disabled", "true");

                            }
                        } else if (this.action == Action.HIDE) {
                            const elementWrapper = this._getWrapperForElement(this.requiredInput) as HTMLElement;
                            if (this._isSigMethodSelected) {
                                elementWrapper.classList.remove("display-none");
                            } else {
                                elementWrapper.classList.add("display-none");
                            }
                        }
                    }

                    for (const key in this.inputsAndWrappers) {
                        const inputAndWrapper = this.inputsAndWrappers[key];
                        if (this.action == Action.DISABLE) {
                            if (this._isSigMethodSelected && inputAndWrapper.input !== this.requiredInput) {
                                inputAndWrapper.input.setAttribute("disabled", "true");
                            } else {
                                inputAndWrapper.input.removeAttribute("disabled");
                            }
                        } else if (this.action == Action.HIDE) {
                            if (this._isSigMethodSelected && inputAndWrapper.input !== this.requiredInput) {
                                inputAndWrapper.wrapper.classList.add("display-none");
                            } else {
                                inputAndWrapper.wrapper.classList.remove("display-none");
                            }
                        }
                    }
                }
            }
        }

        // goes up the DOM heierachy till it hits a class with -wrapper class or reaches wrapper element
        private _getWrapperForElement(element: HTMLElement): HTMLElement {
            let result = element;
            while (result && result != this.wrapper && !result.classList.contains("-wrapper")) {
                result = result.parentElement;
            }
            if (!result || !result.classList.contains("-wrapper")) {
                throw new DOMException(`'-wrapper' class on any of ancestors of this element is expected: ${element}`);
            }
            return result;
        }

        private checkRequestStatus() {
            const listeners = this._authManagerListeners;
            $.ajax({
                url: DigitalSignatureManager.baseApiUrl + "/CheckDigSigStatus",
                method: "POST",
                data: `{ "requestCode": ${this.requestCode}}`,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (response: any) => {
                    if (response.d.Status == DigitalSignatureStatus.SUCCEEDED) {
                        listeners && typeof listeners.onSuccess === 'function' && listeners.onSuccess();
                    } else if (response.d.Status == DigitalSignatureStatus.FAILED || response.d.Status == DigitalSignatureStatus.TIMED_OUT) {
                        listeners && typeof listeners.onFailed === 'function' && listeners.onFailed(response.d.Status);
                        this.enableWrapper();
                    } else {
                        setTimeout(() => { this.checkRequestStatus(); }, this.interval);
                        listeners && typeof listeners.onRetry === 'function' && listeners.onRetry(response.d.Status)
                    }
                },
                error: (errors: any) => listeners && typeof listeners.onFailed === 'function' && listeners.onFailed(errors),
                //xhrFields: {
                //    withCredentials: true
                //}
            });
        }

        public static addDefaultStyle() {
            document.head.append("<style></style>");
        }

        public static isFirstInstance() {
            return Object.keys(DigitalSignatureManager.wrapperIdCodeToInstance).length == 0;
        }


        public isSigMethodSelected(): boolean {
            return this._isSigMethodSelected;
        }

        public disableWrapper() {
            this.submitBtn.setAttribute("disabled", "true");
            this.wrapper.style.opacity = "0.3";
        }

        public enableWrapper() {
            this.submitBtn.removeAttribute("disabled");
            this.wrapper.style.opacity = "1";
        }

    }

}

if (DigitalSignature.DigitalSignatureManager.isFirstInstance()) {
    console.log("adding default DigitalSignature control styles")
    DigitalSignature.DigitalSignatureManager.addDefaultStyle();
}
