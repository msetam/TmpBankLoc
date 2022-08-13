<%@ Page Title="" Language="vb" AutoEventWireup="false" MasterPageFile="~/Account/Account.Master" CodeBehind="FindUser.aspx.vb" Inherits="TmpBank.Pages.FindUser" %>


<asp:Content ID="Head_Section" ContentPlaceHolderID="HeadContent" runat="server">

    <script defer type="text/javascript">

        let lastInputTime = null;
        let submitBtn = null;
        let inputUsername = null;
        let resultUsername = null;

        function pageLoad() {
            submitBtn = $('#<%= Submit_View.ClientID %>');
            inputUsername = $('.input-username');
            resultUsername = $('.result-username');
            addOnUserInputChangedListener();
            inputUsername.focus();
            moveCursorToEnd(inputUsername);
        }

        function moveCursorToEnd(inputElement) {
            const tmp = inputElement.val();
            inputElement.val("");
            inputElement.val(tmp);
        }

        function addOnUserInputChangedListener() {
            inputUsername.on('input', () => {
                if (lastInputTime && (Date.now() - lastInputTime) > 200) {
                    if (false) {
                        TmpBankService.Service.UserFinderService.FindUser(
                            inputUsername.val(),
                            (response) => {
                                resultUsername.text(response.Result);
                            },
                            (errors) => console.log(errors)
                        );
                    } else {
                        $.ajax({
                            url: "http://localhost:5288/UserFinderService.asmx/FindUser",
                            method: 'POST',
                            data: `{ "partialName": "${inputUsername.val()}" }`,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: (response) => {
                                resultUsername.text($(response)[0].d.Result);
                                console.log(response);
                            },
                            error: (errors) => console.log(errors),
                            xhrFields: {
                                withCredentials: true
                            }
                        });
                    }
                }
                lastInputTime = Date.now();
            });
        }

    </script>

</asp:Content>


<asp:Content ID="Main_Sections" ContentPlaceHolderID="MainContent" runat="server">
    <asp:ScriptManagerProxy runat="server">
        <Services>
            <asp:ServiceReference runat="server" Path="http://localhost:5288/UserFinderService.asmx" />
        </Services>
    </asp:ScriptManagerProxy>

    <h5>Search users by their username</h5>
    <asp:UpdatePanel runat="server" ID="UserFinderPanel">
        <ContentTemplate>
            <div class="form-group form-inline">
                <asp:TextBox runat="server" CssClass="form-control input-username" ID="Username_View" placeholder="username" />
                <asp:Button Text="submit" CssClass="btn btn-primary" ID="Submit_View" runat="server" />
                <asp:Label runat="server" ID="Result_View" CssClass="result-username" Text="Nothing Found" />
                <asp:ListView runat="server" ID="HistoryList_View">
                    <ItemTemplate>
                        <div class="row">
                            <asp:Label runat="server" ID="HistoryUsername_View" CssClass="col-md-6" Text='<%#: Eval("Username") %>' />
                            <asp:Label runat="server" ID="HistoryResult_View" CssClass="col-md-6" Text='<%#: Eval("Result") %>' />
                        </div>
                    </ItemTemplate>
                </asp:ListView>
            </div>
        </ContentTemplate>
    </asp:UpdatePanel>

</asp:Content>
