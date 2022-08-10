﻿<%@ Control Language="vb" AutoEventWireup="false" CodeBehind="DigitalSigControl.ascx.vb" Inherits="EndUserWebSite.Controls.DigitalSigControl" %>


<%@ Register Src="~/Controls/LabledInput.ascx" TagName="LabledInput" TagPrefix="uc" %>
<style>
    /* after finilazing our design we remove this style tag and dig-sig-manager.js will add this to header dynamically*/


    div.-ds-wrapper {
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

<div runat="server" id="DigSigWrapper_DIV" class="-ds-wrapper">

    <div runat="server" id="DefaultMarkup_DIV">
        <uc:LabledInput runat="server" ID="NationalCode_UC" PlaceHolderText="کد ملی" Name="National Code" CssClass="-required-input -wrapper" Disabled="true" />

        <fieldset runat="server" id="DefaultAuthMethodsMarkup" class="-wrapper" style="min-width: max-content">
            <legend>روش ورود:</legend>

            <div class="row">


                <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                    <label class="-ds-rb" for="<%= UsernamePassword_RB.ClientID %>">
                        <span>نام کاربری و پسورد </span>
                    </label>
                    <input runat="server" type="radio" id="UsernamePassword_RB"  value="username and password" checked />
                </div>

                <div class="-auth-method col-sm-12 col-md-6 col-lg-6">
                    <label class="-ds-rb" for="<%= DigitalSignature_RB.ClientID %>">
                        <span>امضای دیجیتالی </span>
                    </label>
                    <input runat="server" type="radio" id="DigitalSignature_RB" class="-dig-sig-rb"  value="digital signature" TargetAuthMethod />
                </div>

            </div>

        </fieldset>

        <asp:PlaceHolder runat="server" ID="CustomTemplate_PH" />

        <asp:Button runat="server" ID="Submit_BTN" class="btn btn-success submit-btn" Text="Submit" />
    </div>

</div>



