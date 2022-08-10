<%@ Page Title="" Language="vb" AutoEventWireup="false" MaintainScrollPositionOnPostback="true" MasterPageFile="~/Site.Master" CodeBehind="AccountEntryDigitalSigTest.aspx.vb" Inherits="TmpBank.Pages.AccountEntryDigitalSigTest" %>

<%@ Import Namespace="TmpBank.DigSigService" %>
<%@ Import Namespace="TmpBank.Pages" %>

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
            <uc:LabledInput ID="UserNameLogin_View" Name="Username" PlaceHolderText="username..." runat="server" CssClass="-required-input -wrapper" />
            <uc:LabledInput ID="PasswordLogin_View" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="-wrapper" runat="server" />

            <uc:DigitalSig runat="server"
                ID="DigSig_UC"
                Interval="1000"
                WrapperId="<%# LoginWrapper_PNL.ClientID %>"
                SubmitButton="<%#LoginBtn_View %>"
                RequiredInput="<%# UserNameLogin_View.Input %>"
                InputNames="<%# New List(Of String) From {PasswordLogin_View.UniqueID} %>"
                NoRequiredInputs="false"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
            </uc:DigitalSig>
            <asp:Button ID="LoginBtn_View" runat="server" CssClass="btn btn-light" Text="Login" />


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

    <asp:Panel runat="server" ID="LoginWrapper2_PNL">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with default markup
            </h2>
            <uc:LabledInput ID="UserNameLogin2_View" Name="Username" PlaceHolderText="username..." runat="server" CssClass="-required-input -wrapper" />
            <uc:LabledInput ID="PasswordLogin2_View" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="-wrapper" runat="server" />

            <uc:DigitalSig runat="server"
                ID="DigSig2_UC"
                Interval="1000"
                WrapperId="<%# LoginWrapper2_PNL.ClientID %>"
                RequiredInput="<%# UserNameLogin2_View.Input %>"
                InputNames="<%# new List(Of String) From {PasswordLogin2_View.UniqueID} %>"
                WrappingPanel="<%# LoginWrapper2_PNL %>"
                NoRequiredInputs="false"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
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

    <asp:Panel runat="server" ID="LoginWrapper3_PNL">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with submit templates and default required input
            </h2>
            <uc:LabledInput ID="UserNameLogin3_View" Name="Username" PlaceHolderText="username..." runat="server" CssClass="-required-input -wrapper" />
            <uc:LabledInput ID="PasswordLogin3_View" Name="Password" InputType="<%# TextBoxMode.Password %>" PlaceHolderText="password..." CssClass="-wrapper" runat="server" />

            <uc:DigitalSig runat="server"
                ID="DigSig3_UC"
                Interval="1000"
                WrapperId="<%# LoginWrapper3_PNL.ClientID %>"
                WrappingPanel="<%# LoginWrapper3_PNL%>"
                InputNames="<%#New List(Of String) From {UserNameLogin3_View.UniqueID, PasswordLogin3_View.UniqueID} %>"
                NoRequiredInputs="false"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <SubmitTemplate>
                    my submit  template
                    <asp:Button ID="Button1" runat="server" CssClass="btn btn-light" Text="Login" SubmitView />
                </SubmitTemplate>
            </uc:DigitalSig>

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

    <asp:Panel runat="server" ID="LoginWrapper4_PNL">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with inputs template + submit template
            </h2>


            <uc:DigitalSig runat="server"
                ID="DigSig4_UC"
                Interval="1000"
                WrapperId="<%# LoginWrapper4_PNL.ClientID %>"
                WrappingPanel="<%# LoginWrapper4_PNL %>"
                Action="<%# TmpBank.Controls.Action.HIDE %>"
                NoRequiredInputs="false"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <SubmitTemplate>
                    my very custom submit template
                    <asp:Button ID="Button2" runat="server" CssClass="btn btn-light" Text="Login" SubmitView />
                </SubmitTemplate>
                <InputsTemplate>
                    <div data-random="because i can">
                        <div class="form-group -wrapper">
                            <asp:Label runat="server" ID="Label_View" CssClass="col-sm-2 control-label col-md-1" AsoosiatedControlId="UserNameLogin4_View" Text="Username" />
                            <asp:TextBox ID="UserNameLogin4_View" CssClass="form-control col-sm-7 col-md-8" runat="server" InputView RequiredInput />
                        </div>

                        <div class="form-group -wrapper">
                            <asp:Label runat="server" ID="Label4" CssClass="col-sm-2 control-label col-md-1" AsoosiatedControlId="PasswordLogin4_View" Text="Password" />
                            <asp:TextBox ID="PasswordLogin4_View" CssClass="form-control col-sm-7 col-md-8" runat="server" InputView />
                        </div>
                    </div>
                </InputsTemplate>
            </uc:DigitalSig>

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



    <asp:Panel runat="server" ID="LoginWrapper5_PNL">
        <div class="login table-bordered form-horizontal">
            <h2 class="h2">Login with inputs template + submit template
            </h2>


            <uc:DigitalSig runat="server"
                ID="DigitalSig5"
                Interval="1000"
                WrapperId="<%# LoginWrapper5_PNL.ClientID %>"
                WrappingPanel="<%# LoginWrapper5_PNL %>"
                RequiredInput="<%# UserNameLogin5_View%>"
                NoRequiredInputs="false"
                InputNames="<%#New List(Of String) From {PasswordLogin5_View.UniqueID} %>"
                Action="<%# TmpBank.Controls.Action.HIDE %>"
                DebugWaitTime="10000"
                DebugExpectedResult="<%# TmpBank.DigSigService.DigSigStatus.SUCCEEDED %>">
                <SubmitTemplate>
                    my very custom submit template
                    <asp:Button ID="Button3" runat="server" CssClass="btn btn-light" Text="Login" SubmitView />
                </SubmitTemplate>
            </uc:DigitalSig>

            <div class="form-group -wrapper">
                <asp:Label runat="server" ID="Label5" CssClass="col-sm-2 control-label col-md-1" AsoosiatedControlId="UserNameLogin5_View" Text="Username" />
                <asp:TextBox ID="UserNameLogin5_View" CssClass="form-control col-sm-7 col-md-8" runat="server" InputView RequiredInput />
            </div>

            <div class="form-group -wrapper">
                <asp:Label runat="server" ID="Label6" CssClass="col-sm-2 control-label col-md-1" AsoosiatedControlId="PasswordLogin5_View" Text="Password" />
                <asp:TextBox ID="PasswordLogin5_View" CssClass="form-control col-sm-7 col-md-8" runat="server" InputView />
            </div>

            <% If Not _IsLoginValid Then %>
            <div class="row">
                <div class="alert alert-danger col-xs-11 col-md-6 col-lg-5" role="alert">
                    <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                    <span class="sr-only">Login Validation Error:</span>
                    <asp:Label ID="Label7" Text="" runat="server" />
                </div>
            </div>
            <% End if %>
        </div>
    </asp:Panel>

    <script type="text/javascript">
        document.addEventListener("DOMContentLoaded", () => {

            const digitalSigManager = DigitalSignatureManager.getInstance("<%= DigSig4_UC.WrapperId %>");

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

            const digitalSigManager1 = DigitalSignatureManager.getInstance("<%= DigSig_UC.WrapperId %>");
            const digitalSigManager2 = DigitalSignatureManager.getInstance("<%= DigSig2_UC.WrapperId %>");
            const digitalSigManager3 = DigitalSignatureManager.getInstance("<%= DigSig3_UC.WrapperId %>");
            const digitalSigManager5 = DigitalSignatureManager.getInstance("<%= DigitalSig5.WrapperId %>");

        });
    </script>

</asp:Content>
