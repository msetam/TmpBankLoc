<%@ Page Title="" Language="vb" AutoEventWireup="false" MaintainScrollPositionOnPostback="true" MasterPageFile="~/Site.Master" CodeBehind="AccountEntry.aspx.vb" Inherits="TmpBank.Pages.AccountEntry" %>

<%@ Import Namespace="TmpBank.DigSigService" %>

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
    <h1 class="h1">Login/Signup Page
    </h1>
    <%--note:we cannot use defaultbutton on panel because the button is not visible now till we render it into template  hence then need for WrappingPanel--%>
    <asp:Panel runat="server" ID="LoginWrapper_PNL">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login
            </h2>

            <uc:LabledInput ID="UserNameLogin_View" Name="Username" PlaceHolderText="username..." runat="server" CssClass="required-input-wrapper input-wrapper ds-wrapper"/>
            <uc:LabledInput ID="PasswordLogin_View" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="input-wrapper ds-wrapper" runat="server" />

            <uc:DigitalSig runat="server"
                ID="DigSig_UC"
                Interval="1000"
                Wrapper="<%# LoginWrapper_PNL %>"
                HasReferencedInputs="True"
                InputsWrapperClass="input-wrapper"
                RequiredInputWrapperClass="required-input-wrapper"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <SubmitTemplate>
                    my submit  template
                    <asp:Button ID="LoginBtn_View" runat="server" CssClass="btn btn-light" Text="Login" DSSubmitView/>
                </SubmitTemplate>
            </uc:DigitalSig>

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

    <asp:Panel runat="server" DefaultButton="SignUpBtn_View">
        <div class="signup table-bordered form-horizontal">
            <h2 class="h2">SignUp
            </h2>
            <uc:LabledInput ID="UsernameSignup_View" Name="Username" PlaceHolderText="username..." runat="server" />
            <uc:LabledInput ID="PasswordSignup_View" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." runat="server" />
            <uc:LabledInput ID="EmailSignup_View" Name="email" InputType="<%# TextBoxMode.Email %>" PlaceHolderText="me@host.domain" runat="server" />
            <asp:Button ID="SignUpBtn_View" runat="server" CssClass="btn btn-light" Text="SignUp" />
            <% If Not _IsSignupValid Then %>
            <div class="row">
                <div class="alert alert-danger col-xs-11 col-md-6 col-lg-5" role="alert">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Signup Validation Error:</span>
                    <asp:Label ID="SignupValidationResult_View" Text="" runat="server" />
                </div>
            </div>
            <% End if %>
        </div>
    </asp:Panel>
    <script type="text/javascript">
        document.addEventListener("DOMContentLoaded", () => {

            const digitalSigManager = DigitalSignature.DigitalSignatureManager.getInstance("<%= DigSig_UC.Wrapper.ClientID %>");

            digitalSigManager.setOnAuthEventsListener({

                onRequestStarted: function () {
                    console.log("started");
                },
                onTrackingDataReceived: function (data) {
                    console.log(`tracking data recevied: ${data}`)
                },
                onRetry: function () {
                    console.log("retrying");
                },
                onSuccess: function () {
                    console.log("succeeded");
                    console.log("redirectig to account home");
                    setTimeout(() => {
                        document.location.reload();
                    }, 1000);
                },
                onFailed: function (errors) {
                    console.log(errors);
                },
                onAuthMethodChanged(selectedAuthMethodInput) {
                    console.log("auth method changed to " + selectedAuthMethodInput);
                }
            });


        });
    </script>

</asp:Content>
