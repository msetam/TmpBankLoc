<%@ Page Title="Home Page" Language="VB" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.vb" Inherits="TmpBank.Pages._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">

    <div class="jumbotron">
        <h1>Temp Bank</h1>
        <p class="lead">Your new TMPBank service is now live and in action.</p>
    </div>

    <div class="row">
        <div class="col-sm-12 col-md-6">
            <h2>Getting Started</h2>
            <p>
                We let you login/signup (Don't worry your passwords are SHA256 hashed with some tasty salt)
            </p>
            <asp:HyperLink class="btn btn-default" runat="server" ID="LoginAnchor_View" Text="Goto Login/Signup Page" />
        </div>
        <div class="col-sm-12 col-md-6">
            <h2>User Management</h2>
            <p>
                and add/remove/edit (CRUDE) transactions
            </p>
            <p>
                <asp:HyperLink class="btn btn-default" runat="server" ID="TransactionsAnchor_View" Text="Goto Transactions Page" />
            </p>
        </div>
    </div>

</asp:Content>
