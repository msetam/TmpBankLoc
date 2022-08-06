<%@ Page Title="" Language="vb" AutoEventWireup="false" MasterPageFile="~/Account/Account.Master" CodeBehind="Transactions.aspx.vb" Inherits="TmpBank.Pages.Transactions" %>

<%@ Import Namespace="TmpBankService.Logic" %>
<%@ Import Namespace="TmpBankService.Models" %>
<asp:Content ID="Main_View" ContentPlaceHolderID="MainContent" runat="server">
    <asp:GridView
        runat="server"
        ID="TransactionsGrid"
        AutoGenerateColumns="false"
        ItemType="TmpBankService.Models.Transaction"
        SelectMethod="TransactionsGrid_GetData"
        CssClass="table table-striped table-bordered table-responsive">
        <Columns>
            <asp:BoundField DataField="PublicTransactionId" HeaderText="ID" SortExpression="TransactionID"/>
            <asp:TemplateField HeaderText="issuer">
                <ItemTemplate>
                    <asp:Label runat="server" Text="<%#: Item.User.UserName%>"/>
                </ItemTemplate>
            </asp:TemplateField>
            <asp:BoundField DataField="Method" HeaderText="Method"/>
            <asp:BoundField DataField="Amount" HeaderText="amount"/>
        </Columns>
    </asp:GridView>
</asp:Content>