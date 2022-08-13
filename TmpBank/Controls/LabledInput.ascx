<%@ Control Language="vb" AutoEventWireup="false" CodeBehind="LabledInput.ascx.vb" Inherits="TmpBank.Controls.LabeldInput" %>

<div class="form-group" runat="server" ID="Wrapper">
    <asp:Label runat="server" ID="Label_View" CssClass="col-sm-2 control-label col-md-1" AsoosiatedControlId="Input_View"/>
    <asp:TextBox ID="Input_View" CssClass="form-control col-sm-7 col-md-8" runat="server" />
</div>
