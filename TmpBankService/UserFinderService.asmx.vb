Imports System.ComponentModel
Imports System.Web.Services
Imports System.Web.Services.Protocols


Namespace Service


    ' To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line.
    <System.Web.Script.Services.ScriptService()>
    <System.Web.Services.WebService(Namespace:="http://localhost:5288")>
    <System.Web.Services.WebServiceBinding(ConformsTo:=WsiProfiles.None)>
    <ToolboxItem(False)>
    Public Class UserFinderService
        Inherits System.Web.Services.WebService
        Implements Interfaces.IUserFinder

        Public Const USER_FINDER_HISTORY_KEY = "find_history"

        <WebMethod(EnableSession:=True)>
        Public Function FindUser(partialName As String) As Models.SearchResult Implements Interfaces.IUserFinder.FindUser
            If String.IsNullOrEmpty(partialName) Then
                Dim history As List(Of Models.SearchHistory) = GetSearchHistory()
                Return New Models.SearchResult With {.Result = "not found", .History = history}
            End If
            Using userActions As New Logic.UserActions

                Dim result As String = If(userActions.FindUser(partialName, True)?.UserName, "not found")

                Dim history As List(Of Models.SearchHistory) = GetSearchHistory()
                history.Add(New Models.SearchHistory With {.Username = partialName, .Result = result})
                Session(USER_FINDER_HISTORY_KEY) = history

                Return New Models.SearchResult With {.Result = result, .History = history}
            End Using
        End Function



        <WebMethod(EnableSession:=True)>
        Public Function SayHi() As String Implements Interfaces.IUserFinder.SayHi
            Return "Hi"
        End Function


        Private Function GetSearchHistory() As List(Of Models.SearchHistory)
            Dim history As List(Of Models.SearchHistory) = Session(USER_FINDER_HISTORY_KEY)
            Return If(history, New List(Of Models.SearchHistory))
        End Function


    End Class

End Namespace