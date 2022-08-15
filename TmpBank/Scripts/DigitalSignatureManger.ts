console.log("DigitalSig loading...");



namespace DigitalSignature {

    interface IAuthManagerEvents {
        onSuccess();
        onRequestTrackingDataReceived(data: any); // when response of hamoon/sign is retrieved
        onFailed(status: DigitalSignatureStatus); // when user rejects signing or when our request times out
        onCheckingRequestStatus(status: DigitalSignatureStatus); // when response of request to hamoon/inquiry is retrieved
        onRequestStarting(); // this event fires right before the request to hamoon/sign
        onAuthMethodChanged(selectedAuthMethodInput: HTMLInputElement); // when auth method changes, for instance changing dig-sig-method to username-pass-method
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
        input: HTMLInputElement;
        wrapper: HTMLElement
    }

    type DigitalSigRequestData = {
        endpoint: string,
        data: () => object
    }

    export class DigitalSignatureManager {

        private _wrapper: HTMLDivElement;
        private _submitBtn: HTMLInputElement;
        private _targetAuthMethodRb: HTMLInputElement;
        private _requiredInput: HTMLInputElement;
        private _digSigAuthMethodsWrapper: HTMLElement;
        private _inputsAndWrappers: InputAndWrapper[] = [];


        private _requestCode: number;
        private _action: Action;
        private _wrapperId: string;
        private _interval: number;
        private _hasRequiredInput: boolean;
        private _authMethodsWrapperClasses: string;// "auth-methods-class, target-auth-class" || -null-
        private _inputsWrapperClasses: string;// " inputs-class, required-input-class||-null-"
        private _submitWrapperClass: string;//   "class"

        private static _baseApiUrl = "darodivar";
        private static _wrapperIdCodeToInstance: { [key: string]: DigitalSignatureManager } = {};

        private _isSigMethodSelected = false;
        private _hasInitialized = false;

        private _authManagerListeners: IAuthManagerEvents;
        private _digitalSignatureInitRequestData: DigitalSigRequestData;
        private _digitalSignatureCheckStatusRequestData: DigitalSigRequestData;

        private _defaultDigitalSignatureInitRequestData: DigitalSigRequestData = {
            endpoint: `${DigitalSignatureManager._baseApiUrl}/digsig/init`,
            data: () => { return {} }
        };

        private _defaultDigitalSignatureCheckStatusRequestData: DigitalSigRequestData = {
            endpoint: `${DigitalSignatureManager._baseApiUrl}/digsig/check`,
            data: () => { return {} }

        };

        public static createInstance(
            wrapperId: string,
            interval: number,
            action: Action,
            hasRequiredInput: boolean,
            authMethodsWrapperClasses: string,
            inputsWrapperClasses: string,
            submitWrapperClass: string) {
            const instance = new DigitalSignatureManager();
            DigitalSignatureManager._wrapperIdCodeToInstance[wrapperId] = instance;
            instance._wrapperId = wrapperId;
            instance._interval = interval;
            instance._action = action;
            instance._hasRequiredInput = hasRequiredInput;
            instance._authMethodsWrapperClasses = authMethodsWrapperClasses;
            instance._inputsWrapperClasses = inputsWrapperClasses;
            instance._submitWrapperClass = submitWrapperClass;
        }


        public static getInstance(wrapperID: string): DigitalSignatureManager {
            const instance = DigitalSignatureManager._wrapperIdCodeToInstance[wrapperID];
            instance._init();
            return instance;
        }

        private _init() {
            if (this._hasInitialized) {
                return
            }
            this._hasInitialized = true;
            this._wrapper = document.querySelector("#" + this._wrapperId) as HTMLDivElement;
            this._submitBtn = this._wrapper.querySelector(!this._isClassNameNull(this._submitWrapperClass) ? this._submitWrapperClass + " input" : "[dssubmitview]") as HTMLInputElement;
            if (!this._submitBtn) {
                this._wrapper.querySelector(this._submitWrapperClass + " button");
            }
            // setting up html inputs that define the sent data
            const sentRequiredInputClassName = this._inputsWrapperClasses.split(",")[1];
            this._requiredInput = this._hasRequiredInput && this._wrapper.querySelector(
                !this._isClassNameNull(sentRequiredInputClassName) ? sentRequiredInputClassName + " input" : "[dsrequiredinput]"
            ) as HTMLInputElement;

            const sentInputViewClassName = this._inputsWrapperClasses.split(",")[0];

            this._wrapper.querySelectorAll(
                !this._isClassNameNull(sentInputViewClassName) ?
                    sentInputViewClassName + " input" :
                    "[dsinputview]"
            ).forEach((inputElement: HTMLInputElement) => {
                this._inputsAndWrappers.push({ input: inputElement, wrapper: this._getWrapperForElement(inputElement) });
            });

            // setting up html radio button inputs that define the auth method
            const sentTargetAuthMethodClassName = this._authMethodsWrapperClasses.split(",")[0];
            this._targetAuthMethodRb = this._wrapper.querySelector(
                !this._isClassNameNull(sentTargetAuthMethodClassName) ?
                    sentTargetAuthMethodClassName + " input[type=radio]" :
                    "[dstargetauthmethod]") as HTMLInputElement;
            this._digSigAuthMethodsWrapper = this._getWrapperForElement(this._targetAuthMethodRb) as HTMLElement;
            this._setAuthMethodsSelectedListeners();

            this._setSubmitListener();
        }

        private _setSubmitListener() {
            const savedOnClick = this._submitBtn.onclick;
            this._submitBtn.onclick = null;
            savedOnClick && this._submitBtn.removeEventListener("click", savedOnClick);
            this._submitBtn.addEventListener("click", e => {
                const listeners = this._authManagerListeners;
                if (this._isSigMethodSelected) {
                    this.disableWrapper();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    listeners && typeof listeners.onRequestStarting === 'function' && listeners.onRequestStarting();
                    $.ajax({
                        url: this._digitalSignatureInitRequestData?.endpoint ? this._digitalSignatureInitRequestData.endpoint : this._defaultDigitalSignatureInitRequestData.endpoint,
                        method: "POST",
                        data: JSON.stringify(this._digitalSignatureInitRequestData?.data ? this._digitalSignatureInitRequestData.data : this._defaultDigitalSignatureInitRequestData.data),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: (response) => {
                            console.log(response.d);
                            this._requestCode = response.d;
                            listeners && typeof listeners.onRequestTrackingDataReceived === 'function' && listeners.onRequestTrackingDataReceived(response);
                            this._checkRequestStatus();
                        },
                        error: (errors) => {
                            console.log(errors);
                            this.enableWrapper();
                        },
                        /*               xhrFields: { withCrendtials: true },*/
                    });
                }
                return false;
            });
            savedOnClick && (this._submitBtn.onclick = savedOnClick);
        }

        public setOnAuthEventsListener(authEventsImpl: IAuthManagerEvents) {
            this._authManagerListeners = authEventsImpl;
        }

        public setDigitalSignatureInitRequestsData(digitalSigRequestsData: DigitalSigRequestData) {
            this._digitalSignatureInitRequestData = digitalSigRequestsData;
        }

        public setDigitalSignatureCheckStatusRequestsData(digitalSigRequestsData: DigitalSigRequestData) {
            this._digitalSignatureCheckStatusRequestData = digitalSigRequestsData;
        }


        private _setAuthMethodsSelectedListeners() {
            // setting the initial state
            const authMethodClassName = this._authMethodsWrapperClasses.split(",")[0];
            (this._digSigAuthMethodsWrapper.querySelectorAll(
                !this._isClassNameNull(authMethodClassName) ?
                    authMethodClassName + " input[type=radio]" :
                    "[dsauthmethod]") as NodeListOf<HTMLInputElement>).forEach((element) => {
                        if (element.checked) {
                            this._onAuthFieldMethodChanged(this._targetAuthMethodRb, null, element);
                        }
                    })

            this._digSigAuthMethodsWrapper.addEventListener("change", (e) => { this._onAuthFieldMethodChanged(this._targetAuthMethodRb, e) });
        }

        // for fieldset authmethods html change event
        private _onAuthFieldMethodChanged(digSigRb: HTMLInputElement, e?: Event, selectedElement?: HTMLInputElement) {
            this._isSigMethodSelected = digSigRb.checked;
            const element = selectedElement ? selectedElement : e.target as HTMLElement
            if (element instanceof HTMLInputElement && (element as HTMLInputElement).type === "radio") {
                this._authManagerListeners && typeof this._authManagerListeners.onAuthMethodChanged === 'function'
                    && this._authManagerListeners.onAuthMethodChanged(element);

                if (this._action != Action.NONE) {


                    if (this._hasRequiredInput) {
                        // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                        // so iterating over inputsnames enables it again
                        if (this._action == Action.DISABLE) {
                            if (this._isSigMethodSelected) {
                                this._requiredInput.removeAttribute("disabled");
                            } else {
                                this._requiredInput.setAttribute("disabled", "true");

                            }
                        } else if (this._action == Action.HIDE) {
                            const elementWrapper = this._getWrapperForElement(this._requiredInput) as HTMLElement;
                            if (this._isSigMethodSelected) {
                                elementWrapper.classList.remove("display-none");
                            } else {
                                elementWrapper.classList.add("display-none");
                            }
                        }
                    }

                    for (const { input, wrapper } of this._inputsAndWrappers) {
                        if (this._action == Action.DISABLE) {
                            if (this._isSigMethodSelected && input !== this._requiredInput) {
                                input.setAttribute("disabled", "true");
                            } else {
                                input.removeAttribute("disabled");
                            }
                        } else if (this._action == Action.HIDE) {
                            if (this._isSigMethodSelected && input !== this._requiredInput) {
                                wrapper.classList.add("display-none");
                            } else {
                                wrapper.classList.remove("display-none");
                            }
                        }
                    }
                }
            }
        }

        // goes up the DOM heierachy till it hits a class with ds-wrapper class or reaches wrapper element
        private _getWrapperForElement(element: HTMLElement): HTMLElement {
            if (!element) {
                throw new Error("element searching for 'ds-wrapper' does not exist. you may have wrong referenced/template structure");
            }
            let result = element;
            while (result && result != this._wrapper && !result.classList.contains("ds-wrapper")) {
                result = result.parentElement;
            }
            if (!result || !result.classList.contains("ds-wrapper")) {
                throw new Error(`'ds-wrapper' class on any of ancestors of this element is expected: ${element}`);
            }
            return result;
        }

        private _checkRequestStatus() {
            $.ajax({
                url: this._digitalSignatureCheckStatusRequestData?.endpoint ? this._digitalSignatureCheckStatusRequestData.endpoint : this._defaultDigitalSignatureCheckStatusRequestData.endpoint,
                method: "POST",
                data: JSON.stringify(this._digitalSignatureCheckStatusRequestData?.data ? this._digitalSignatureCheckStatusRequestData.data : this._defaultDigitalSignatureCheckStatusRequestData.data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (response: any) => {
                    if (response.d.Status == DigitalSignatureStatus.SUCCEEDED) {
                        this._authManagerListeners && typeof this._authManagerListeners.onSuccess === 'function' && this._authManagerListeners.onSuccess();
                    } else if (response.d.Status == DigitalSignatureStatus.FAILED || response.d.Status == DigitalSignatureStatus.TIMED_OUT) {
                        this._authManagerListeners && typeof this._authManagerListeners.onFailed === 'function' && this._authManagerListeners.onFailed(response.d.Status);
                        this.enableWrapper();
                    } else {
                        setTimeout(() => { this._checkRequestStatus(); }, this._interval);
                        this._authManagerListeners && typeof this._authManagerListeners.onCheckingRequestStatus === 'function' && this._authManagerListeners.onCheckingRequestStatus(response.d.Status)
                    }
                },
                error: (errors: any) => this._authManagerListeners && typeof this._authManagerListeners.onFailed === 'function' && this._authManagerListeners.onFailed(errors),
                //xhrFields: {
                //    withCredentials: true
                //}
            });
        }

        public static addDefaultStyle() {
            const styleNode = document.createElement("style");
            styleNode.textContent = "";
            document.head.appendChild(styleNode);
        }

        public static isFirstInstance() {
            return Object.keys(DigitalSignatureManager._wrapperIdCodeToInstance).length == 0;
        }


        public isSigMethodSelected(): boolean {
            return this._isSigMethodSelected;
        }

        public disableWrapper() {
            // @ts-ignore
            backgroundPopupCommon();
        }

        public enableWrapper() {
            setTimeout(() => {
                console.warn("remove timeout for enableWrapper in production");
                // @ts-ignore
                UndobackgroundPopup();
            }, 5000);

        }

        private _isClassNameNull(className: string): boolean {
            return className === ".-null-";
        }

    }

}
