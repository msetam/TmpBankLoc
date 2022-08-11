<%@ Control Language="vb" AutoEventWireup="false" CodeBehind="DigitalSigControl.ascx.vb" Inherits="TmpBank.Controls.DigitalSigControl" %>


<%@ Register Src="~/Controls/LabledInput.ascx" TagName="LabledInput" TagPrefix="uc" %>
<style>
    /* after finilazing our design we remove this style tag and dig-sig-manager.js will add this to header dynamically*/


    div.ds-wrapper {
        display: inline-block;
        width: 100%;
    }

    div fieldset .-ds-rb {
        display: inline-block;
        padding-right: 20px;
        margin-bottom: 0;
        font-weight: 400;
        vertical-align: middle;
        top: 5px;
        position: static;
    }



    div fieldset input[type=radio] {
        display: inline-block;
        margin-right: 1em;
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-30%);
    }

        div fieldset input[type=radio] span {
            font-weight: bolder;
            font-size: 0.7em;
        }


    div fieldset label.-ds-rb {
        display: inline-block;
        box-sizing: border-box;
        margin: 0;
    }

    input[disabled] {
        cursor: not-allowed;
        background: #c9c9c9;
    }

    #accordion2 {
        margin-top: 5% !important;
    }

    .display-none {
        display: none;
    }
</style>

<div runat="server" id="DigSigWrapper_DIV" class="ds-wrapper">

    <div runat="server" id="DefaultMarkup_DIV">
        <div runat="server" id="DefaultInputsMarkup">
            <uc:LabledInput runat="server" ID="NationalCode_UC" PlaceHolderText="نام کاربری" Name="National Code" CssClass="ds-required-input-wrapper ds-inputs-wrapper ds-wrapper" Disabled="false" />
            <uc:LabledInput runat="server" ID="Password_UC" PlaceHolderText="رمز عبور" Name="Password" CssClass="ds-inputs-wrapper ds-wrapper" Disabled="false" />
        </div>
        <fieldset runat="server" id="DefaultAuthMethodsMarkup" class="ds-wrapper" style="min-width: max-content">
            <legend>روش ورود:</legend>

            <div class="row ds-wrapper">


                <div class="-auth-method col-sm-12 col-md-6 col-lg-6 ds-wrapper">
                    <label class="-ds-rb" for="<%= UsernamePassword_RB.ClientID %>">
                        <span>نام کاربری و پسورد </span>
                    </label>
                    <input runat="server" type="radio" id="UsernamePassword_RB" value="username and password" checked authmethod />
                </div>

                <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                    <label class="-ds-rb" for="<%= DigitalSignature_RB.ClientID %>">
                        <span>امضای دیجیتالی </span>
                    </label>
                    <input runat="server" type="radio" id="DigitalSignature_RB" class="-ds-rb" value="digital signature" targetauthmethod />
                </div>

            </div>

        </fieldset>

        <asp:PlaceHolder runat="server" ID="CustomTemplate_PH" />

        <asp:Button runat="server" ID="Submit_BTN" class="btn btn-success submit-btn" Text="Submit" SubmitView />
    </div>

</div>



