console.log("DigitalSig loading...");
var DigitalSignature;
(function (DigitalSignature) {
    var DigitalSignatureStatus;
    (function (DigitalSignatureStatus) {
        DigitalSignatureStatus[DigitalSignatureStatus["WAITING"] = 0] = "WAITING";
        DigitalSignatureStatus[DigitalSignatureStatus["TIMED_OUT"] = 1] = "TIMED_OUT";
        DigitalSignatureStatus[DigitalSignatureStatus["SUCCEEDED"] = 2] = "SUCCEEDED";
        DigitalSignatureStatus[DigitalSignatureStatus["FAILED"] = 3] = "FAILED";
    })(DigitalSignatureStatus || (DigitalSignatureStatus = {}));
    // when switching between different Auth methods what is gonna be the action applied to all inputs provided in inputsNames
    var Action;
    (function (Action) {
        Action[Action["DISABLE"] = 0] = "DISABLE";
        Action[Action["HIDE"] = 1] = "HIDE";
        Action[Action["NONE"] = 2] = "NONE";
    })(Action || (Action = {}));
    var DigitalSignatureManager = /** @class */ (function () {
        function DigitalSignatureManager() {
            var _this = this;
            this._inputsAndWrappers = [];
            this._isSigMethodSelected = false;
            this._hasInitialized = false;
            this._defaultDigitalSignatureInitRequestData = {
                endpoint: "".concat(DigitalSignatureManager._baseApiUrl, "/init"),
                data: function () { var _a; return { expectedResult: "".concat(_this._debugExpectedResult), data: "".concat((_a = _this._requiredInput) === null || _a === void 0 ? void 0 : _a.value), waitTime: "".concat(_this._debugWaitTime) }; }
            };
            this._defaultDigitalSignatureCheckStatusRequestData = {
                endpoint: "".concat(DigitalSignatureManager._baseApiUrl, "/check"),
                data: function () { var _a; return { expectedResult: "".concat(_this._debugExpectedResult), data: "".concat((_a = _this._requiredInput) === null || _a === void 0 ? void 0 : _a.value), waitTime: "".concat(_this._debugWaitTime) }; }
            };
        }
        DigitalSignatureManager.createInstance = function (wrapperId, interval, action, hasRequiredInput, authMethodsWrapperClasses, inputsWrapperClasses, submitWrapperClass, debugExpectedResult, debugWaitTime) {
            var instance = new DigitalSignatureManager();
            DigitalSignatureManager._wrapperIdCodeToInstance[wrapperId] = instance;
            instance._wrapperId = wrapperId;
            instance._interval = interval;
            instance._action = action;
            instance._hasRequiredInput = hasRequiredInput;
            instance._authMethodsWrapperClasses = authMethodsWrapperClasses;
            instance._inputsWrapperClasses = inputsWrapperClasses;
            instance._submitWrapperClass = submitWrapperClass;
            instance._debugWaitTime = debugWaitTime;
            instance._debugExpectedResult = debugExpectedResult;
        };
        DigitalSignatureManager.getInstance = function (wrapperID) {
            var instance = DigitalSignatureManager._wrapperIdCodeToInstance[wrapperID];
            instance._init();
            return instance;
        };
        DigitalSignatureManager.prototype._init = function () {
            var _this = this;
            if (this._hasInitialized) {
                return;
            }
            this._hasInitialized = true;
            this._wrapper = document.querySelector("#" + this._wrapperId);
            this._submitBtn = this._wrapper.querySelector(!this._isClassNameNull(this._submitWrapperClass) ? this._submitWrapperClass + " input" : "[submitview]");
            if (!this._submitBtn) {
                this._wrapper.querySelector(this._submitWrapperClass + " button");
            }
            // setting up html inputs that define the sent data
            var sentRequiredInputClassName = this._inputsWrapperClasses.split(",")[1];
            this._requiredInput = this._hasRequiredInput && this._wrapper.querySelector(!this._isClassNameNull(sentRequiredInputClassName) ? sentRequiredInputClassName + " input" : "[requiredinput]");
            var sentInputViewClassName = this._inputsWrapperClasses.split(",")[0];
            this._wrapper.querySelectorAll(!this._isClassNameNull(sentInputViewClassName) ?
                sentInputViewClassName + " input" :
                "[inputview]").forEach(function (inputElement) {
                _this._inputsAndWrappers.push({ input: inputElement, wrapper: _this._getWrapperForElement(inputElement) });
            });
            // setting up html radio button inputs that define the auth method
            var sentTargetAuthMethodClassName = this._authMethodsWrapperClasses.split(",")[0];
            this._targetAuthMethodRb = this._wrapper.querySelector(!this._isClassNameNull(sentTargetAuthMethodClassName) ?
                sentTargetAuthMethodClassName + " input[type=radio]" :
                "[targetauthmethod]");
            this._digSigAuthMethodsWrapper = this._getWrapperForElement(this._targetAuthMethodRb);
            this._setAuthMethodsSelectedListeners();
            this._setSubmitListener();
        };
        DigitalSignatureManager.prototype._setSubmitListener = function () {
            var _this = this;
            var savedOnClick = this._submitBtn.onclick;
            this._submitBtn.onclick = null;
            savedOnClick && this._submitBtn.removeEventListener("click", savedOnClick);
            this._submitBtn.addEventListener("click", function (e) {
                var _a, _b;
                var listeners = _this._authManagerListeners;
                if (_this._isSigMethodSelected) {
                    _this.disableWrapper();
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    listeners && typeof listeners.onRequestStarted === 'function' && listeners.onRequestStarted();
                    $.ajax({
                        url: ((_a = _this._digitalSignatureInitRequestData) === null || _a === void 0 ? void 0 : _a.endpoint) ? _this._digitalSignatureInitRequestData.endpoint : _this._defaultDigitalSignatureInitRequestData.endpoint,
                        method: "POST",
                        data: JSON.stringify(((_b = _this._digitalSignatureInitRequestData) === null || _b === void 0 ? void 0 : _b.data) ? _this._digitalSignatureInitRequestData.data : _this._defaultDigitalSignatureInitRequestData.data),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (response) {
                            console.log(response.d);
                            _this._requestCode = response.d;
                            listeners && typeof listeners.onRequestTrackingDataReceived === 'function' && listeners.onRequestTrackingDataReceived(response);
                            _this._checkRequestStatus();
                        },
                        error: function (errors) {
                            console.log(errors);
                            _this.enableWrapper();
                        },
                        /*               xhrFields: { withCrendtials: true },*/
                    });
                }
                return false;
            });
            savedOnClick && (this._submitBtn.onclick = savedOnClick);
        };
        DigitalSignatureManager.prototype.setOnAuthEventsListener = function (authEventsImpl) {
            this._authManagerListeners = authEventsImpl;
        };
        DigitalSignatureManager.prototype.setDigitalSignatureInitRequestsData = function (digitalSigRequestsData) {
            this._digitalSignatureInitRequestData = digitalSigRequestsData;
        };
        DigitalSignatureManager.prototype.setDigitalSignatureCheckStatusRequestsData = function (digitalSigRequestsData) {
            this._digitalSignatureCheckStatusRequestData = digitalSigRequestsData;
        };
        DigitalSignatureManager.prototype._setAuthMethodsSelectedListeners = function () {
            var _this = this;
            // setting the initial state
            var authMethodClassName = this._authMethodsWrapperClasses.split(",")[0];
            this._digSigAuthMethodsWrapper.querySelectorAll(!this._isClassNameNull(authMethodClassName) ?
                authMethodClassName + " input[type=radio]" :
                "[authmethod]").forEach(function (element) {
                if (element.checked) {
                    _this._onAuthFieldMethodChanged(_this._targetAuthMethodRb, null, element);
                }
            });
            this._digSigAuthMethodsWrapper.addEventListener("change", function (e) { _this._onAuthFieldMethodChanged(_this._targetAuthMethodRb, e); });
        };
        // for fieldset authmethods html change event
        DigitalSignatureManager.prototype._onAuthFieldMethodChanged = function (digSigRb, e, selectedElement) {
            this._isSigMethodSelected = digSigRb.checked;
            var element = selectedElement ? selectedElement : e.target;
            if (element instanceof HTMLInputElement && element.type === "radio") {
                this._authManagerListeners && typeof this._authManagerListeners.onAuthMethodChanged === 'function'
                    && this._authManagerListeners.onAuthMethodChanged(element);
                if (this._action != Action.NONE) {
                    if (this._hasRequiredInput) {
                        // first we set the state of requiredInput because it can also be an input for other auth methods(flaggs: RequiredView InputView)
                        // so iterating over inputsnames enables it again
                        if (this._action == Action.DISABLE) {
                            if (this._isSigMethodSelected) {
                                this._requiredInput.removeAttribute("disabled");
                            }
                            else {
                                this._requiredInput.setAttribute("disabled", "true");
                            }
                        }
                        else if (this._action == Action.HIDE) {
                            var elementWrapper = this._getWrapperForElement(this._requiredInput);
                            if (this._isSigMethodSelected) {
                                elementWrapper.classList.remove("display-none");
                            }
                            else {
                                elementWrapper.classList.add("display-none");
                            }
                        }
                    }
                    for (var _i = 0, _a = this._inputsAndWrappers; _i < _a.length; _i++) {
                        var _b = _a[_i], input = _b.input, wrapper = _b.wrapper;
                        if (this._action == Action.DISABLE) {
                            if (this._isSigMethodSelected && input !== this._requiredInput) {
                                input.setAttribute("disabled", "true");
                            }
                            else {
                                input.removeAttribute("disabled");
                            }
                        }
                        else if (this._action == Action.HIDE) {
                            if (this._isSigMethodSelected && input !== this._requiredInput) {
                                wrapper.classList.add("display-none");
                            }
                            else {
                                wrapper.classList.remove("display-none");
                            }
                        }
                    }
                }
            }
        };
        // goes up the DOM heierachy till it hits a class with ds-wrapper class or reaches wrapper element
        DigitalSignatureManager.prototype._getWrapperForElement = function (element) {
            var result = element;
            while (result && result != this._wrapper && !result.classList.contains("ds-wrapper")) {
                result = result.parentElement;
            }
            if (!result || !result.classList.contains("ds-wrapper")) {
                throw new Error("'ds-wrapper' class on any of ancestors of this element is expected: ".concat(element));
            }
            return result;
        };
        DigitalSignatureManager.prototype._checkRequestStatus = function () {
            var _this = this;
            var _a, _b;
            $.ajax({
                url: ((_a = this._digitalSignatureCheckStatusRequestData) === null || _a === void 0 ? void 0 : _a.endpoint) ? this._digitalSignatureCheckStatusRequestData.endpoint : this._defaultDigitalSignatureCheckStatusRequestData.endpoint,
                method: "POST",
                data: JSON.stringify(((_b = this._digitalSignatureCheckStatusRequestData) === null || _b === void 0 ? void 0 : _b.data) ? this._digitalSignatureCheckStatusRequestData.data : this._defaultDigitalSignatureCheckStatusRequestData.data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if (response.d.Status == DigitalSignatureStatus.SUCCEEDED) {
                        _this._authManagerListeners && typeof _this._authManagerListeners.onSuccess === 'function' && _this._authManagerListeners.onSuccess();
                    }
                    else if (response.d.Status == DigitalSignatureStatus.FAILED || response.d.Status == DigitalSignatureStatus.TIMED_OUT) {
                        _this._authManagerListeners && typeof _this._authManagerListeners.onFailed === 'function' && _this._authManagerListeners.onFailed(response.d.Status);
                        _this.enableWrapper();
                    }
                    else {
                        setTimeout(function () { _this._checkRequestStatus(); }, _this._interval);
                        _this._authManagerListeners && typeof _this._authManagerListeners.onRetry === 'function' && _this._authManagerListeners.onRetry(response.d.Status);
                    }
                },
                error: function (errors) { return _this._authManagerListeners && typeof _this._authManagerListeners.onFailed === 'function' && _this._authManagerListeners.onFailed(errors); },
                //xhrFields: {
                //    withCredentials: true
                //}
            });
        };
        DigitalSignatureManager.addDefaultStyle = function () {
            var styleNode = document.createElement("style");
            styleNode.textContent = "";
            document.head.appendChild(styleNode);
        };
        DigitalSignatureManager.isFirstInstance = function () {
            return Object.keys(DigitalSignatureManager._wrapperIdCodeToInstance).length == 0;
        };
        DigitalSignatureManager.prototype.isSigMethodSelected = function () {
            return this._isSigMethodSelected;
        };
        DigitalSignatureManager.prototype.disableWrapper = function () {
            // @ts-ignore
            backgroundPopupCommon();
        };
        DigitalSignatureManager.prototype.enableWrapper = function () {
            setTimeout(function () {
                console.warn("remove timeout for enableWrapper in production");
                // @ts-ignore
                UndobackgroundPopup();
            }, 5000);
        };
        DigitalSignatureManager.prototype._isClassNameNull = function (className) {
            return className === ".-null-";
        };
        DigitalSignatureManager._baseApiUrl = "http://localhost:5288/DigitalSigService.asmx";
        DigitalSignatureManager._wrapperIdCodeToInstance = {};
        return DigitalSignatureManager;
    }());
    DigitalSignature.DigitalSignatureManager = DigitalSignatureManager;
})(DigitalSignature || (DigitalSignature = {}));
//# sourceMappingURL=DigitalSignatureManger.js.map