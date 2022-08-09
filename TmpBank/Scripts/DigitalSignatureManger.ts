console.log("DigitalSig loading...");

//namespace DigitalSignature {
enum DigitalSignatureStatus {
    WAITING = 0,
    TIMED_OUT,
    SUCCEEDED,
    FAILED,
}
class DigitalSignatureManager {

    private wrapper: HTMLDivElement;
    private submitBtn: HTMLInputElement;
    public requiredInput: HTMLInputElement;
    private digSigAuthMethods: HTMLFieldSetElement;

    private requestCode: number;
    private wrapperId: string;
    private requiredInputId: string;
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
        requeiredInputId?: string,
        debugExpectedResult?: DigitalSignatureStatus,
        debugWaitTime?: number) {

        const instance = new DigitalSignatureManager();
        DigitalSignatureManager.wrapperIdCodeToInstance[wrapperId] = instance;
        instance.wrapperId = wrapperId;
        instance.requiredInputId = requeiredInputId ? ".-required-input" : requeiredInputId;
        instance.submitBtnId = submitBtnId;
        instance.interval = interval;
        instance.debugWaitTime = debugWaitTime;
        instance.debugExpectedResult = debugExpectedResult;
        instance.init();

    }

    private init() {

        this.wrapper = document.querySelector("#" + this.wrapperId) as HTMLDivElement;
        this.submitBtn = this.wrapper.querySelector("#" + this.submitBtnId) as HTMLInputElement;
        this.digSigAuthMethods = this.wrapper.querySelector(".-auth-method-selector") as HTMLFieldSetElement;
        this.requiredInput = this.wrapper.querySelector(this.requiredInputId) as HTMLInputElement;

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
        this._isSigMethodSelected = digSigRb.checked;

        this.digSigAuthMethods.addEventListener("change", (e) => {
            this._isSigMethodSelected = digSigRb.checked;
            const element = e.target as HTMLElement
            if (element instanceof HTMLInputElement && (element as HTMLInputElement).type === "radio") {
                this.onAuthMethodChanged && typeof this.onAuthMethodChanged === "function" && this.onAuthMethodChanged(element);
            }
        });
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

    public static getInstance(wrapperID: string): DigitalSignatureManager {
        return DigitalSignatureManager.wrapperIdCodeToInstance[wrapperID];
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


