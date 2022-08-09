console.log("DigitalSig loading...");

//namespace DigitalSignature {
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

class DigitalSignatureManager {

    private wrapper: HTMLDivElement;
    private submitBtn: HTMLInputElement;
    public requiredInput: HTMLInputElement;
    private digSigAuthMethods: HTMLFieldSetElement;

    private requestCode: number;
    private wrapperId: string;
    private requiredInputId: string;
    private action: Action;
    private inputsNames: string[];
    private submitBtnId: string;
    private interval: number;
    private debugWaitTime?: number;
    private debugExpectedResult?: DigitalSignatureStatus;

    private static baseApiUrl = "http://localhost:5288/DigitalSigService.asmx";
    private static wrapperIdCodeToInstance: { [key: string]: DigitalSignatureManager } = {};

    private _isSigMethodSelected = false;

    public onSuccess: () => {};
    public onFailed: (status: DigitalSignatureStatus) => {};
    public onRetry: (status: DigitalSignatureStatus) => {};
    public onRequestStarted: () => {};
    public onAuthMethodChanged: (selectedAuthMethod) => {};


    public static createInstance(wrapperId: string,
        submitBtnId: string,
        interval: number,
        action: Action,
        requeiredInputId?: string,
        inputsNames?: string,
        debugExpectedResult?: DigitalSignatureStatus,
        debugWaitTime?: number) {

        const instance = new DigitalSignatureManager();
        DigitalSignatureManager.wrapperIdCodeToInstance[wrapperId] = instance;
        instance.wrapperId = wrapperId;
        instance.requiredInputId = requeiredInputId ? requeiredInputId : ".-required-input";
        instance.action = action;
        instance.inputsNames = inputsNames?.split(",");
        instance.submitBtnId = submitBtnId;
        instance.interval = interval;
        instance.debugWaitTime = debugWaitTime;
        instance.debugExpectedResult = debugExpectedResult;
        instance.init();

    }


    public static getInstance(wrapperID: string): DigitalSignatureManager {
        return DigitalSignatureManager.wrapperIdCodeToInstance[wrapperID];
    }

    private init() {

        this.wrapper = document.querySelector("#" + this.wrapperId) as HTMLDivElement;
        this.submitBtn = this.wrapper.querySelector("#" + this.submitBtnId) as HTMLInputElement;
        this.digSigAuthMethods = this.wrapper.querySelector(".-auth-method-selector") as HTMLFieldSetElement;
        this.requiredInput = this.wrapper.querySelector(
            this.requiredInputId[0] === "." ? this.requiredInputId : "#" + this.requiredInputId
        ) as HTMLInputElement;
        this.setAuthMethodsSelectedListeenrs();
        this.setSubmitListener();


    }

    private setSubmitListener() {
        this.submitBtn.addEventListener("click", (e) => {
            const onRequestStarted = this.onRequestStarted;
            const debugExpectedResult = this.debugExpectedResult;
            const requiredInput = this.requiredInput;
            const waitTime = this.debugWaitTime;
            this.disableWrapper();
            if (this._isSigMethodSelected) {
                e.preventDefault();
                e.stopPropagation();
                $.ajax({
                    url: DigitalSignatureManager.baseApiUrl + "/InitiateDigSigVerification",
                    method: "POST",
                    data: `{ "expectedResult": "${debugExpectedResult}", data: "${requiredInput.value}", waitTime: ${waitTime} }`,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: (response) => {
                        console.log(response.d);
                        this.requestCode = response.d;
                        this.checkRequestStatus();
                        onRequestStarted && typeof onRequestStarted === 'function' && onRequestStarted();
                    },
                    error: (errors) => {
                        console.log(errors);
                        this.enableWrapper();
                    },
                    /*               xhrFields: { withCrendtials: true },*/
                });
            }
        });
    }

    private setAuthMethodsSelectedListeenrs() {
        let digSigRb: HTMLInputElement = this.digSigAuthMethods.querySelector(".-dig-sig-rb") as HTMLInputElement;

        // setting the inital state
        (this.digSigAuthMethods.querySelectorAll("input[type = radio]") as NodeListOf<HTMLInputElement>).forEach((element) => {
            if (element.checked) {
                this.onAuthFieldMethodChanged(digSigRb, null, element);
            }
        })

        this.digSigAuthMethods.addEventListener("change", (e) => { this.onAuthFieldMethodChanged(digSigRb, e) });
    }

    // for fieldset authmethods html change event
    private onAuthFieldMethodChanged(digSigRb: HTMLInputElement, e?: Event, selectedElement?: HTMLInputElement) {
        this._isSigMethodSelected = digSigRb.checked;
        const element = selectedElement ? selectedElement : e.target as HTMLElement
        if (element instanceof HTMLInputElement && (element as HTMLInputElement).type === "radio") {
            this.onAuthMethodChanged && typeof this.onAuthMethodChanged === "function" && this.onAuthMethodChanged(element);

            if (this.action != Action.NONE) {



                // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                // so iterating over inputsnames enables it again
                if (this.action == Action.DISABLE) {
                    if (this._isSigMethodSelected) {
                        this.requiredInput.removeAttribute("disabled");
                    } else {
                        this.requiredInput.setAttribute("disabled", "true");

                    }
                } else if (this.action == Action.HIDE) {
                    if (this._isSigMethodSelected) {
                        this.requiredInput.classList.remove("display-none");
                    } else {
                        this.requiredInput.classList.add("display-none");
                    }
                }

                this.inputsNames.forEach(name => {
                    if (name === "[" || name === "]" || name === "") return
                    const inputElem = this.wrapper.querySelector(`[name="${name}"]`);
                    if (this.action == Action.DISABLE) {
                        if (this._isSigMethodSelected && inputElem !== this.requiredInput) {
                            inputElem.setAttribute("disabled", "true");
                        } else {
                            inputElem.removeAttribute("disabled");
                        }
                    } else if (this.action == Action.HIDE) {
                        if (this._isSigMethodSelected && inputElem !== this.requiredInput) {
                            inputElem.classList.add("display-none");
                        } else {
                            inputElem.classList.remove("display-none");
                        }
                    }
                });


            }
        }
    }

    private checkRequestStatus() {
        const onSuccess = this.onSuccess;
        const onFailed = this.onFailed;
        const onRetry = this.onRetry;
        $.ajax({
            url: DigitalSignatureManager.baseApiUrl + "/CheckDigSigStatus",
            method: "POST",
            data: `{ "requestCode": ${this.requestCode}}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: (response: any) => {
                if (response.d.Status == DigitalSignatureStatus.SUCCEEDED) {
                    onSuccess && typeof onSuccess === 'function' && onSuccess();
                } else if (response.d.Status == DigitalSignatureStatus.FAILED || response.d.Status == DigitalSignatureStatus.TIMED_OUT) {
                    onFailed && typeof onFailed === 'function' && onFailed(response.d.Status);
                    this.enableWrapper();
                } else {
                    setTimeout(() => { this.checkRequestStatus(); }, this.interval);
                    onRetry && typeof onRetry === 'function' && onRetry(response.d.Status)
                }
            },
            error: (errors: any) => onFailed && typeof onFailed === 'function' && onFailed(errors.d),
            //xhrFields: {
            //    withCredentials: true
            //}
        });
    }


    public isSigMethodSelected(): boolean {
        return this._isSigMethodSelected;
    }

    public disableWrapper() {
        this.wrapper.style.opacity = "0.3";
    }

    public enableWrapper() {
        this.wrapper.style.opacity = "1";
    }

}
//}


