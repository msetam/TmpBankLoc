<%@ Page Title="" Language="vb" AutoEventWireup="false" MaintainScrollPositionOnPostback="true" MasterPageFile="~/Site.Master" CodeBehind="AccountEntryDigitalSigTest.aspx.vb" Inherits="TmpBank.Pages.AccountEntryDigitalSigTest" %>

<%@ Import Namespace="TmpBank.DigSigService" %>
<%@ Import Namespace="TmpBank.Pages" %>

<%@ Register Src="~/Controls/LabeledInput.ascx" TagName="LabledInput" TagPrefix="uc" %>
<%@ Register Src="~/Controls/DigitalSig.ascx" TagName="DigitalSig" TagPrefix="uc" %>



<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
    <style>
        .login, .signup {
            padding: 0.5em 0 0.5em 1em;
            margin-bottom: 1em;
        }

            .login h2, .signup h2 {
                margin-bottom: 1em;
            }

            .login .row, .signup .row {
                margin-left: 0;
            }

            .login .alert, .signup .alert {
                margin-top: 2em;
            }
    </style>
    <script type="text/javascript" src="/Scripts/DigitalSignatureManger.js"></script>


</asp:Content>

<asp:Content ID="LoginForm" ContentPlaceHolderID="MainContent" runat="server">
    <%--    <asp:ScriptManagerProxy runat="server">
        <Scripts>
            <asp:ScriptReference
                Path="~/Scripts/DigitalSignatureManger.js" />
        </Scripts>
    </asp:ScriptManagerProxy>--%>
    <h1 class="h1">Login page DigitalSig test -> testing submit button template/attr/default only
    </h1>
    <%--note:we cannot use defaultbutton on panel because the button is not visible now till we render it into template  hence then need for WrappingPanel--%>
    <asp:Panel runat="server" ID="LoginWrapper_PNL" DefaultButton="LoginBtn_View">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with attr referencing outer view
            </h2>


            <fieldset runat="server" id="DefaultAuthMethodsMarkup" class="ds-wrapper" style="min-width: max-content">
                <legend>Auth method</legend>

                <div class="row ds-wrapper">


                    <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                        <label class="-ds-rb" for="<%= UsernamePassword_RB.ClientID %>">
                            <span>user name and pass</span>
                        </label>
                        <input runat="server" type="radio" id="UsernamePassword_RB" value="username and password" checked DSAuthMethod />
                    </div>

                    <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                        <label class="-ds-rb" for="<%= DigitalSignature_RB.ClientID %>">
                            <span>Dig sig </span>
                        </label>
                        <input runat="server" type="radio" id="DigitalSignature_RB" class="-ds-rb" value="digital signature" DSTargetAuthMethod />
                    </div>

                </div>

            </fieldset>

            <uc:LabledInput ID="UserNameLogin_View" Name="Username" PlaceHolderText="username..." runat="server" CssClass="required-input-wrapper input-wrapper ds-wrapper" />
            <uc:LabledInput ID="PasswordLogin_View" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="input-wrapper ds-wrapper" runat="server" />

            <uc:DigitalSig runat="server"
                ID="DigSig_UC"
                Interval="1000"
                Wrapper="<%# LoginWrapper_PNL %>"
                HasReferencedSubmitButton="True"
                HasReferencedInputs="True"
                InputsWrapperClass="input-wrapper"
                RequiredInputWrapperClass="required-input-wrapper"
                HasReferencedAuthMethods="True">
            </uc:DigitalSig>
            <asp:Button ID="LoginBtn_View" runat="server" CssClass="btn btn-light" Text="Login" DSSubmitView />

            <% If Not _IsLoginValid Then %>
            <div class="row">
                <div class="alert alert-danger col-xs-11 col-md-6 col-lg-5" role="alert">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Login Validation Error:</span>
                    <asp:Label ID="LoginValidationResult_View" Text="" runat="server" />
                </div>
            </div>
            <% End if %>
        </div>
    </asp:Panel>


    <asp:Panel runat="server" ID="Panel1" DefaultButton="Button1">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with attr/templated authmethods referenced inputs
            </h2>

            <uc:LabledInput ID="LabledInput1" Name="Username" PlaceHolderText="username..." runat="server" CssClass="required-input-wrapper input-wrapper ds-wrapper" />
            <uc:LabledInput ID="LabledInput2" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="input-wrapper ds-wrapper" runat="server" />

            <uc:DigitalSig runat="server"
                ID="DigitalSig1"
                Interval="1000"
                Wrapper="<%# Panel1 %>"
                HasReferencedSubmitButton="True"
                HasReferencedInputs="True"
                InputsWrapperClass="input-wrapper"
                RequiredInputWrapperClass="required-input-wrapper"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <AuthMethodsTemplate>
                    <fieldset runat="server" id="Fieldset1" class="ds-wrapper" style="min-width: max-content">
                        <legend>Auth method</legend>

                        <div class="row ds-wrapper">


                            <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                                <label class="-ds-rb" for="<%= Radio1.ClientID %>">
                                    <span>user name and pass</span>
                                </label>
                                <input runat="server" type="radio" id="Radio1" value="username and password" checked dsauthmethod />
                            </div>

                            <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                                <label class="-ds-rb" for="<%= Radio2.ClientID %>">
                                    <span>Dig sig </span>
                                </label>
                                <input runat="server" type="radio" id="Radio2" class="-ds-rb" value="digital signature" dstargetauthmethod />
                            </div>

                        </div>

                    </fieldset>
                </AuthMethodsTemplate>
            </uc:DigitalSig>
            <asp:Button ID="Button1" runat="server" CssClass="btn btn-light" Text="Login" DSSubmitView />

            <% If Not _IsLoginValid Then %>
            <div class="row">
                <div class="alert alert-danger col-xs-11 col-md-6 col-lg-5" role="alert">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Login Validation Error:</span>
                    <asp:Label ID="Label1" Text="" runat="server" />
                </div>
            </div>
            <% End if %>
        </div>
    </asp:Panel>

    <asp:Panel runat="server" ID="Panel2" DefaultButton="Button2">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with attr/templated authmethods + inputs
            </h2>
            <uc:DigitalSig runat="server"
                ID="DigitalSig2"
                Interval="1000"
                Wrapper="<%# Panel2 %>"
                WrappingPanel="<%# Panel2 %>"
                InputsWrapperClass="input-wrapper"
                RequiredInputWrapperClass="required-input-wrapper"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <AuthMethodsTemplate>
                    <fieldset runat="server" id="Fieldset2" class="ds-wrapper" style="min-width: max-content">
                        <legend>Auth method</legend>

                        <div class="row ds-wrapper">


                            <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                                <label class="-ds-rb" for="<%= Radio3.ClientID %>">
                                    <span>user name and pass</span>
                                </label>
                                <input runat="server" type="radio" id="Radio3" value="username and password" checked dsauthmethod />
                            </div>

                            <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                                <label class="-ds-rb" for="<%= Radio4.ClientID %>">
                                    <span>Dig sig </span>
                                </label>
                                <input runat="server" type="radio" id="Radio4" class="-ds-rb" value="digital signature" dstargetauthmethod />
                            </div>

                        </div>

                    </fieldset>
                </AuthMethodsTemplate>
                <InputsTemplate>
                    <uc:LabledInput ID="LabledInput3" Name="Username" PlaceHolderText="username..." runat="server" CssClass="required-input-wrapper input-wrapper ds-wrapper" />
                    <uc:LabledInput ID="LabledInput4" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="input-wrapper ds-wrapper" runat="server" />
                </InputsTemplate>
                <SubmitTemplate>
                    <p>custom template for submit yayy</p>
                    <asp:Button ID="Button2" runat="server" CssClass="btn btn-light" Text="Login" DSSubmitView />
                </SubmitTemplate>
            </uc:DigitalSig>


            <% If Not _IsLoginValid Then %>
            <div class="row">
                <div class="alert alert-danger col-xs-11 col-md-6 col-lg-5" role="alert">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Login Validation Error:</span>
                    <asp:Label ID="Label2" Text="" runat="server" />
                </div>
            </div>
            <% End if %>
        </div>
    </asp:Panel>


    <asp:Panel runat="server" ID="Panel3" DefaultButton="LoginBtn_View">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with templated inputs and referenced submitbutton
            </h2>
            <uc:DigitalSig runat="server"
                ID="DigitalSig3"
                Interval="1000"
                Wrapper="<%# Panel3 %>"
                HasReferencedSubmitButton="True"
                InputsWrapperClass="input-wrapper"
                RequiredInputWrapperClass="required-input-wrapper"
                HasRequiredInput="True"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <InputsTemplate>
                    <uc:LabledInput ID="LabledInput5" Name="Username" PlaceHolderText="username..." runat="server" CssClass="required-input-wrapper input-wrapper ds-wrapper" />
                    <uc:LabledInput ID="LabledInput6" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="input-wrapper ds-wrapper" runat="server" />
                </InputsTemplate>
            </uc:DigitalSig>
            <asp:Button ID="Button3" runat="server" CssClass="btn btn-light" Text="Login" DSSubmitView />

            <% If Not _IsLoginValid Then %>
            <div class="row">
                <div class="alert alert-danger col-xs-11 col-md-6 col-lg-5" role="alert">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Login Validation Error:</span>
                    <asp:Label ID="Label3" Text="" runat="server" />
                </div>
            </div>
            <% End if %>
        </div>
    </asp:Panel>

    <asp:Panel runat="server" ID="Panel4">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with default templates
            </h2>
            <uc:DigitalSig runat="server"
                ID="DigitalSig4"
                Interval="1000"
                Wrapper="<%# Panel4 %>"
                HasRequiredInput="True"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
            </uc:DigitalSig>

            <% If Not _IsLoginValid Then %>
            <div class="row">
                <div class="alert alert-danger col-xs-11 col-md-6 col-lg-5" role="alert">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Login Validation Error:</span>
                    <asp:Label ID="Label4" Text="" runat="server" />
                </div>
            </div>
            <% End if %>
        </div>
    </asp:Panel>


    <script type="text/javascript">
        document.addEventListener("DOMContentLoaded", () => {

            const digitalSigManager = DigitalSignature.DigitalSignatureManager.getInstance("<%= DigSig_UC.Wrapper.ClientID %>");

            digitalSigManager.setOnAuthEventsListener({
                onAuthMethodChanged(currentAuth, wrapper) {
                    console.log("changed auth method");
                },
                onFailed(error) {
                    console.log(error);
                },
                onSuccess() {
                    console.log("success");
                },
                onRequestStarted() {
                    console.log("req started");
                },
                onRetry() {
                    console.log("req retry");
                }
            });

            DigitalSignature.DigitalSignatureManager.getInstance("<%= DigitalSig1.Wrapper.ClientID %>");
            DigitalSignature.DigitalSignatureManager.getInstance("<%= DigitalSig2.Wrapper.ClientID %>");
            DigitalSignature.DigitalSignatureManager.getInstance("<%= DigitalSig3.Wrapper.ClientID %>");
            DigitalSignature.DigitalSignatureManager.getInstance("<%= DigitalSig4.Wrapper.ClientID %>");

            <%--            const digitalSigManager1 = DigitalSignatureManager.getInstance("<%= DigSig_UC.WrapperId %>");
            const digitalSigManager2 = DigitalSignatureManager.getInstance("<%= DigSig2_UC.WrapperId %>");
            const digitalSigManager3 = DigitalSignatureManager.getInstance("<%= DigSig3_UC.WrapperId %>");
            const digitalSigManager5 = DigitalSignatureManager.getInstance("<%= DigitalSig5.WrapperId %>");--%>

        });
    </script>

</asp:Content>
