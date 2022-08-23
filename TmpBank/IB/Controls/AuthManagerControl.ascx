<%@ Control Language="vb" AutoEventWireup="false" CodeBehind="AuthManagerControl.ascx.vb" Inherits="EndUserWebSite.Controls.AuthManagerControl" %>


<%@ Register Src="~/Controls/LabeledInput.ascx" TagName="LabeledInput" TagPrefix="uc" %>

<div runat="server" id="AuthManagerWrapper_DIV" class="ds-wrapper ds-main-wrapper">


    <div runat="server" id="DefaultInputsMarkup">
        <uc:LabeledInput runat="server" ID="NationalCode_UC" PlaceHolderText="نام کاربری" Name="National Code" CssClass="ds-required-input-wrapper ds-inputs-wrapper ds-wrapper" Disabled="false" />
        <uc:LabeledInput runat="server" ID="Password_UC" PlaceHolderText="رمز عبور" Name="Password" CssClass="ds-inputs-wrapper ds-wrapper" Disabled="false" />
    </div>
    <fieldset runat="server" id="DefaultAuthMethodsMarkup" class="-ds-fieldset frm-group" style="min-width: max-content">
        <div>
            <p class="-ds-legend col-md-3 col-sm-3 control-label">
                روش ثبت:
            </p>
            <div class="-auth-methods-wrapper col-md-8 col-sm-8">
                <div class="-ds-auth-method">
                    <label class="-ds-rb" for="<%= Password_RB.ClientID %>">
                        <span>رمز عبور </span>
                    </label>
                    <input runat="server" type="radio" id="Password_RB" value="username and password" checked />
                </div>

                <div class="-ds-auth-method ">
                    <label class="-ds-rb" for="<%= DigitalSignature_RB.ClientID %>">
                        <span>امضای دیجیتالی </span>
                    </label>
                    <input runat="server" type="radio" id="DigitalSignature_RB" class="-ds-rb" value="digital signature" dstargetauthmethod />
                </div>
            </div>
        </div>
    </fieldset>

    <asp:PlaceHolder runat="server" ID="CustomTemplate_PH" />

    <asp:Button runat="server" ID="Submit_BTN" class="btn btn-success submit-btn" Text="Submit" DSSubmitView />

</div>


