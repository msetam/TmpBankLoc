<%@ Control Language="vb" AutoEventWireup="false" CodeBehind="DigSig.ascx.vb" Inherits="TmpBank.Controls.DigitalSigControl" %>


<%@ Register Src="~/Controls/LabledInput.ascx" TagName="LabledInput" TagPrefix="uc" %>

<div runat="server" id="DigSigWrapper_DIV" class="ds-wrapper ds-main-wrapper">

    <div runat="server" id="DefaultMarkup_DIV">
        <div runat="server" id="DefaultInputsMarkup">
            <uc:LabledInput runat="server" ID="NationalCode_UC" PlaceHolderText="نام کاربری" Name="National Code" CssClass="ds-required-input-wrapper ds-inputs-wrapper ds-wrapper" Disabled="false" />
            <uc:LabledInput runat="server" ID="Password_UC" PlaceHolderText="رمز عبور" Name="Password" CssClass="ds-inputs-wrapper ds-wrapper" Disabled="false" />
        </div>
        <fieldset runat="server" id="DefaultAuthMethodsMarkup" class="ds-wrapper -ds-fieldset">
            <legend>روش ورود:</legend>

            <div class="row ds-wrapper">


                <div class="-ds-auth-method col-xs-6 col-sm-6 col-md-6 col-lg-6">
                    <label class="-ds-rb" for="<%= UsernamePassword_RB.ClientID %>">
                        <span>نام کاربری و رمز عبور </span>
                    </label>
                    <input runat="server" type="radio" id="UsernamePassword_RB" value="username and password" checked dsauthmethod />
                </div>

                <div class="-ds-auth-method col-xs-6 col-sm-6 col-md-6 col-lg-6">
                    <label class="-ds-rb" for="<%= DigitalSignature_RB.ClientID %>">
                        <span>امضای دیجیتالی </span>
                    </label>
                    <input runat="server" type="radio" id="DigitalSignature_RB" class="-ds-rb" value="digital signature" dstargetauthmethod />
                </div>

            </div>

        </fieldset>

        <asp:PlaceHolder runat="server" ID="CustomTemplate_PH" />

        <asp:Button runat="server" ID="Submit_BTN" class="btn btn-success submit-btn" Text="Submit" DSSubmitView />
    </div>

</div>


