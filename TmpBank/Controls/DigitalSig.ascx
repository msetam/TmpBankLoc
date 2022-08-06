<%@ Control Language="vb" AutoEventWireup="false" CodeBehind="DigitalSig.ascx.vb" Inherits="TmpBank.Controls.DigitalSig" %>
<%@ Register TagPrefix="mp" TagName="MasterPage" Src="~/Site.master" %>
<%@ Register Src="~/Controls/LabledInput.ascx" TagName="LabledInput" TagPrefix="uc" %>


<div runat="server" id="DigSigWrapper">

    <uc:LabledInput runat="server" ID="NationalCode_UC" PlaceHolderText="National Code" Name="National Code" CssClass="-required-input" Disabled="true" />

    <fieldset class="-auth-method-selector">
        <legend>Select authentication method:</legend>

        <div class="form-group">
            <label class="radio-inline" for="<%= DigitalSignature.ClientID %>">
                digital signature
       
            </label>
            <input runat="server" type="radio" id="DigitalSignature" class="-dig-sig-rb" name="auth-method" value="digital signature" />

            <label class="radio-inline" for="<%= UsernamePassword.ClientID %>">
                username and password
       
            </label>
            <input runat="server" type="radio" id="UsernamePassword" name="auth-method" value="username and password" checked />

        </div>



    </fieldset>

    <input runat="server" id="Submit_BTN" class="btn btn-success submit-btn" type="button" value="submit" />

    <asp:PlaceHolder runat="server" ID="CustomTemplate_PH" />
</div>
