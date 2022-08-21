console.log("DigitalSig loading...");
// todo: typescript tsconfig errors are not on point


namespace DigitalSignature {

    interface IAuthManagerEvents {
        onSuccess(data: any);
        onRequestTrackingDataReceived(data: any); // when response of hamoon/sign is retrieved
        onFailed(data: any); // when user rejects signing or when our request times out
        onCheckingRequestStatus(data: any); // when response of request to hamoon/inquiry is retrieved
        onRequestStarting(); // this event fires right before the request to hamoon/sign
        onAuthMethodChanged(selectedAuthMethodInput: HTMLInputElement, lastSelectedAuthMethodInput: HTMLInputElement); // when auth method changes, for instance changing dig-sig-method to username-pass-method
    }

    enum DigitalSignatureStatus {
        WAITING = 0,
        TIMED_OUT,
        SUCCEEDED,
        FAILED
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
        endpoint: () => string,
        data: () => object
    }

    type ActionValueAndMethod = {
        value: string
        effect: () => object
    }

    export class ActionsToEfects {

        private _actionsToEffects: { [key in Action]?: (currentSelectedAuthMethod: HTMLInputElement) => any | null } = {
            [Action.NONE]: (currentSelectedAuthMethod: HTMLInputElement) => { },
            [Action.DISABLE]: (currentSelectedAuthMethod: HTMLInputElement) => { return this._disableAction(currentSelectedAuthMethod) },
            [Action.HIDE]: (currentSelectedAuthMethod: HTMLInputElement) => { return this._hideAction(currentSelectedAuthMethod) }
            // add you custom actions and effects here, dont forget to add [Action.NAME] here and in DigitalSigControl.ascx.vb
        };

        constructor(private _digitalSigManager: DigitalSignature.DigitalSignatureManager) {
        }


        private _hideAction(currentSelectedAuthMethod: HTMLInputElement) {
            if (this._digitalSigManager.hasRequiredInput()) {
                // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                // so iterating over inputsnames enables it again

                const elementWrapper = this._digitalSigManager.getWrapperForElementWithClass(this._digitalSigManager.getRequiredInput()) as HTMLElement;
                if (this._digitalSigManager.isDigSigMethodSelected()) {
                    elementWrapper.classList.remove("ds-display-none");
                } else {
                    elementWrapper.classList.add("ds-display-none");
                }

            }

            for (const { input, wrapper } of this._digitalSigManager.getInputsAndWrappers()) {
                if (this._digitalSigManager.isDigSigMethodSelected() && input !== this._digitalSigManager.getRequiredInput()) {
                    wrapper.classList.add("ds-display-none");
                } else {
                    wrapper.classList.remove("ds-display-none");
                }
            }

        }

        private _disableAction(currentSelectedAuthMethod: HTMLInputElement) {
            if (this._digitalSigManager.hasRequiredInput()) {
                // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                // so iterating over inputsnames enables it again
                const elementWrapper = this._digitalSigManager.getWrapperForElementWithClass(this._digitalSigManager.getRequiredInput()) as HTMLElement;
                if (this._digitalSigManager.isDigSigMethodSelected()) {
                    elementWrapper.classList.remove("ds-display-none");
                } else {
                    elementWrapper.classList.add("ds-display-none");
                }

            }

            for (const { input, wrapper } of this._digitalSigManager.getInputsAndWrappers()) {
                if (this._digitalSigManager.isDigSigMethodSelected() && input !== this._digitalSigManager.getRequiredInput()) {
                    input.setAttribute("disabled", "true");
                } else {
                    input.removeAttribute("disabled");
                }
            }
        }

        public apply(currentSelectedAuthMethod: HTMLInputElement) {
            const effect = this._actionsToEffects[this._digitalSigManager.getCurrentAction()];
            if (effect) {
                return effect(currentSelectedAuthMethod);
            }
            return null;
        }
    }

    export class DigitalSignatureManager {

        private _wrapper: HTMLDivElement;
        private _submitBtn: HTMLInputElement;
        private _lastSelectedAuthMethodRb: HTMLInputElement;
        private _targetAuthMethodRb: HTMLInputElement;
        private _requiredInput: HTMLInputElement;
        private _inputsAndWrappers: InputAndWrapper[] = [];

        private _actionsToEffects: ActionsToEfects;

        private _requestCode: number;
        private _currentAction: Action;
        private _wrapperId: string;
        private _interval: number;
        private _hasRequiredInput: boolean;
        private _targetAuthMethodWrapperClass: string;// "auth-methods-class || -null-
        private _inputsWrapperClasses: string;// "inputs-class, required-input-class"||-null-"
        private _submitWrapperClass: string;//   "class" || "-null-"

        private static _baseApiUrl = "http://localhost:5288/api";
        private static _wrapperIdToDigSigManagerInstance: { [key: string]: DigitalSignatureManager } = {};

        private _isDigSigMethodSelected = false;
        private _hasInitialized = false;

        private _authManagerListeners: IAuthManagerEvents;
        private _digitalSignatureInitRequestData: DigitalSigRequestData;
        private _digitalSignatureCheckStatusRequestData: DigitalSigRequestData;

        private _defaultDigitalSignatureInitRequestData: DigitalSigRequestData = {
            endpoint: () => `${DigitalSignatureManager._baseApiUrl}/digitalsig/init`,
            data: () => { return {} }
        };

        private _defaultDigitalSignatureCheckStatusRequestData: DigitalSigRequestData = {
            endpoint: () => `${DigitalSignatureManager._baseApiUrl}/digitalsig/check`,
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
            DigitalSignatureManager._wrapperIdToDigSigManagerInstance[wrapperId] = instance;
            instance._wrapperId = wrapperId;
            instance._interval = interval;
            instance._currentAction = action;
            instance._hasRequiredInput = hasRequiredInput;
            instance._targetAuthMethodWrapperClass = authMethodsWrapperClasses;
            instance._inputsWrapperClasses = inputsWrapperClasses;
            instance._submitWrapperClass = submitWrapperClass;
        }


        public static getInstance(wrapperID: string): DigitalSignatureManager {
            const instance = DigitalSignatureManager._wrapperIdToDigSigManagerInstance[wrapperID];
            return instance;
        }

        public init() {
            if (this._hasInitialized) {
                return
            }
            this._hasInitialized = true;
            this._actionsToEffects = new ActionsToEfects(this);

            this._wrapper = document.querySelector("#" + this._wrapperId) as HTMLDivElement;
            this._submitBtn = this._wrapper.querySelector(!this._isClassNameNull(this._submitWrapperClass) ? this._submitWrapperClass + " input" : "[dssubmitview]") as HTMLInputElement;
            if (!this._submitBtn) {
                this._wrapper.querySelector(this._submitWrapperClass + " button");
            }

            // setting up html inputs that define the sent data
            const sentRequiredInputClassName = this._inputsWrapperClasses.split(",")[1];
            if (this._hasRequiredInput) {
                this._requiredInput = this._wrapper.querySelector(
                    !this._isClassNameNull(sentRequiredInputClassName) ? sentRequiredInputClassName + " input" : "[dsrequiredinput]"
                ) as HTMLInputElement;
            }

            const sentInputViewClassName = this._inputsWrapperClasses.split(",")[0];

            Array.prototype.forEach.call(this._wrapper.querySelectorAll(
                !this._isClassNameNull(sentInputViewClassName) ?
                    sentInputViewClassName + " input" :
                    "[dsinputview]"
            ), (inputElement: HTMLInputElement) => {
                this._inputsAndWrappers.push({ input: inputElement, wrapper: this.getWrapperForElementWithClass(inputElement) });
            });

            // setting up html radio button inputs that define the auth method
            this._targetAuthMethodRb = this._wrapper.querySelector(
                !this._isClassNameNull(this._targetAuthMethodWrapperClass) ?
                    this._targetAuthMethodWrapperClass + " input[type=radio]" :
                    "[dstargetauthmethod]") as HTMLInputElement;

            this._setAuthMethodsRadioBtnListeners();

            this._setSubmitListener();
        }

        private _setSubmitListener() {
            const savedOnClick = this._submitBtn.onclick;
            this._submitBtn.onclick = null;
            savedOnClick && this._submitBtn.removeEventListener("click", savedOnClick);
            this._submitBtn.addEventListener("click", e => {
                if (this._isDigSigMethodSelected) {
                    this.disableWrapper();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    this._startDigitalSigProcess();
                    return false;
                }
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

        private _startDigitalSigProcess() {
            this._authManagerListeners && typeof this._authManagerListeners.onRequestStarting === 'function' && this._authManagerListeners.onRequestStarting();
            $.ajax({
                url: this._digitalSignatureInitRequestData?.endpoint() ?? this._defaultDigitalSignatureInitRequestData.endpoint(),
                method: "POST",
                data: JSON.stringify(this._digitalSignatureInitRequestData?.data ?? this._defaultDigitalSignatureInitRequestData.data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (response) => {
                    this._requestCode = response.Code;
                    this._authManagerListeners && typeof this._authManagerListeners.onRequestTrackingDataReceived === 'function' && this._authManagerListeners.onRequestTrackingDataReceived(response);
                    this._checkRequestStatus();
                },
                error: (errors: any) => {
                    this.enableWrapper();
                    this._authManagerListeners && typeof this._authManagerListeners.onFailed === 'function' && this._authManagerListeners.onFailed(errors);
                },
                xhrFields: {
                    withCredentials: true
                }
            });
        }
        // listens to changes in a wrapper that is the closest ancestor with a node.type=fieldset and if that doesn't exist, it will search for the closest ancestor with className="ds-wrapper"
        private _setAuthMethodsRadioBtnListeners() {
            if (!this._targetAuthMethodRb) {
                return
            }
            // setting the initial state
            const allAuthMethodsWrapper = this.getWrapperForElementWithNodeName(this._targetAuthMethodRb, "fieldset") ?? this.getWrapperForElementWithClass(this._targetAuthMethodRb, "ds-wrapper");

            Array.prototype.some.call((allAuthMethodsWrapper.querySelectorAll("input[type=radio]") as NodeListOf<HTMLInputElement>), (element) => {
                if (element.checked) {
                    this._onAuthFieldMethodChanged(this._targetAuthMethodRb, null, element);
                    return true;
                }
                return false;
            });

            allAuthMethodsWrapper.addEventListener("change", (e) => { this._onAuthFieldMethodChanged(this._targetAuthMethodRb, e) });
        }

        // for fieldset/div[class has AuthMethodsWrapperClass] html change event
        private _onAuthFieldMethodChanged(digSigRb: HTMLInputElement, e?: Event, selectedElement?: HTMLInputElement) {
            this._isDigSigMethodSelected = digSigRb.checked;
            const element = selectedElement ? selectedElement : e.target as HTMLElement;
            if (element instanceof HTMLInputElement && (element as HTMLInputElement).type === "radio") {

                // we check the nullability of the event as well because inital call to this function is not an actual event caused by clicking: see _setAuthMethodsRadioBtnListeners
                e && this._authManagerListeners && typeof this._authManagerListeners.onAuthMethodChanged === 'function'
                    && this._authManagerListeners.onAuthMethodChanged(element, this._lastSelectedAuthMethodRb);

                this._lastSelectedAuthMethodRb = element;
                this._actionsToEffects.apply(selectedElement);
            }
        }



        private _checkRequestStatus() {
            $.ajax({
                url: this._digitalSignatureCheckStatusRequestData?.endpoint() ?? this._defaultDigitalSignatureCheckStatusRequestData.endpoint(),
                method: "POST",
                data: JSON.stringify(this._digitalSignatureCheckStatusRequestData?.data ?? this._defaultDigitalSignatureCheckStatusRequestData.data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (response: any) => {
                    if (response.Status == DigitalSignatureStatus.SUCCEEDED) {
                        this.enableWrapper();
                        this._authManagerListeners && typeof this._authManagerListeners.onSuccess === 'function' && this._authManagerListeners.onSuccess(response);
                    } else if (response.Status == DigitalSignatureStatus.FAILED || response.Status == DigitalSignatureStatus.TIMED_OUT) {
                        this.enableWrapper();
                        this._authManagerListeners && typeof this._authManagerListeners.onFailed === 'function' && this._authManagerListeners.onFailed(response);
                    } else {
                        this._authManagerListeners && typeof this._authManagerListeners.onCheckingRequestStatus === 'function' && this._authManagerListeners.onCheckingRequestStatus(response.Status)
                        setTimeout(() => { this._checkRequestStatus(); }, this._interval);
                    }
                },
                error: (errors: any) => {
                    this.enableWrapper();
                    this._authManagerListeners && typeof this._authManagerListeners.onFailed === 'function' && this._authManagerListeners.onFailed(errors);
                },
                xhrFields: {
                    withCredentials: true
                }
            });
        }

        private _isClassNameNull(className: string): boolean {
            return className === ".-null-";
        }

        // goes up the DOM heierachy till it hits a class with ds-wrapper class or reaches wrapper element
        public getWrapperForElementWithClass(element: HTMLElement, className: string = "ds-wrapper"): HTMLElement {
            if (!element) {
                throw new Error(`element searching for ${className} does not exist. you may have wrong referenced/template structure`);
            }
            let result = element;
            while (result && result != this._wrapper && !result.classList.contains(className)) {
                result = result.parentElement;
            }
            if (!result || !result.classList.contains("ds-wrapper")) {
                throw new Error(`${className} class on any of ancestors of this element is expected: ${element}`);
            }
            return result;
        }

        // goes up the DOM heierachy till it hits an element same as param elementName
        public getWrapperForElementWithNodeName(element: HTMLElement, wrapperNodeName: string): HTMLElement {
            wrapperNodeName = wrapperNodeName.toUpperCase();
            if (!element) {
                throw new Error(`element searching for node type: ${wrapperNodeName} does not exist. you may have wrong referenced/template structure`);
            }
            let result = element;
            while (result && result != this._wrapper && result.nodeName != wrapperNodeName) {
                result = result.parentElement;
            }
            if (!result || result.nodeName != wrapperNodeName) {
                throw new Error(`node type number: ${wrapperNodeName} on any of ancestors of this element is expected: ${element}`);
            }
            return result;
        }

        public static addDefaultStyle() {
            if (this.isFirstInstance()) {
                const styleNode = document.createElement("style");
                styleNode.textContent = ""; // or add a src 
                document.head.appendChild(styleNode);
            }
        }

        public static isFirstInstance() {
            return Object.keys(DigitalSignatureManager._wrapperIdToDigSigManagerInstance).length == 0;
        }

        public isDigSigMethodSelected(): boolean {
            return this._isDigSigMethodSelected;
        }

        public disableWrapper() {
            // @ts-ignore
            // backgroundPopupCommon();
            this._wrapper.style.opacity = "0.3";
        }

        public enableWrapper() {
            // setTimeout(() => {
            //     console.warn("remove timeout for enableWrapper in production");
            //     // @ts-ignore
            ////     UndobackgroundPopup();
            //     this._wrapper.style.opacity = 1;
            // }, 5000);
            this._wrapper.style.opacity = "1";
        }

        public setAction(action: Action) {
            this._currentAction = action;
        }

        public getCurrentAction() {
            return this._currentAction;
        }

        public getRequiredInput() {
            return this._requiredInput;
        }

        public getInputsAndWrappers() {
            return this._inputsAndWrappers;
        }

        public hasRequiredInput() {
            return this._hasRequiredInput;
        }

    }

}
