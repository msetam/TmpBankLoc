<%@ Page Title="" Language="vb" AutoEventWireup="false" MaintainScrollPositionOnPostback="true" MasterPageFile="~/Site.Master" CodeBehind="AccountEntry.aspx.vb" Inherits="TmpBank.Pages.AccountEntry" %>

<%@ Import Namespace="TmpBank.DigSigService" %>

<%@ Register Src="~/Controls/LabledInput.ascx" TagName="LabledInput" TagPrefix="uc" %>
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



</asp:Content>

<asp:Content ID="LoginForm" ContentPlaceHolderID="MainContent" runat="server">
    <asp:ScriptManagerProxy runat="server">
        <Scripts>
            <asp:ScriptReference
                Path="~/Scripts/DigitalSignatureManger.js" />
        </Scripts>
    </asp:ScriptManagerProxy>
    <h1 class="h1">Login/Signup Page
    </h1>
    <%--note:we cannot use defaultbutton on panel because the button is not visible now till we render it into template  hence then need for WrappingPanel--%>
    <asp:Panel runat="server" ID="LoginWrapper_PNL">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login
            </h2>
            <uc:LabledInput ID="UserNameLogin_View" Name="Username" PlaceHolderText="username..." runat="server" CssClass="-required-input" />
            <uc:LabledInput ID="PasswordLogin_View" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." runat="server" />

            
            <uc:DigitalSig runat="server"
                           ID="DigSig_UC"
                           Interval="1000"
                           WrapperId="<%# LoginWrapper_PNL.ClientID %>"
                           RequiredInputId="<%# UserNameLogin_View.Input.ClientID %>"
                           WrappingPanel="<%# LoginWrapper_PNL %>"
                           DebugWaitTime="10000"
                           DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <SubmitTemplate>
                    my submit  template
                    <asp:Button ID="LoginBtn_View" runat="server" CssClass="btn btn-light" Text="Login" SubmitView/>
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

            const digitalSigManager = DigitalSignatureManager.getInstance("<%= DigSig_UC.Wrapper.ClientID %>");

            const userNameInputLogin = document.querySelector("#<%= UserNameLogin_View.Input.ClientID %>");
            const psaswordInputLogin = document.querySelector("#<%= PasswordLogin_View.Input.ClientID %>");

            digitalSigManager.onAuthMethodChanged = (element) => {
                console.log("auth method changed(we can toggle visibilty now by checking isSigMethodSelected): " + digitalSigManager.isSigMethodSelected())
                if (digitalSigManager.isSigMethodSelected()) {
                    userNameInputLogin.setAttribute("disabled", true);
                    psaswordInputLogin.setAttribute("disabled", true);
                    digitalSigManager.requiredInput.removeAttribute("disabled");
                } else {
                    digitalSigManager.requiredInput.setAttribute("disabled", true);
                    userNameInputLogin.removeAttribute("disabled");
                    psaswordInputLogin.removeAttribute("disabled");
                }
            }

            digitalSigManager.onRequestStarted = () => {
                console.log("request started");
            }

            digitalSigManager.onSuccess = () => {
                console.log("succeeded");
                console.log("redirectig to account home");
                setTimeout(() => {
                    document.location.reload();
                }, 1000);
            };

            digitalSigManager.onFailed = (reason) => {
                console.log("failed: " + reason);
            }

            digitalSigManager.onRetry = (response) => {
                console.log("retrying: " + response)
            };

        });
    </script>

</asp:Content>
