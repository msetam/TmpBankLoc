<%@ Page Title="" Language="vb" AutoEventWireup="false" MasterPageFile="~/Errors/Errors.Master" CodeBehind="GeneralError.aspx.vb" Inherits="TmpBank.Pages.GeneralError" %>

<asp:Content ContentPlaceHolderID="ErrorCode" runat="server">
    <span runat="server" id="ErrorCode_View" />
</asp:Content>
<asp:Content ContentPlaceHolderID="ErrorDescription" runat="server">
    <span runat="server" id="ErrorDescription_View" />
</asp:Content>
